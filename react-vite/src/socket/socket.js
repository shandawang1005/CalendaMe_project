import { io } from "socket.io-client";

// Connect to the Socket.IO server (make sure to change the URL if necessary)
const socket = io("http://localhost:8000", {
  withCredentials: true, // Ensure credentials (such as cookies) are sent with requests
});

export default socket;
