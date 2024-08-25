import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import "./ChatModal.css";

const ChatModal = ({ currentUser, friend }) => {
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (currentUser) {
      // Initialize the WebSocket connection
      const newSocket = io("http://localhost:8000");
      setSocket(newSocket);

      // Join user's room
      newSocket.emit("join", { user_id: currentUser.id });

      // Handle WebSocket errors
      newSocket.on("connect_error", (error) => {
        console.error("WebSocket Connection Error:", error);
      });

      newSocket.on("disconnect", () => {
        console.log("WebSocket disconnected");
      });

      // Cleanup on component unmount
      return () => {
        newSocket.emit("leave", { user_id: currentUser.id });
        newSocket.disconnect();
      };
    }
  }, [currentUser]);

  useEffect(() => {
    if (socket && friend) {
      // Listen for incoming messages when a friend is selected
      socket.on("new_message", (data) => {
        setChatHistory((prevHistory) => [
          ...prevHistory,
          {
            sender: data.sender_id === currentUser.id ? "You" : friend.username,
            message: data.message,
          },
        ]);
      });

      // Cleanup listener when the friend or socket changes
      return () => {
        socket.off("new_message");
      };
    }
  }, [socket, friend, currentUser]);

  const handleSendMessage = () => {
    if (message.trim() && friend && socket) {
      // Send message via WebSocket
      const messageData = {
        sender_id: currentUser.id,
        recipient_id: friend.id,
        message,
      };
      socket.emit("private_message", messageData);

      // Update chat history locally
      setChatHistory((prevHistory) => [
        ...prevHistory,
        { sender: "You", message },
      ]);
      setMessage("");
    }
  };

  return (
    <div className="chat-modal">
      <div className="chat-box-container">
        {friend ? (
          <>
            <h3 className="chat-heading">Chat with {friend.username}</h3>
            <div className="chat-history-container">
              {chatHistory.map((chat, index) => (
                <div
                  key={index}
                  className={
                    chat.sender === "You"
                      ? "chat-message-sent"
                      : "chat-message-received"
                  }
                >
                  <strong>{chat.sender}: </strong>
                  {chat.message}
                </div>
              ))}
            </div>
            <div className="chat-input-container">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message..."
                className="chat-input-field"
              />
              <button onClick={handleSendMessage} className="chat-send-button">
                Send
              </button>
            </div>
          </>
        ) : (
          <p>Select a friend to start chatting.</p>
        )}
      </div>
    </div>
  );
};

export default ChatModal;
