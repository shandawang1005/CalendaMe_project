import { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { io } from "socket.io-client";
import { fetchMessages, sendMessage } from "../../redux/messages";
import "./ChatModal.css";

const ChatModal = ({ currentUser, friend }) => {
  const dispatch = useDispatch();
  const chatHistory = useSelector((state) => state.messages.messages); // Redux state
  const [message, setMessage] = useState("");
  const [socket, setSocket] = useState(null);
  const chatHistoryRef = useRef(null); // Reference to the chat history container

  // Initialize WebSocket connection
  useEffect(() => {
    if (currentUser) {
      const newSocket = io("https://calendame.onrender.com", {
        transports: ["websocket", "polling"],
      });
      setSocket(newSocket);

      // Join user's room
      newSocket.emit("join", { user_id: currentUser.id });

      // WebSocket error handling
      newSocket.on("connect_error", (error) => {
        console.error("WebSocket Connection Error:", error);
      });

      // Handle WebSocket disconnect
      newSocket.on("disconnect", () => {
        console.log("WebSocket disconnected");
      });

      // Cleanup WebSocket on component unmount
      return () => {
        newSocket.emit("leave", { user_id: currentUser.id });
        newSocket.disconnect();
      };
    }
  }, [currentUser]);

  // Fetch chat history using Redux when friend is selected
  useEffect(() => {
    if (friend?.id) {
      dispatch(fetchMessages(friend.id));
    }
  }, [dispatch, friend?.id]);

  // Listen for new messages via WebSocket and scroll to the bottom
  useEffect(() => {
    if (socket && friend?.id) {
      socket.on("new_message", (data) => {
        if (data.sender_id === friend.id || data.recipient_id === friend.id) {
          dispatch(fetchMessages(friend.id));
        }
      });

      return () => {
        socket.off("new_message");
      };
    }
  }, [socket, friend?.id, currentUser, dispatch]);

  // Scroll to the bottom of the chat history when it updates
  useEffect(() => {
    if (chatHistoryRef.current) {
      chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
    }
  }, [chatHistory]);

  const handleSendMessage = () => {
    if (message.trim() && friend && socket) {
      const messageData = {
        sender_id: currentUser.id,
        recipient_id: friend.id,
        message, // This should be the content of the message
      };

      dispatch(sendMessage(messageData)); // Dispatch the thunk to send the message

      socket.emit("private_message", messageData); // Send message via WebSocket

      setMessage("");
    }
  };

  // Handle "Enter" key press
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  return (
    <div className="chat-modal">
      <div className="chat-box-container">
        {friend ? (
          <>
            <h3 className="chat-heading">
              Chat with{" "}
              {friend.username[0].toUpperCase() + friend.username.slice(1)}
            </h3>
            <div className="chat-history-container" ref={chatHistoryRef}>
              {chatHistory.length > 0 ? (
                chatHistory.map((message, index) => (
                  <div
                    key={index}
                    className={
                      message.sender_id === currentUser.id
                        ? "chat-message-sent"
                        : "chat-message-received"
                    }
                  >
                    {message.sender_id === currentUser.id
                      ? "You"
                      : friend.username[0].toUpperCase() +
                        friend.username
                          .slice(1, friend.username.length)
                          .toLowerCase()}
                    : {message.content}
                  </div>
                ))
              ) : (
                <p>No messages to display</p>
              )}
            </div>
            <div className="chat-input-container">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message..."
                className="chat-input-field"
                onKeyDown={handleKeyPress} // Trigger send on "Enter" key
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
