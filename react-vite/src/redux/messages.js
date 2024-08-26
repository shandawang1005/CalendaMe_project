// Action Types
const SET_MESSAGES = "messages/SET_MESSAGES";
const ADD_MESSAGE = "messages/ADD_MESSAGE";

// Action Creators
const setMessages = (messages) => ({
  type: SET_MESSAGES,
  messages,
});

const addMessage = (message) => ({
  type: ADD_MESSAGE,
  message,
});

// Thunk to fetch messages between the current user and a friend
export const fetchMessages = (friendId) => async (dispatch) => {
  const response = await fetch(`/api/messages/${friendId}`);

  if (response.ok) {
    const messages = await response.json();
    dispatch(setMessages(messages));
  } else {
    console.error("Failed to load messages");
  }
};

// Thunk to send a message
export const sendMessage = (messageData) => async (dispatch) => {
  const response = await fetch(`/api/messages/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(messageData),
  });

  if (response.ok) {
    const message = await response.json();
    dispatch(addMessage(message));
  } else {
    console.error("Failed to send message");
  }
};

// Initial State
const initialState = {
  messages: [],
};

// Reducer
export default function messagesReducer(state = initialState, action) {
  switch (action.type) {
    case SET_MESSAGES:
      return { ...state, messages: action.messages };
    case ADD_MESSAGE:
      return { ...state, messages: [...state.messages, action.message] };
    default:
      return state;
  }
}
