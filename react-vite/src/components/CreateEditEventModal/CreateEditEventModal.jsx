import React, { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import { useDispatch, useSelector } from "react-redux";
import { clearSearchResults, searchFriendsForEvent } from "../../redux/friends";
import { createEvent, editEvent } from "../../redux/event";
import { useNotification } from "../NotificationPage/NotificationContainer"; // Import useNotification hook
import "./CreateEditEventModal.css";

const CreateEditEventModal = ({ isOpen, onClose, editingEvent = null }) => {
  const dispatch = useDispatch();
  const addNotification = useNotification(); // Hook to trigger notifications
  const friends = useSelector((state) => state.friends.eventSearchResults || []);

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
  const modalRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setQuery(""); // Reset search query
      setHasSearched(false); // Reset search state
      setInviteeIds([]); // Reset invitees
      dispatch(clearSearchResults()); // Clear previous search results
      setErrors({}); // Clear previous errors

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
            (participant) => participant.id
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
  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      setHasSearched(true);
      dispatch(searchFriendsForEvent(query.trim())); // Trigger friend search
    }
  };

  // Toggle invited friends
  const handleInviteeToggle = (friendId) => {
    setInviteeIds((prevIds) =>
      prevIds.includes(friendId)
        ? prevIds.filter((id) => id !== friendId)
        : [...prevIds, friendId]
    );
  };

  // Validate form fields
  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = "Title is required.";
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
          // Show notification on conflict
          addNotification(response.error, "error");
        } else {
          addNotification(
            editingEvent
              ? "Event updated successfully!"
              : "Event created successfully!",
            "success"
          );
          onClose();
        }
      } catch (error) {
        addNotification("An error occurred while processing the request", "error");
      }
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

  return ReactDOM.createPortal(
    <div className="modal-overlay">
      <div className="modal-content" ref={modalRef}>
        <h2>{editingEvent ? "Edit Event" : "Create Event"}</h2>
        <form onSubmit={handleSubmit}>
          <div>
            <label>Title:</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
            />
            {errors.title && <p className="error-message">{errors.title}</p>}
          </div>
          <div>
            <label>Start Time:</label>
            <input
              type="datetime-local"
              name="start_time"
              value={formData.start_time}
              onChange={handleChange}
            />
            {errors.start_time && (
              <p className="error-message">{errors.start_time}</p>
            )}
          </div>
          <div>
            <label>End Time:</label>
            <input
              type="datetime-local"
              name="end_time"
              value={formData.end_time}
              onChange={handleChange}
            />
            {errors.end_time && (
              <p className="error-message">{errors.end_time}</p>
            )}
          </div>
          <div>
            <label>Location:</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
            />
          </div>
          <div>
            <label>Visibility:</label>
            <select
              name="visibility"
              value={formData.visibility}
              onChange={handleChange}
            >
              <option value="public">Public</option>
              <option value="private">Private</option>
            </select>
          </div>

          <button type="submit">
            {editingEvent ? "Update Event" : "Create Event"}
          </button>
          <button type="button" onClick={onClose}>
            Cancel
          </button>
        </form>

        {/* Friend Search Section */}
        {formData.visibility === "public" && (
          <div className="friend-search">
            <h3>Invite Friends</h3>
            <form onSubmit={handleSearch}>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search for friends by username or email"
              />
              <button type="submit">Search</button>
            </form>

            {friends.length > 0 && (
              <ul>
                {friends.map((friend) => (
                  <li key={friend.id}>
                    <label>
                      <input
                        type="checkbox"
                        checked={inviteeIds.includes(friend.id)}
                        onChange={() => handleInviteeToggle(friend.id)}
                      />
                      {friend.username} ({friend.email})
                    </label>
                  </li>
                ))}
              </ul>
            )}

            {hasSearched && friends.length === 0 && (
              <p>No friends found for the search query.</p>
            )}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};

export default CreateEditEventModal;
