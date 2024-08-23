// Actions
const SET_EVENTS = "events/SET_EVENTS";
const ADD_EVENT = "events/ADD_EVENT";
const EDIT_EVENT = "events/EDIT_EVENT";
const DELETE_EVENT = "events/DELETE_EVENT";
const REMOVE_PARTICIPANT = "events/REMOVE_PARTICIPANT";

// Action Creators
const setEvents = (events) => ({
  type: SET_EVENTS,
  events,
});

const addEvent = (event) => ({
  type: ADD_EVENT,
  event,
});

const editEventAction = (event) => ({
  type: EDIT_EVENT,
  event,
});

const deleteEventAction = (eventId) => ({
  type: DELETE_EVENT,
  eventId,
});

const removeParticipantAction = (eventId, participantId) => ({
  type: REMOVE_PARTICIPANT,
  eventId,
  participantId,
});

// Thunk: Fetch Events
export const fetchEvents = () => async (dispatch) => {
  const response = await fetch("/api/calendar/", {
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (response.ok) {
    const data = await response.json();
    dispatch(setEvents(data));
  } else {
    const errorData = await response.json();
    alert(errorData.error || "Failed to fetch events");
  }
};

// Thunk: Create Event
export const createEvent = (newEvent) => async (dispatch) => {
  const response = await fetch("/api/calendar/add", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(newEvent),
  });

  if (response.ok) {
    const data = await response.json();
    dispatch(addEvent(data.event));
    return data.event; // Return created event for invitation handling
  } else if (response.status === 409) {
    const errorData = await response.json();
    alert(errorData.error || "This event conflicts with another event");
  } else {
    const errorData = await response.json();
    alert(errorData.error || "Failed to create event");
  }
};

// Thunk: Edit Event
export const editEvent = (eventId, updatedEvent) => async (dispatch) => {
  const response = await fetch(`/api/calendar/edit/${eventId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(updatedEvent),
  });

  if (response.ok) {
    const data = await response.json();
    dispatch(editEventAction(data.event)); // Update event in store
    return data.event; // Return edited event for invitation handling
  } else if (response.status === 409) {
    const errorData = await response.json();
    alert(errorData.error || "This event conflicts with another event");
  } else {
    const errorData = await response.json();
    alert(errorData.error || "Failed to edit event");
  }
};

// Thunk: Delete Event
export const deleteEvent = (eventId) => async (dispatch) => {
  const response = await fetch(`/api/calendar/delete/${eventId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (response.ok) {
    dispatch(deleteEventAction(eventId)); // Remove event from store
  } else {
    const errorData = await response.json();
    alert(errorData.error || "Failed to delete event");
  }
};

// Thunk: Send Invitations
export const sendInvitations = (eventId, inviteeIds) => async (dispatch) => {
  try {
    const response = await fetch("/api/invitation/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ event_id: eventId, invitee_ids: inviteeIds }), // Payload for sending invitations
    });

    if (response.ok) {
      const data = await response.json();
      alert(data.message); // Notify user invitations were sent
    } else {
      const errorData = await response.json();
      alert(errorData.error || "Failed to send invitations.");
    }
  } catch (err) {
    console.error("Failed to send invitations", err);
    alert("An error occurred while sending invitations.");
  }
};

// Thunk: Remove Participant
export const removeParticipant =
  (eventId, participantId) => async (dispatch) => {
    try {
      const response = await fetch(
        `/api/calendar/${eventId}/remove-participant/${participantId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        alert(data.message); // Notify the user that the participant was removed
        dispatch(removeParticipantAction(eventId, participantId)); // Dispatch the action to update Redux store
      } else {
        const error = await response.json();
        alert(error.error || "Failed to remove participant");
      }
    } catch (err) {
      console.error("Failed to remove participant", err);
      alert("An error occurred while removing the participant.");
    }
  };

// Initial State
const initialState = [];

// Reducer
export default function eventsReducer(state = initialState, action) {
  switch (action.type) {
    case SET_EVENTS:
      return action.events;
    case ADD_EVENT:
      return [...state, action.event];
    case EDIT_EVENT:
      return state.map((event) =>
        event.id === action.event.id ? action.event : event
      );
    case DELETE_EVENT:
      return state.filter((event) => event.id !== action.eventId);
    case REMOVE_PARTICIPANT:
      return state.map((event) => {
        if (event.id === action.eventId) {
          return {
            ...event,
            participants: event.participants.filter(
              (participant) => participant.id !== action.participantId
            ),
          };
        }
        return event;
      });
    default:
      return state;
  }
}
