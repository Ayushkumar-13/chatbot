import { createContext, useContext, useEffect, useRef, useState } from "react";
import { AuthContext } from "./AuthContext";
import toast from "react-hot-toast";

export const CallContext = createContext();

const ICE_SERVERS = {
    iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
    ]
};

export const CallProvider = ({ children }) => {
    const { socket, authUser } = useContext(AuthContext);
    const [callState, setCallState] = useState(null);
    // callState: { type, status, remoteUser, callData }
    // status: 'calling' | 'incoming' | 'in-call'

    const [localStream, setLocalStream] = useState(null);
    const [remoteStreams, setRemoteStreams] = useState({}); // { userId: stream }
    const [remoteUsers, setRemoteUsers] = useState({}); // { userId: userObject }

    const pcsRef = useRef(new Map()); // Map<userId, RTCPeerConnection>
    const localVideoRef = useRef(null);

    // ── Create Peer Connection ───────────────────────────────────────────
    const createPeer = (targetUserId, stream) => {
        if (pcsRef.current.has(targetUserId)) {
            pcsRef.current.get(targetUserId).close();
        }

        const pc = new RTCPeerConnection(ICE_SERVERS);
        pcsRef.current.set(targetUserId, pc);

        if (stream) {
            stream.getTracks().forEach(t => pc.addTrack(t, stream));
        }

        pc.onicecandidate = (e) => {
            if (e.candidate) {
                socket.emit("call:ice-candidate", {
                    to: targetUserId,
                    candidate: e.candidate
                });
            }
        };

        pc.ontrack = (e) => {
            setRemoteStreams(prev => ({
                ...prev,
                [targetUserId]: e.streams[0]
            }));
        };

        pc.onconnectionstatechange = () => {
            if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed' || pc.connectionState === 'closed') {
                removePeer(targetUserId);
            }
        };

        return pc;
    };

    const removePeer = (userId) => {
        if (pcsRef.current.has(userId)) {
            pcsRef.current.get(userId).close();
            pcsRef.current.delete(userId);
        }
        setRemoteStreams(prev => {
            const next = { ...prev };
            delete next[userId];
            return next;
        });
        setRemoteUsers(prev => {
            const next = { ...prev };
            delete next[userId];
            return next;
        });
    };

    // ── Start Call (Initiator) ───────────────────────────────────────────
    const startCall = async (target, type = "video") => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: type === "video" ? { facingMode: 'user' } : false,
                audio: true
            });
            setLocalStream(stream);

            // If target is an array (group), call everyone
            const targets = Array.isArray(target) ? target : [target];
            
            for (const user of targets) {
                if (user._id === authUser._id) continue;
                
                const pc = createPeer(user._id, stream);
                const offer = await pc.createOffer();
                await pc.setLocalDescription(offer);

                socket.emit("call:offer", {
                    to: user._id,
                    offer,
                    callType: type,
                    callerInfo: {
                        _id: authUser._id,
                        fullName: authUser.fullName,
                        profilePic: authUser.profilePic
                    }
                });
                
                setRemoteUsers(prev => ({ ...prev, [user._id]: user }));
            }

            setCallState({ 
                type, 
                status: "calling", 
                remoteUser: Array.isArray(target) ? { fullName: "Group Call", _id: "group" } : target 
            });
        } catch (err) {
            toast.error("Could not access camera/microphone");
            console.error(err);
        }
    };

    // ── Answer Call ──────────────────────────────────────────────────────
    const answerCall = async () => {
        if (!callState?.callData) return;
        const { callData } = callState;
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: callData.callType === "video" ? { facingMode: 'user' } : false,
                audio: true
            });
            setLocalStream(stream);

            const pc = createPeer(callData.from, stream);
            await pc.setRemoteDescription(new RTCSessionDescription(callData.offer));
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);

            socket.emit("call:answer", {
                to: callData.from,
                answer
            });

            setRemoteUsers(prev => ({ ...prev, [callData.from]: callData.callerInfo }));
            setCallState(prev => ({ ...prev, status: "in-call" }));
        } catch (err) {
            toast.error("Could not access camera/microphone");
            console.error(err);
        }
    };

    const rejectCall = () => {
        if (callState?.callData) {
            socket.emit("call:rejected", { to: callState.callData.from });
        }
        cleanup();
    };

    const endCall = () => {
        pcsRef.current.forEach((pc, userId) => {
            socket.emit("call:ended", { to: userId });
        });
        cleanup();
    };

    const toggleMute = () => {
        if (localStream) {
            localStream.getAudioTracks().forEach(t => t.enabled = !t.enabled);
        }
    };

    const toggleCamera = () => {
        if (localStream) {
            localStream.getVideoTracks().forEach(t => t.enabled = !t.enabled);
        }
    };

    const cleanup = () => {
        pcsRef.current.forEach(pc => pc.close());
        pcsRef.current.clear();
        if (localStream) {
            localStream.getTracks().forEach(t => t.stop());
            setLocalStream(null);
        }
        setRemoteStreams({});
        setRemoteUsers({});
        setCallState(null);
    };

    // ── Listen to Socket Events ──────────────────────────────────────────
    useEffect(() => {
        if (!socket) return;

        socket.on("call:incoming", (data) => {
            setCallState({
                type: data.callType,
                status: "incoming",
                remoteUser: data.callerInfo,
                callData: data
            });
        });

        socket.on("call:answered", async (data) => {
            const pc = pcsRef.current.get(data.from);
            if (pc) {
                await pc.setRemoteDescription(new RTCSessionDescription(data.answer));
            }
            setCallState(prev => ({ ...prev, status: "in-call" }));
        });

        socket.on("call:ice-candidate", async (data) => {
            const pc = pcsRef.current.get(data.from);
            if (pc && data.candidate) {
                await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
            }
        });

        socket.on("call:rejected", (data) => {
            toast(`${remoteUsers[data.from]?.fullName || 'User'} rejected the call`);
            removePeer(data.from);
            if (pcsRef.current.size === 0) cleanup();
        });

        socket.on("call:ended", (data) => {
            removePeer(data.from);
            if (pcsRef.current.size === 0) {
                toast("Call ended");
                cleanup();
            }
        });

        return () => {
            socket.off("call:incoming");
            socket.off("call:answered");
            socket.off("call:ice-candidate");
            socket.off("call:rejected");
            socket.off("call:ended");
        };
    }, [socket, remoteUsers]);

    return (
        <CallContext.Provider value={{
            callState, localStream, remoteStreams, remoteUsers,
            localVideoRef,
            startCall, answerCall, rejectCall, endCall,
            toggleMute, toggleCamera
        }}>
            {children}
        </CallContext.Provider>
    );
};
