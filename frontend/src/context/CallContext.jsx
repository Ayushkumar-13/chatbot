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
    const [remoteStream, setRemoteStream] = useState(null);

    const pcRef = useRef(null); // RTCPeerConnection
    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);

    // ── Create Peer Connection ───────────────────────────────────────────
    const createPeer = (targetUserId) => {
        const pc = new RTCPeerConnection(ICE_SERVERS);
        pcRef.current = pc;

        pc.onicecandidate = (e) => {
            if (e.candidate) {
                socket.emit("call:ice-candidate", {
                    to: targetUserId,
                    candidate: e.candidate
                });
            }
        };

        pc.ontrack = (e) => {
            setRemoteStream(e.streams[0]);
        };

        return pc;
    };

    // ── Start Call (caller side) ─────────────────────────────────────────
    const startCall = async (targetUser, type = "video") => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: type === "video",
                audio: true
            });
            setLocalStream(stream);

            const pc = createPeer(targetUser._id);
            stream.getTracks().forEach(t => pc.addTrack(t, stream));

            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);

            socket.emit("call:offer", {
                to: targetUser._id,
                offer,
                callType: type,
                callerInfo: {
                    _id: authUser._id,
                    fullName: authUser.fullName,
                    profilePic: authUser.profilePic
                }
            });

            setCallState({ type, status: "calling", remoteUser: targetUser });
        } catch (err) {
            toast.error("Could not access camera/microphone");
            console.error(err);
        }
    };

    // ── Answer Call (receiver side) ──────────────────────────────────────
    const answerCall = async () => {
        if (!callState?.callData) return;
        const { callData } = callState;
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: callData.callType === "video",
                audio: true
            });
            setLocalStream(stream);

            const pc = createPeer(callData.from);
            stream.getTracks().forEach(t => pc.addTrack(t, stream));

            await pc.setRemoteDescription(new RTCSessionDescription(callData.offer));
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);

            socket.emit("call:answer", {
                to: callData.from,
                answer
            });

            setCallState(prev => ({ ...prev, status: "in-call" }));
        } catch (err) {
            toast.error("Could not access camera/microphone");
            console.error(err);
        }
    };

    // ── Reject Call ──────────────────────────────────────────────────────
    const rejectCall = () => {
        if (callState?.callData) {
            socket.emit("call:rejected", { to: callState.callData.from });
        }
        cleanup();
    };

    // ── End Call ─────────────────────────────────────────────────────────
    const endCall = () => {
        if (callState?.remoteUser) {
            socket.emit("call:ended", { to: callState.remoteUser._id });
        }
        cleanup();
    };

    // ── Toggle Mute ───────────────────────────────────────────────────────
    const toggleMute = () => {
        if (localStream) {
            localStream.getAudioTracks().forEach(t => {
                t.enabled = !t.enabled;
            });
        }
    };

    // ── Toggle Camera ─────────────────────────────────────────────────────
    const toggleCamera = () => {
        if (localStream) {
            localStream.getVideoTracks().forEach(t => {
                t.enabled = !t.enabled;
            });
        }
    };

    // ── Cleanup ──────────────────────────────────────────────────────────
    const cleanup = () => {
        if (pcRef.current) {
            pcRef.current.close();
            pcRef.current = null;
        }
        if (localStream) {
            localStream.getTracks().forEach(t => t.stop());
            setLocalStream(null);
        }
        setRemoteStream(null);
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
            if (pcRef.current) {
                await pcRef.current.setRemoteDescription(
                    new RTCSessionDescription(data.answer)
                );
            }
            setCallState(prev => ({ ...prev, status: "in-call" }));
        });

        socket.on("call:ice-candidate", async (data) => {
            if (pcRef.current && data.candidate) {
                await pcRef.current.addIceCandidate(
                    new RTCIceCandidate(data.candidate)
                );
            }
        });

        socket.on("call:rejected", () => {
            toast("Call rejected", { icon: "📵" });
            cleanup();
        });

        socket.on("call:ended", () => {
            toast("Call ended", { icon: "📞" });
            cleanup();
        });

        return () => {
            socket.off("call:incoming");
            socket.off("call:answered");
            socket.off("call:ice-candidate");
            socket.off("call:rejected");
            socket.off("call:ended");
        };
    }, [socket]);

    // Attach streams to video elements when they change
    useEffect(() => {
        if (localVideoRef.current && localStream) {
            localVideoRef.current.srcObject = localStream;
        }
    }, [localStream]);

    useEffect(() => {
        if (remoteVideoRef.current && remoteStream) {
            remoteVideoRef.current.srcObject = remoteStream;
        }
    }, [remoteStream]);

    return (
        <CallContext.Provider value={{
            callState, localStream, remoteStream,
            localVideoRef, remoteVideoRef,
            startCall, answerCall, rejectCall, endCall,
            toggleMute, toggleCamera
        }}>
            {children}
        </CallContext.Provider>
    );
};
