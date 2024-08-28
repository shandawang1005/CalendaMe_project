// Action Types
const FETCH_FRIENDS_LIST = "friends/FETCH_FRIENDS_LIST";
const SEND_FRIEND_REQUEST = "friends/SEND_FRIEND_REQUEST";
const SET_FRIEND_REQUEST_ERROR = "friends/SET_FRIEND_REQUEST_ERROR";
const SET_SEARCH_RESULTS = "friends/SET_SEARCH_RESULTS";
const SET_SEARCH_ERROR = "friends/SET_SEARCH_ERROR";
const CANCEL_FRIEND_REQUEST = "friends/CANCEL_FRIEND_REQUEST";
const RESPOND_TO_FRIEND_REQUEST = "friends/RESPOND_TO_FRIEND_REQUEST";
const REMOVE_FRIEND = "friends/REMOVE_FRIEND";
const CLEAR_SEARCH_RESULTS = "friends/CLEAR_SEARCH_RESULTS";
const SET_EVENT_FRIEND_SEARCH_RESULTS =
  "friends/SET_EVENT_FRIEND_SEARCH_RESULTS";
const CLEAR_FRIENDS = "friends/CLEAR_FRIENDS";
// Action Creators
export const fetchFriendsList = (friends) => ({
  type: FETCH_FRIENDS_LIST,
  payload: friends,
});

export const sendFriendRequestSuccess = (friend) => ({
  type: SEND_FRIEND_REQUEST,
  payload: friend,
});

export const setFriendRequestError = (error) => ({
  type: SET_FRIEND_REQUEST_ERROR,
  payload: error,
});

export const setSearchResults = (results) => ({
  type: SET_SEARCH_RESULTS,
  payload: results,
});

export const setSearchError = (error) => ({
  type: SET_SEARCH_ERROR,
  payload: error,
});

export const cancelFriendRequestSuccess = (friendId) => ({
  type: CANCEL_FRIEND_REQUEST,
  payload: friendId,
});

export const respondToFriendRequestSuccess = (friendshipId, status) => ({
  type: RESPOND_TO_FRIEND_REQUEST,
  payload: { friendshipId, status },
});

export const removeFriendSuccess = (friendId) => ({
  type: REMOVE_FRIEND,
  payload: friendId,
});

export const clearSearchResults = () => ({
  type: CLEAR_SEARCH_RESULTS,
});

export const setEventFriendSearchResults = (results) => ({
  type: SET_EVENT_FRIEND_SEARCH_RESULTS,
  payload: results,
});
export const clearFriends = () => ({
  type: CLEAR_FRIENDS,
  payload: {},
});
// Thunks

// Fetch the list of friends
export const fetchFriendsListThunk = () => async (dispatch) => {
  try {
    const response = await fetch("/api/friends/", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) throw new Error("Failed to fetch friends list");

    const data = await response.json();
    dispatch(fetchFriendsList(data));
  } catch (error) {
    console.error("Error fetching friends list:", error.message);
  }
};

// Send a friend request
export const sendFriendRequestThunk = (friendId) => async (dispatch) => {
  try {
    const response = await fetch("/api/friends/request", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ friend_id: friendId }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to send friend request");
    }

    const data = await response.json();
    dispatch(sendFriendRequestSuccess(data.friend)); // Dispatch the new pending friend
  } catch (error) {
    console.error("Error:", error.message);
    dispatch(setFriendRequestError(error.message));
  }
};

// Search for users
export const searchUsersThunk = (query) => async (dispatch) => {
  try {
    const response = await fetch(`/api/users/search?query=${query}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) throw new Error("Failed to fetch search results");

    const data = await response.json();
    // console.log("data=======>", data);
    dispatch(setSearchResults(data));
  } catch (error) {
    console.error("Error searching users:", error.message);
    dispatch(setSearchError(error.message));
  }
};

// Search friends specifically for event invitations
export const searchFriendsForEvent = (query) => async (dispatch) => {
  try {
    const response = await fetch(`/api/friends/search?query=${query}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) throw new Error("Failed to fetch search results");

    const data = await response.json();
    dispatch(setEventFriendSearchResults(data));
  } catch (error) {
    console.error("Error searching friends for event:", error.message);
    dispatch(setSearchError(error.message));
  }
};

