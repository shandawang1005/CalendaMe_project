import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchFriendsListThunk,
  removeFriendThunk,
  cancelFriendRequestThunk,
  respondToFriendRequestThunk,
} from "../../redux/friends";
import SearchBarModal from "../SearchBarModal/SearchBarModal";
import "./Friendspage.css"; // Assuming you will add your CSS here

const FriendsPage = () => {
  const dispatch = useDispatch();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const acceptedFriends = useSelector((state) => state.friends.accepted || []);
  const pendingFriends = useSelector((state) => state.friends.pending || []);
  const error = useSelector((state) => state.friends.error);

  // Fetch the list of friends when the component mounts
  useEffect(() => {
    dispatch(fetchFriendsListThunk());
  }, [dispatch]);

  // Handle removing a friend
  const handleRemoveFriend = async (friendId) => {
    await dispatch(removeFriendThunk(friendId));
    dispatch(fetchFriendsListThunk()); // Re-fetch friends after removal
  };

  // Handle canceling a friend request
  const handleCancelRequest = async (friendId) => {
    await dispatch(cancelFriendRequestThunk(friendId));
    dispatch(fetchFriendsListThunk()); // Re-fetch friends after cancelling request
  };

  // Handle responding to a friend request
  const handleRespondToRequest = async (friendId, response) => {
    console.log(
      `Responding to friend request: ${friendId}, response: ${response}`
    );
    await dispatch(respondToFriendRequestThunk(friendId, response));
    dispatch(fetchFriendsListThunk()); // Re-fetch friends after responding to request
  };

  // Open and close the search modal
  const openSearchModal = () => {
    setIsModalOpen(true);
  };

  const closeSearchModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div>
      <h2>Your Friends</h2>

      <h3>Accepted Friends</h3>
      {acceptedFriends.length > 0 ? (
        <ul>
          {acceptedFriends.map((friend) => (
            <li key={friend.id}>
              {friend.username} ({friend.email})
              <button
                className="friend-button remove-button"
                onClick={() => handleRemoveFriend(friend.id)}
              >
                Remove Friend
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p>No accepted friends yet.</p>
      )}

      <h3>Pending Friend Requests</h3>
      {pendingFriends.length > 0 ? (
        <ul>
          {pendingFriends.map((friend) => (
            <li key={friend.id}>
              {friend.username} ({friend.email})
              {friend.isRequestSentByYou ? (
                <button
                  className="friend-button cancel-button"
                  onClick={() => handleCancelRequest(friend.id)}
                >
                  Cancel Request
                </button>
              ) : (
                <div>
                  <button
                    className="friend-button accept-button"
                    onClick={() => handleRespondToRequest(friend.id, "accept")}
                  >
                    Accept
                  </button>
                  <button
                    className="friend-button decline-button"
                    onClick={() => handleRespondToRequest(friend.id, "reject")}
                  >
                    Decline
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p>No pending friend requests.</p>
      )}

      {error && <p style={{ color: "red" }}>Error: {error}</p>}

      <button className="friend-button" onClick={openSearchModal}>
        Search for Friends
      </button>

      <SearchBarModal
        isOpen={isModalOpen}
        onClose={closeSearchModal}
        triggerFetch={() => dispatch(fetchFriendsListThunk())}
      />
    </div>
  );
};

export default FriendsPage;