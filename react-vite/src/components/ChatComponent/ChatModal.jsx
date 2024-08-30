import { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { io } from "socket.io-client";
import {
  fetchMessages,
  sendMessage,
  deleteMessage,
  clearChatHistory,
} from "../../redux/messages";
import {
  fetchFiles,
  deleteFile,
  uploadFileRequest,
  uploadFileSuccess,
  uploadFileFailure,
  shareFileRequest,
  shareFileSuccess,
  shareFileFailure,
} from "../../redux/aws";
import "./ChatModal.css";
//hope it works
const ChatModal = ({ currentUser, friend }) => {
  const dispatch = useDispatch();
  const chatHistory = useSelector((state) => state.messages.messages);
  const { uploading, sharing, files, filesLoading, deleting } = useSelector(
    (state) => state.file
  );
  const [message, setMessage] = useState("");
  const [socket, setSocket] = useState(null);
  const [file, setFile] = useState(null);
  const [showFilesModal, setShowFilesModal] = useState(false);
  const [contextMenu, setContextMenu] = useState(null);
  const chatHistoryRef = useRef(null);
  const filesModalRef = useRef(null);
  const contextMenuRef = useRef(null);

  // Establish WebSocket connection
  useEffect(() => {
    if (currentUser) {
      const newSocket = io("https://calendame.onrender.com", {
        transports: ["websocket", "polling"],
      });
      setSocket(newSocket);

      newSocket.emit("join", { user_id: currentUser.id });

      return () => {
        newSocket.emit("leave", { user_id: currentUser.id });
        newSocket.disconnect();
      };
    }
  }, [currentUser]);

  // Fetch messages and files when a friend is selected
  useEffect(() => {
    if (friend?.id) {
      dispatch(fetchMessages(friend.id));
      dispatch(fetchFiles(friend.id)); // Fetch shared files when a friend is selected
    }
  }, [dispatch, friend?.id]);

  // Handle incoming messages via WebSocket
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

  // Scroll chat history to the bottom when new messages arrive
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
        message,
      };

      dispatch(sendMessage(messageData))
        .then(() => {
          socket.emit("private_message", messageData);
          setMessage("");
        })
        .catch((error) => {
          console.error("Failed to send message:", error);
        });
    }
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSendFile = async () => {
    if (file && friend) {
      dispatch(uploadFileRequest());

      const formData = new FormData();
      formData.append("file", file);

      try {
        // Upload the file to AWS S3
        const uploadResponse = await fetch("/api/aws/upload", {
          method: "POST",
          body: formData,
        });

        if (!uploadResponse.ok) {
          throw new Error("File upload failed");
        }

        const uploadData = await uploadResponse.json();
        const fileUrl = uploadData.file_url;
        dispatch(uploadFileSuccess(fileUrl));

        // After successful upload, share the file with the friend by storing the info in your backend
        dispatch(shareFileRequest());

        const shareResponse = await fetch("/api/aws/share", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            file_url: fileUrl,
            friend_id: friend.id,
          }),
        });

        if (!shareResponse.ok) {
          throw new Error("File sharing failed");
        }

        dispatch(shareFileSuccess());
        dispatch(fetchFiles(friend.id)); // Re-fetch files after sharing a new one

        // Reset the selected file
        setFile(null);

        // Optionally, you can reset the file input element as well
        document.querySelector("input[type='file']").value = null;
      } catch (error) {
        dispatch(uploadFileFailure(error.message || "Upload failed"));
        dispatch(shareFileFailure(error.message || "Share failed"));
      }
    }
  };

  const handleDeleteFile = (fileId, fileUrl) => {
    if (confirm("Are you sure you want to delete this file?")) {
      dispatch(deleteFile(fileId, fileUrl)).then(() => {
        dispatch(fetchFiles(friend.id)); // Re-fetch files after deletion
      });
    }
  };

  const toggleFilesModal = () => {
    setShowFilesModal((prev) => !prev);

    if (!showFilesModal && friend?.id) {
      // Fetch files only when opening the modal
      dispatch(fetchFiles(friend.id));
    }
  };

  // Close file modal when clicking outside of it
  const handleClickOutsideFilesModal = (event) => {
    if (

      //this line is neccessary 
      filesModalRef.current &&
      !filesModalRef.current.contains(event.target) &&
      !event.target.closest(".toggle-files-button")
    ) {
      setShowFilesModal(false);
    }
  };

  useEffect(() => {
    if (showFilesModal) {
      document.addEventListener("mousedown", handleClickOutsideFilesModal);
    } else {
      document.removeEventListener("mousedown", handleClickOutsideFilesModal);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutsideFilesModal);
    };
  }, [showFilesModal]);

  const handleContextMenu = (event, messageId) => {
    event.preventDefault();
    const { clientX: mouseX, clientY: mouseY } = event;

    const contextMenuWidth = 150; // Assume the width of context menu
    const contextMenuHeight = 50; // Assume the height of context menu

    let positionX = mouseX;
    let positionY = mouseY;

    if (window.innerWidth - mouseX < contextMenuWidth) {
      positionX = mouseX - contextMenuWidth;
    }

    if (window.innerHeight - mouseY < contextMenuHeight) {
      positionY = mouseY - contextMenuHeight;
    }

    setContextMenu({
      messageId,
      xPos: positionX,
      yPos: positionY,
    });
  };

  const handleDeleteMessage = () => {
    if (contextMenu && contextMenu.messageId) {
      dispatch(deleteMessage(contextMenu.messageId));
      setContextMenu(null); // Close context menu
    }
  };

  const handleClearChatHistory = () => {
    dispatch(clearChatHistory(friend.id));
  };

  const handleClickOutsideContextMenu = (event) => {
    if (
      contextMenuRef.current &&
      !contextMenuRef.current.contains(event.target)
    ) {
      setContextMenu(null);
    }
  };

  useEffect(() => {
    if (contextMenu) {
      document.addEventListener("mousedown", handleClickOutsideContextMenu);
    } else {
      document.removeEventListener("mousedown", handleClickOutsideContextMenu);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutsideContextMenu);
    };
  }, [contextMenu]);

  return (
    <div className="chat-modal">
      <div className="chat-box-container">
        {friend ? (
          <>
            <div className="chat-header">
              <h3 className="chat-heading">
                Chat with{" "}
                {friend.username[0].toUpperCase() + friend.username.slice(1)}
              </h3>
              <button
                onClick={handleClearChatHistory}
                className="clear-chat-button"
              >
                Clear Chat History
              </button>
            </div>

            {/* Chat History */}
            <div className="chat-history-container" ref={chatHistoryRef}>
              {chatHistory.map((message, index) => (
                <div
                  key={index}
                  className={
                    message.sender_id === currentUser.id
                      ? "chat-message-sent"
                      : "chat-message-received"
                  }
                  onContextMenu={(e) => handleContextMenu(e, message.id)}
                >
                  {message.sender_id === currentUser.id
                    ? "You"
                    : friend.username}
                  : {message.content}
                </div>
              ))}
            </div>

            {/* Context Menu */}
            {contextMenu && (
              <ul
                className="context-menu"
                style={{ top: contextMenu.yPos, left: contextMenu.xPos }}
                ref={contextMenuRef}
              >
                <li className="context-menu-item" onClick={handleDeleteMessage}>
                  Delete Message
                </li>
              </ul>
            )}

            {/* Toggleable File List Button */}
            <button
              onClick={(e) => {
                e.stopPropagation(); // Prevent the click event from propagating
                toggleFilesModal();
              }}
              className="toggle-files-button"
            >
              {showFilesModal ? "Hide Files" : "Show Files"}
            </button>

            {/* Shared Files Modal */}
            {showFilesModal && (
              <div className="files-modal" ref={filesModalRef}>
                <div className="files-modal-content">
                  <h4>Shared Files</h4>
                  {filesLoading ? (
                    <p>Loading files...</p>
                  ) : files.length > 0 ? (
                    files.map((file) => (
                      <div key={file.id} className="file-item-container">
                        <a
                          href={file.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {file.file_url.split("/").pop()}
                        </a>{" "}
                        - Shared by{" "}
                        {file.owner_id === currentUser.id
                          ? "You"
                          : friend.username}
                        {file.owner_id === currentUser.id && (
                          <button
                            onClick={() =>
                              handleDeleteFile(file.id, file.file_url)
                            }
                            disabled={deleting}
                            className="delete-file-button"
                          >
                            {deleting ? "Deleting..." : "Delete"}
                          </button>
                        )}
                      </div>
                    ))
                  ) : (
                    <p>No files shared yet</p>
                  )}
                  <button
                    className="close-files-modal-button"
                    onClick={() => setShowFilesModal(false)}
                  >
                    Close
                  </button>
                </div>
              </div>
            )}

            {/* Input Section */}
            <div
              className="chat-input-container"
              onDrop={(e) => {
                e.preventDefault();
                const droppedFile = e.dataTransfer.files[0];
                setFile(droppedFile);
              }}
              onDragOver={(e) => e.preventDefault()}
            >
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message..."
                className="chat-input-field"
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
              />
              <label className="file-input-label">
                {file ? file.name : "Select File"}
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="file-input"
                />
              </label>
              <button onClick={handleSendFile} className="chat-send-button">
                {uploading || sharing ? "Uploading..." : "Send File"}
              </button>
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