// Cancel a friend request
export const cancelFriendRequestThunk = (friendId) => async (dispatch) => {
  try {
    const response = await fetch(`/api/friends/cancel/${friendId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) throw new Error("Failed to cancel friend request");

    dispatch(cancelFriendRequestSuccess(friendId));
  } catch (error) {
    console.error("Error:", error.message);
  }
};

// Respond to a friend request (accept/reject)
export const respondToFriendRequestThunk =
  (friendshipId, response) => async (dispatch) => {
    try {
      const res = await fetch(`/api/friends/${friendshipId}/respond`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ response }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(
          errorData.error || "Failed to respond to friend request"
        );
      }

      dispatch(respondToFriendRequestSuccess(friendshipId, response)); // Pass the response (accept/reject)
    } catch (error) {
      console.error("Error responding to friend request:", error.message);
      dispatch(setFriendRequestError(error.message));
    }
  };

// Remove a friend (unfriend)
export const removeFriendThunk = (friendId) => async (dispatch) => {
  try {
    const response = await fetch(`/api/friends/${friendId}/remove`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) throw new Error("Failed to remove friend");

    dispatch(removeFriendSuccess(friendId));
  } catch (error) {
    console.error("Error removing friend:", error.message);
  }
};

// Initial State
const initialState = {
  accepted: [],
  pending: [],
  requestMessage: null,
  error: null,
  searchResults: [], // For regular friend search
  eventSearchResults: [], // NEW: For event friend search
  searchError: null,
};

// Reducer
const friendsReducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_FRIENDS_LIST:
      return {
        ...state,
        accepted: action.payload.accepted,
        pending: action.payload.pending,
      };

    case SEND_FRIEND_REQUEST:
      action.payload["isRequestSentByYou"] = true;
      return {
        ...state,
        pending: [...state.pending, action.payload],
        requestMessage: "Friend request sent successfully",
        error: null,
      };

    case SET_FRIEND_REQUEST_ERROR:
      return {
        ...state,
        error: action.payload,
      };

    case SET_SEARCH_RESULTS:
      return {
        ...state,
        searchResults: action.payload,
        searchError: null,
      };

    case SET_SEARCH_ERROR:
      return {
        ...state,
        searchError: action.payload,
      };

    case CANCEL_FRIEND_REQUEST:
      return {
        ...state,
        pending: state.pending.filter((friend) => friend.id !== action.payload),
        requestMessage: "Friend request canceled",
      };

    case RESPOND_TO_FRIEND_REQUEST:
      return {
        ...state,
        pending: state.pending.filter(
          (friend) => friend.id !== action.payload.friendshipId
        ),
        accepted:
          action.payload.status === "accept"
            ? [
                ...state.accepted,
                ...state.pending.filter(
                  (friend) => friend.id === action.payload.friendshipId
                ),
              ]
            : state.accepted,
      };

    case REMOVE_FRIEND:
      return {
        ...state,
        accepted: state.accepted.filter(
          (friend) => friend.id !== action.payload
        ),
      };

    case CLEAR_SEARCH_RESULTS:
      return {
        ...state,
        searchResults: [],
      };

    case SET_EVENT_FRIEND_SEARCH_RESULTS: // NEW: Handle event friend search results
      return {
        ...state,
        eventSearchResults: action.payload,
        searchError: null,
      };
    case CLEAR_FRIENDS:
      return {
        ...state,
        accepted: [],
        pending: [],
        searchResults: [],
        eventSearchResults: [],
        error: null,
        searchError: null,
      };
    default:
      return state;
  }
};

export default friendsReducer;
