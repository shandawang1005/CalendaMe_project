// Actions
const SET_EVENTS = "events/SET_EVENTS";
const ADD_EVENT = "events/ADD_EVENT";
const EDIT_EVENT = "events/EDIT_EVENT";
const DELETE_EVENT = "events/DELETE_EVENT";

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
    dispatch(fetchEvents()); // Refetch events after successful creation
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
    dispatch(fetchEvents()); // Refetch events after successful edit
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
    dispatch(fetchEvents()); // Refetch events after successful deletion
  } else {
    const errorData = await response.json();
    alert(errorData.error || "Failed to delete event");
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
    default:
      return state;
  }
}
