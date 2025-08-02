import { createContext, useEffect, useState, useContext } from "react";
import axios from "axios"
import toast from "react-hot-toast";
import {io} from "socket.io-client"


const backendUrl = import.meta.env.VITE_BACKEND_URL;
axios.defaults.baseURL = backendUrl

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {

    const [token, setToken] = useState(localStorage.getItem("token"));
    const [authUser, setAuthUser] = useState(null);
    const [onlineUser, setOnlineUser] = useState([]);
    const [socket, setSocket] = useState(null);
        const [loading, setLoading] = useState(true); // ✅ Add this

    // Check if user is authenticated and if so, set the user data and connect the socket
    const checkAuth = async () => {
        try {
            const { data } = await axios.get("/api/auth/check")
            if (data.success) {
                setAuthUser(data.user)
                connectSocket(data.user)
            }
        } catch (error) {
            toast.error(error.message)
        } finally{
             setLoading(false); // ✅ Mark loading complete
        }
    }

    // Login function to handle user authentication and socket connection 
   // inside AuthContext.jsx
const login = async (type, data) => {
    try {
        const res = await axios.post(`/api/auth/${type}`, data);

        // Save token and set it in axios headers
        localStorage.setItem('token', res.data.token);
        setToken(res.data.token);
        axios.defaults.headers.common["token"] = res.data.token;

        // Save user and connect socket
        setAuthUser(res.data.user);
        connectSocket(res.data.user);

        return { success: true };
    } catch (err) {
        console.error("Login error:", err);
        return { success: false };
    }
};


    // Logout function to handle user logout and socket disconnection 
    const logout = async () => {
        localStorage.removeItem("token")
        setToken(null);
        setAuthUser(null);
        setOnlineUser([]);
        axios.defaults.headers.common["token"] = null;
        toast.success("Logged Out Successfully")
        if (socket) socket.disconnect();
    }

    //  Update Profile function to handle user profile updates
    const updateProfile = async (body) => {
        try {
            const {data} = await axios.put("api/auth/update-profile", body)
            if (data.success){
                setAuthUser(data.user)
                toast.success("Profile updated successfully")
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    //  Connect Socket function to handle socket connection and online users updates 
    const connectSocket = (userData) => {
        if (!userData || socket ?.connected)  return;
        const newSocket = io(backendUrl, {
            query: {
                userId : userData._id,
            }
        });
        newSocket.connect();
        setSocket(newSocket);

        newSocket.on("getOnlineUsers",(userIds) => {
            setOnlineUser(userIds);
        })
    }
    useEffect(() => {
        if (token){
            axios.defaults.headers.common["token"] = token;
            checkAuth();
        }  else {
            setLoading(false); // ✅ No token, still end loading
        }
    }, [token])

    const value = {
        axios,
        authUser,
        onlineUser,
        socket,
        login,
        logout,
        updateProfile,
          loading // ✅ Export loading
    }
    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}