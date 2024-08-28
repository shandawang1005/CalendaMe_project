import { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import { useDispatch, useSelector } from "react-redux";
import { clearSearchResults, searchFriendsForEvent } from "../../redux/friends";
import {
  createEvent,
  editEvent,
  deleteEvent,
  sendInvitations,
  removeParticipant,
} from "../../redux/event";
import { useNotification } from "../NotificationPage/NotificationContainer"; // Import useNotification hook
import { useNavigate } from "react-router-dom"; // For navigation
import "./CreateEditEventModal.css";

const CreateEditEventModal = ({ isOpen, onClose, editingEvent = null }) => {
  const dispatch = useDispatch();
  const { addNotification } = useNotification(); // Hook to trigger notifications
  const friends = useSelector(
    (state) => state.friends.eventSearchResults || []
  );
  const currentUser = useSelector((state) => state.session.user); // Fetch current user
  const navigate = useNavigate(); // For navigation

  const MAX_EVENT_NAME_LENGTH = 50; // Define the maximum length for the event name

  const [formData, setFormData] = useState({
    title: "",
    start_time: "",
    end_time: "",
    location: "",
    visibility: "private",
  });

  const [inviteeIds, setInviteeIds] = useState([]);
  const [query, setQuery] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false); // Add loading state
  const modalRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      // Reset fields when modal opens
      setQuery("");
      setHasSearched(false);
      setInviteeIds([]);
      dispatch(clearSearchResults());
      setErrors({});
      setLoading(false); // Reset loading state when modal opens

      if (editingEvent) {
        // Populate form data for editing
        setFormData({
          title: editingEvent.title || "",
          start_time: editingEvent.start_time || "",
          end_time: editingEvent.end_time || "",
          location: editingEvent.location || "",
          visibility: editingEvent.visibility || "private",
        });

        // Populate invitees if editing an event
        if (editingEvent.participants) {
          const participantIds = editingEvent.participants.map(
            (participant) => participant.user_id
          );
          setInviteeIds(participantIds);
        }
      } else {
        // Reset form for creating a new event
        setFormData({
          title: "",
          start_time: "",
          end_time: "",
          location: "",
          visibility: "private",
        });
      }
    }
  }, [isOpen, editingEvent, dispatch]);

  // Handle form changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));

    // Clear the specific field's error when the user starts typing
    setErrors((prevErrors) => ({ ...prevErrors, [name]: null }));
  };

  // Handle friend search
  const handleSearch = async (e) => {
    e.preventDefault();
    if (query.trim()) {
      setHasSearched(true);
      setLoading(true); // Set loading to true
      await dispatch(searchFriendsForEvent(query.trim()));
      setLoading(false); // Set loading to false when search completes
    }
  };

  // Toggle invited friends
  const handleInviteeToggle = (friendId) => {
    setInviteeIds((prevIds) => {
      const newInviteeIds = prevIds.includes(friendId)
        ? prevIds.filter((id) => id !== friendId)
        : [...prevIds, friendId];
      return newInviteeIds;
    });
  };

  // Validate form fields
  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = "Title is required.";
    } else if (formData.title.length > MAX_EVENT_NAME_LENGTH) {
      newErrors.title = `Title cannot exceed ${MAX_EVENT_NAME_LENGTH} characters.`;
    }

    if (!formData.start_time) {
      newErrors.start_time = "Start time is required.";
    }
    if (!formData.end_time) {
      newErrors.end_time = "End time is required.";
    } else if (new Date(formData.end_time) <= new Date(formData.start_time)) {
      newErrors.end_time = "End time must be after start time.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (validateForm()) {
      const eventAction = editingEvent
        ? editEvent(editingEvent.id, formData, inviteeIds)
        : createEvent(formData, inviteeIds);

      try {
        const response = await dispatch(eventAction);

        if (response?.error) {
          addNotification(response.error, "error");
        } else {
          addNotification(
            editingEvent
              ? "Event updated successfully!"
              : "Event created successfully!",
            "success"
          );

          const filteredInviteeIds = inviteeIds.filter(
            (id) => id !== currentUser.id
          );

          if (filteredInviteeIds.length > 0) {
            dispatch(sendInvitations(response.event.id, filteredInviteeIds));
          }

          onClose();
          navigate("/"); // Redirect to the Dashboard
        }
      } catch (error) {
        addNotification(
          "An error occurred while processing the request",
          "error"
        );
      }
    }
  };

  // Handle event deletion
  const handleDeleteEvent = async () => {
    try {
      const response = await dispatch(deleteEvent(editingEvent.id));

      if (response?.error) {
        addNotification(response.error, "error");
      } else {
        addNotification("Event deleted successfully!", "success");
        onClose();
      }
    } catch (error) {
      addNotification("An error occurred while deleting the event", "error");
    }
  };

  // Handle participant removal
  const handleRemoveParticipant = async (participantId) => {
    try {
      const response = await dispatch(
        removeParticipant(editingEvent.id, participantId)
      );

      if (response?.error) {
        addNotification(response.error, "error");
      } else {
        const updatedParticipants =
          formData.participants?.filter(
            (participant) => participant.id !== participantId
          ) || [];

        setFormData((prevData) => ({
          ...prevData,
          participants: updatedParticipants,
        }));

        addNotification("Participant removed successfully!", "success");
        onClose();
      }
    } catch (error) {
      addNotification(
        "An error occurred while removing the participant",
        "error"
      );
    }
  };

  // Close modal on outside click
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

  const formatName = (name) => {
    return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
  };

  return ReactDOM.createPortal(
    <div className="modal-overlay">
      <div className="modal-content-wrapper" ref={modalRef}>
        <h2 className="modal-heading">
          {editingEvent ? "Edit Event" : "Create Event"}
        </h2>
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="modal-form-group">
            <label className="modal-label">Title:</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="modal-input"
              maxLength={MAX_EVENT_NAME_LENGTH} // Prevent typing beyond max length of 50 words
            />
            <small>
              {formData.title.length}/{MAX_EVENT_NAME_LENGTH} characters
            </small>
            {errors.title && <p className="error-message">{errors.title}</p>}
          </div>
          <div className="modal-form-group">
            <label className="modal-label">Start Time:</label>
            <input
              type="datetime-local"
              name="start_time"
              value={formData.start_time}
              onChange={handleChange}
              className="modal-input"
            />
            {errors.start_time && (
              <p className="error-message">{errors.start_time}</p>
            )}
          </div>
          <div className="modal-form-group">
            <label className="modal-label">End Time:</label>
            <input
              type="datetime-local"
              name="end_time"
              value={formData.end_time}
              onChange={handleChange}
              className="modal-input"
            />
            {errors.end_time && (
              <p className="error-message">{errors.end_time}</p>
            )}
          </div>
          <div className="modal-form-group">
            <label className="modal-label">Location:</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              className="modal-input"
            />
          </div>
          <div className="modal-form-group">
            <label className="modal-label">Visibility:</label>
            <select
              name="visibility"
              value={formData.visibility}
              onChange={handleChange}
              className="modal-select"
            >
              <option value="public">Public</option>
              <option value="private">Private</option>
            </select>
          </div>

          {/* Participants Section */}
          {editingEvent && (
            <div className="participants-wrapper">
              <h3 className="participants-heading">Participants</h3>
              {editingEvent.participants.map((participant) => (
                <div key={participant.id} className="participant-item">
                  <span className="participant-name">
                    {formatName(participant.username)}
                    {currentUser.id === participant.user_id ? " (Host)" : ""}
                  </span>
                  {currentUser.id !== participant.user_id &&
                    editingEvent.creator_id === currentUser.id && (
                      <button
                        type="button"
                        className="remove-participant-button"
                        onClick={() =>
                          handleRemoveParticipant(participant.user_id)
                        }
                      >
                        Remove
                      </button>
                    )}
                </div>
              ))}
            </div>
          )}

          {/* Friend Search Section */}
          {formData.visibility === "public" && (
            <div className="friend-search-wrapper">
              <h3 className="friend-search-heading">Invite Friends</h3>
              <div className="friend-search">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search for friends by username or email"
                  className="friend-search-input"
                />
                <button onClick={handleSearch} className="friend-search-button">
                  Search
                </button>
              </div>

              {loading ? (
                <p className="loading-message">Loading...</p>
              ) : friends.length > 0 ? (
                <ul className="friend-list">
                  {friends.map((friend) => (
                    <li key={friend.id} className="friend-list-item">
                      <label className="friend-checkbox-label">
                        <input
                          type="checkbox"
                          checked={inviteeIds.includes(friend.id)}
                          onChange={() => handleInviteeToggle(friend.id)}
                          className="friend-checkbox"
                        />
                        {friend.username} ({friend.email})
                      </label>
                    </li>
                  ))}
                </ul>
              ) : (
                hasSearched &&
                query && <p className="no-friends-found">No friends found</p>
              )}
            </div>
          )}

          <div className="form-buttons">
            <button type="submit" className="submit-button">
              {editingEvent ? "Update Event" : "Create Event"}
            </button>
            <button type="button" onClick={onClose} className="cancel-button">
              Cancel
            </button>
            {editingEvent && (
              <button
                type="button"
                onClick={handleDeleteEvent}
                className="delete-button-edit"
                style={{ marginLeft: "10px" }}
              >
                Delete Event
              </button>
            )}
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default CreateEditEventModal;
