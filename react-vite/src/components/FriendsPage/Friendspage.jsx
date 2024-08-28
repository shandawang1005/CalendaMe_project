import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchFriendsListThunk,
  removeFriendThunk,
  cancelFriendRequestThunk,
  respondToFriendRequestThunk,
} from "../../redux/friends";
import SearchBarModal from "../SearchBarModal/SearchBarModal";
import ConfirmationModal from "../FriendsPage/ConfirmRemove";
import "./Friendspage.css";
import { useNavigate } from "react-router-dom";

const FriendsPage = () => {
  const navigate = useNavigate();
  const user = useSelector((state) => state.session.user);
  useEffect(() => {
    if (!user) {
      navigate("/");
    }
  }, [user, navigate]);

  const dispatch = useDispatch();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [friendToRemove, setFriendToRemove] = useState(null);
  const [confirmationModalOpen, setConfirmationModalOpen] = useState(false);
  const [loading, setLoading] = useState(true); // Loading state

  const acceptedFriends = useSelector((state) => state.friends.accepted || []);
  const pendingFriends = useSelector((state) => state.friends.pending || []);
  const error = useSelector((state) => state.friends.error);

  // Fetch the list of friends when the component mounts
  useEffect(() => {
    const fetchFriends = async () => {
      setLoading(true); // Set loading to true before fetching
      await dispatch(fetchFriendsListThunk());
      setLoading(false); // Set loading to false after fetching
    };

    fetchFriends();
  }, [dispatch]);

  // Handle confirming the removal of a friend
  const handleConfirmRemove = async () => {
    if (friendToRemove) {
      await dispatch(removeFriendThunk(friendToRemove.id));
      dispatch(fetchFriendsListThunk()); // Re-fetch friends after removal
      setConfirmationModalOpen(false); // Close modal after action
    }
  };

  // Open and close the confirmation modal
  const openConfirmationModal = (friend) => {
    setFriendToRemove(friend); // Store the friend to be removed
    setConfirmationModalOpen(true); // Open the confirmation modal
  };

  const closeConfirmationModal = () => {
    setFriendToRemove(null); // Clear the selected friend
    setConfirmationModalOpen(false); // Close the confirmation modal
  };

  // Handle canceling a friend request
  const handleCancelRequest = async (friendId) => {
    await dispatch(cancelFriendRequestThunk(friendId));
    dispatch(fetchFriendsListThunk()); // Re-fetch friends after canceling request
  };

  // Handle responding to a friend request
  const handleRespondToRequest = async (friendId, response) => {
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
    <div className="friends-page-container">
      <h2 className="friends-page-heading">Your Friends</h2>

      {/* Loading Spinner */}
      {loading ? (
        <div className="loading-spinner">Loading...</div> // Replace this with your loading spinner component or CSS
      ) : (
        <>
          {/* Accepted Friends Section */}
          <div className="friends-section">
            <h3 className="friends-section-heading">Accepted Friends</h3>
            {acceptedFriends.length > 0 ? (
              <ul className="friend-list">
                {acceptedFriends.map((friend) => (
                  <li key={friend.id} className="friend-list-item">
                    <span className="friend-info">
                      {friend.username} ({friend.email})
                    </span>
                    <button
                      className="friend-button remove-button"
                      onClick={() => openConfirmationModal(friend)}
                    >
                      Remove Friend
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="no-friends-message">
                You have no accepted friends yet.
              </p>
            )}
          </div>

          {/* Pending Friend Requests Section */}
          <div className="friends-section">
            <h3 className="friends-section-heading">Pending Friend Requests</h3>
            {pendingFriends.length > 0 ? (
              <ul className="friend-list">
                {pendingFriends.map((friend) => (
                  <li key={friend.id} className="friend-list-item">
                    <span className="friend-info">
                      {friend.username} ({friend.email})
                    </span>
                    {friend.isRequestSentByYou ? (
                      <button
                        className="friend-button cancel-button"
                        onClick={() => handleCancelRequest(friend.id)}
                      >
                        Cancel Request
                      </button>
                    ) : (
                      <div className="friend-request-actions">
                        <button
                          className="friend-button accept-button"
                          onClick={() =>
                            handleRespondToRequest(friend.id, "accept")
                          }
                        >
                          Accept
                        </button>
                        <button
                          className="friend-button decline-button"
                          onClick={() =>
                            handleRespondToRequest(friend.id, "reject")
                          }
                        >
                          Decline
                        </button>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="no-friends-message">No pending friend requests.</p>
            )}
          </div>
        </>
      )}

      {/* Error Message */}
      {error && <p className="error-message">Error: {error}</p>}

      {/* Search Button */}
      <button className="search-friend-button" onClick={openSearchModal}>
        Search for Friends
      </button>

      {/* Search Modal */}
      <SearchBarModal
        isOpen={isModalOpen}
        onClose={closeSearchModal}
        triggerFetch={() => dispatch(fetchFriendsListThunk())}
      />

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmationModalOpen}
        onClose={closeConfirmationModal}
        onConfirm={handleConfirmRemove}
        message={`Are you sure you want to remove ${friendToRemove?.username}?`}
      />
    </div>
  );
};

export default FriendsPage;
