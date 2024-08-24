// Actions
const SET_EVENTS = "events/SET_EVENTS";
const ADD_EVENT = "events/ADD_EVENT";
const EDIT_EVENT = "events/EDIT_EVENT";
const DELETE_EVENT = "events/DELETE_EVENT";
const REMOVE_PARTICIPANT = "events/REMOVE_PARTICIPANT";
const SET_DAY_EVENTS = "events/SET_DAY_EVENTS";

// Action Creators
const setEvents = (events) => ({
  type: SET_EVENTS,
  events,
});
const setDayEvents = (events) => ({
  type: SET_DAY_EVENTS,
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
    return { error: errorData.error || "Failed to fetch events" };
  }
};
// Thunk: Fetch Events for a Specific day
export const fetchEventsForDay = (date) => async (dispatch) => {
  try {
    const response = await fetch(`/api/calendar/events/day?date=${date}`, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to fetch events for the day");
    }

    const data = await response.json();
    dispatch(setDayEvents(data)); // Dispatch the events for the selected day
  } catch (error) {
    console.error("Error fetching events for the day:", error);
  }
};
// Thunk: Fetch Events for a Specific Month
export const fetchEventsForMonth = (year, month) => async (dispatch) => {
  try {
    const response = await fetch(
      `/api/calendar/events/month?year=${year}&month=${month}`,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.error || "Failed to fetch events for the selected month"
      );
    }

    const data = await response.json();
    dispatch(setEvents(data)); // Dispatch the events for the selected month
  } catch (error) {
    console.error("Error fetching events for the month:", error);
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

  const data = await response.json();

  if (response.ok) {
    dispatch(addEvent(data.event));
    return { event: data.event };
  } else if (response.status === 409) {
    return { error: data.error || "This event conflicts with another event" };
  } else {
    return { error: data.error || "Failed to create event" };
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

  const data = await response.json();

  if (response.ok) {
    dispatch(editEventAction(data.event));
    return { event: data.event };
  } else if (response.status === 409) {
    return { error: data.error || "This event conflicts with another event" };
  } else {
    return { error: data.error || "Failed to edit event" };
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
    dispatch(deleteEventAction(eventId));
  } else {
    const errorData = await response.json();
    return { error: errorData.error || "Failed to delete event" };
  }
};

// Thunk: Send Invitations
export const sendInvitations = (eventId, inviteeIds) => async () => {
  const response = await fetch("/api/invitation/send", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ event_id: eventId, invitee_ids: inviteeIds }),
  });

  if (response.ok) {
    const data = await response.json();
    return { message: data.message };
  } else {
    const errorData = await response.json();
    return { error: errorData.error || "Failed to send invitations." };
  }
};

// Thunk: Remove Participant
export const removeParticipant =
  (eventId, participantId) => async (dispatch) => {
    const response = await fetch(
      `/api/calendar/${eventId}/remove-participant/${participantId}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const data = await response.json();

    if (response.ok) {
      dispatch(removeParticipantAction(eventId, participantId));
      return { message: data.message };
    } else {
      return { error: data.error || "Failed to remove participant" };
    }
  };

// Initial State
const initialState = [];

// Reducer
export default function eventsReducer(state = initialState, action) {
  switch (action.type) {
    case SET_EVENTS:
      return action.events;
    case SET_DAY_EVENTS:
      return action.events; // Replace or merge with existing events based on your needs
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
