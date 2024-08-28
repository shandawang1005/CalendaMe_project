import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchFriendsListThunk } from "../../redux/friends"; // Assuming you have a thunk for fetching friends
import ChatModal from "../ChatComponent/ChatModal";
import "./MessagesPage.css";

function MessagesPage() {
  const navigate = useNavigate();
  const user = useSelector((state) => state.session.user);
  useEffect(() => {
    if (!user) {
      navigate("/");
    }
  }, [user, navigate]);
  const dispatch = useDispatch();
  const loggedInUser = useSelector((state) => state.session.user);
  const friends = useSelector((state) => state.friends.accepted);
  const [selectedFriend, setSelectedFriend] = useState(null);

  useEffect(() => {
    if (loggedInUser) {
      dispatch(fetchFriendsListThunk());
    }
  }, [dispatch, loggedInUser]);

  const handleFriendSelect = (friend) => {
    setSelectedFriend(friend);
  };

  return (
    <div className="messages-page-container">
      <div className="friend-list-container">
        <h2>Select a Friend to Chat</h2>
        <ul className="friend-list-ul">
          {friends && friends.length > 0 ? (
            friends.map((friend) => (
              <li
                key={friend.id}
                onClick={() => handleFriendSelect(friend)}
                className={`friend-list-item ${
                  selectedFriend?.id === friend.id
                    ? "friend-list-item-selected"
                    : ""
                }`}
              >
                {friend.username[0].toUpperCase() +
                  friend.username
                    .slice(1, friend.username.length)
                    .toLowerCase()}
              </li>
            ))
          ) : (
            <p>No friends available.</p>
          )}
        </ul>
      </div>

      <div className="chat-container">
        {loggedInUser && selectedFriend ? (
          <ChatModal currentUser={loggedInUser} friend={selectedFriend} />
        ) : (
          <p>Select a friend to start chatting.</p>
        )}
      </div>
    </div>
  );
}

export default MessagesPage;
