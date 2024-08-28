// Action Types
const SET_MESSAGES = "messages/SET_MESSAGES";
const ADD_MESSAGE = "messages/ADD_MESSAGE";
const DELETE_MESSAGE = "messages/DELETE_MESSAGE";
const CLEAR_CHAT_HISTORY = "messages/CLEAR_CHAT_HISTORY";

// Action Creators
const setMessages = (messages) => ({
  type: SET_MESSAGES,
  messages,
});

const addMessage = (message) => ({
  type: ADD_MESSAGE,
  message,
});
const deleteMessageAction = (messageId) => ({
  type: DELETE_MESSAGE,
  messageId,
});

const clearChatHistoryAction = (friendId) => ({
  type: CLEAR_CHAT_HISTORY,
  friendId,
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
// Thunk to delete a single message
export const deleteMessage = (messageId) => async (dispatch) => {
  const response = await fetch(`/api/messages/${messageId}`, {
    method: "DELETE",
  });

  if (response.ok) {
    dispatch(deleteMessageAction(messageId));
  } else {
    console.error("Failed to delete message");
  }
};

// Thunk to clear the chat history with a friend
export const clearChatHistory = (friendId) => async (dispatch) => {
  const response = await fetch(`/api/messages/clear/${friendId}`, {
    method: "DELETE",
  });

  if (response.ok) {
    dispatch(clearChatHistoryAction(friendId));
  } else {
    console.error("Failed to clear chat history");
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
    case DELETE_MESSAGE:
      return {
        ...state,
        messages: state.messages.filter(
          (message) => message.id !== action.messageId
        ),
      };
    case CLEAR_CHAT_HISTORY:
      return {
        ...state,
        messages: [], // Clear all messages when the history is cleared
      };
    default:
      return state;
  }
}
