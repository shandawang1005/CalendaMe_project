import React, { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  searchUsersThunk,
  sendFriendRequestThunk,
  cancelFriendRequestThunk,
  removeFriendThunk,
  respondToFriendRequestThunk,
  setSearchResults, // Import action to clear search results
} from "../../redux/friends";
import "./SearchBarModal.css";

const SearchBarModal = ({ isOpen, onClose, triggerFetch }) => {
  const [query, setQuery] = useState("");
  const [hasSearched, setHasSearched] = useState(false); // Track if search has been performed
  const dispatch = useDispatch();
  const modalRef = useRef(null);

  const results = useSelector((state) => state.friends.searchResults || []);
  const searchError = useSelector((state) => state.friends.searchError);

  // Reset search input and results every time the modal is opened
  useEffect(() => {
    if (isOpen) {
      setQuery(""); // Clear the search input when the modal opens
      dispatch(setSearchResults([])); // Clear previous search results
      setHasSearched(false); // Reset hasSearched when modal opens
    }
  }, [isOpen, dispatch]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      setHasSearched(true); // Set to true when search is initiated
      dispatch(searchUsersThunk(query.trim()));
    }
  };

  const handleSendRequest = async (friendId) => {
    await dispatch(sendFriendRequestThunk(friendId));
    dispatch(searchUsersThunk(query.trim())); // Re-fetch search results after sending request
    triggerFetch(); // Trigger a re-fetch of the friends list on the parent page
  };

  const handleCancelRequest = async (friendId) => {
    await dispatch(cancelFriendRequestThunk(friendId));
    dispatch(searchUsersThunk(query.trim())); // Re-fetch search results after cancelling request
    triggerFetch();
  };

  const handleRemoveFriend = async (friendId) => {
    await dispatch(removeFriendThunk(friendId));
    dispatch(searchUsersThunk(query.trim())); // Re-fetch search results after removing friend
    triggerFetch();
  };

  const handleRespondToRequest = async (friendId, response) => {
    await dispatch(respondToFriendRequestThunk(friendId, response));
    dispatch(searchUsersThunk(query.trim())); // Re-fetch search results after responding
    triggerFetch();
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div className="modal-overlay">
      <div className="modal-content" ref={modalRef}>
        <h2>Search for Friends</h2>
        <form onSubmit={handleSearch}>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by username or email"
          />
          <button type="submit">Search</button>
        </form>

        {results.length > 0 ? (
          <ul>
            {results.map((user) => (
              <li key={user.id}>
                {user.username} ({user.email}){" "}
                {user.isFriend ? (
                  <button onClick={() => handleRemoveFriend(user.id)}>
                    Remove Friend
                  </button>
                ) : user.requestSent ? (
                  <button onClick={() => handleCancelRequest(user.id)}>
                    Cancel Request
                  </button>
                ) : user.requestReceived ? (
                  <>
                    <button
                      onClick={() => handleRespondToRequest(user.id, "accept")}
                    >
                      Accept Request
                    </button>
                    <button
                      onClick={() => handleRespondToRequest(user.id, "reject")}
                    >
                      Decline Request
                    </button>
                  </>
                ) : (
                  <button onClick={() => handleSendRequest(user.id)}>
                    Send Friend Request
                  </button>
                )}
              </li>
            ))}
          </ul>
        ) : hasSearched && query && <p>No results found</p>}

        <button onClick={onClose}>Close</button>
      </div>
    </div>,
    document.body
  );
};

export default SearchBarModal;
