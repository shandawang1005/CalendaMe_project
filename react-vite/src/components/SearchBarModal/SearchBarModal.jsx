import { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  searchUsersThunk,
  sendFriendRequestThunk,
  cancelFriendRequestThunk,
  removeFriendThunk,
  respondToFriendRequestThunk,
  setSearchResults,
} from "../../redux/friends";
import "./SearchBarModal.css";

const SearchBarModal = ({ isOpen, onClose, triggerFetch }) => {
  const [query, setQuery] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const [loading, setLoading] = useState(false); // Add loading state
  const dispatch = useDispatch();
  const modalRef = useRef(null);

  const results = useSelector((state) => state.friends.searchResults || []);

  useEffect(() => {
    if (isOpen) {
      setQuery("");
      dispatch(setSearchResults([]));
      setHasSearched(false);
      setLoading(false); // Reset loading state when modal opens
    }
  }, [isOpen, dispatch]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (query.trim()) {
      setHasSearched(true);
      setLoading(true); // Set loading to true when search starts
      await dispatch(searchUsersThunk(query.trim()));
      setLoading(false); // Set loading to false after the search completes
    }
  };

  const handleSendRequest = async (friendId) => {
    await dispatch(sendFriendRequestThunk(friendId));
    await dispatch(searchUsersThunk(query.trim()));
  };

  const handleCancelRequest = async (friendId) => {
    await dispatch(cancelFriendRequestThunk(friendId));
    await dispatch(searchUsersThunk(query.trim()));
  };

  const handleRemoveFriend = async (friendId) => {
    await dispatch(removeFriendThunk(friendId));
    await dispatch(searchUsersThunk(query.trim()));
    triggerFetch();
  };

  const handleRespondToRequest = async (friendId, response) => {
    await dispatch(respondToFriendRequestThunk(friendId, response));
    await dispatch(searchUsersThunk(query.trim()));
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
        <h2 className="modal-heading">Search for Friends</h2>
        <form className="search-form" onSubmit={handleSearch}>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by username or email"
            className="search-input"
          />
          <button type="submit" className="search-button">
            Search
          </button>
        </form>

        {loading ? (
          <p className="loading-message">Loading...</p>
        ) : results.length > 0 ? (
          <ul className="results-list">
            {results.map((user) => (
              <li key={user.id} className="result-item">
                <span className="user-info">
                  {user.username} ({user.email})
                </span>
                <div className="action-buttons">
                  {user.isFriend ? (
                    <button
                      onClick={() => handleRemoveFriend(user.id)}
                      className="action-button remove-button"
                    >
                      Remove
                    </button>
                  ) : user.requestSent ? (
                    <button
                      onClick={() => handleCancelRequest(user.id)}
                      className="action-button cancel-button"
                    >
                      Cancel Request
                    </button>
                  ) : user.requestReceived ? (
                    <>
                      <button
                        onClick={() =>
                          handleRespondToRequest(user.id, "accept")
                        }
                        className="action-button accept-button"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() =>
                          handleRespondToRequest(user.id, "reject")
                        }
                        className="action-button decline-button"
                      >
                        Decline
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => handleSendRequest(user.id)}
                      className="action-button send-button"
                    >
                      Send Request
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          hasSearched &&
          query && <p className="no-results-message">No results found</p>
        )}

        <button onClick={onClose} className="close-button">
          Close
        </button>
      </div>
    </div>,
    document.body
  );
};

export default SearchBarModal;
