import { clearFriends } from "../redux/friends";

// Action Types
const SET_USER = "session/setUser";
const REMOVE_USER = "session/removeUser";
const CHANGE_PASSWORD_SUCCESS = "session/changePasswordSuccess";
const CHANGE_PASSWORD_FAILURE = "session/changePasswordFailure";
const FETCH_PROFILE_SUCCESS = "session/fetchProfileSuccess";
const FETCH_PROFILE_FAILURE = "session/fetchProfileFailure";
const UPDATE_PROFILE_SUCCESS = "session/updateProfileSuccess";
const UPDATE_PROFILE_FAILURE = "session/updateProfileFailure";

// Action Creators
const setUser = (user) => ({
  type: SET_USER,
  payload: user,
});

const removeUser = () => ({
  type: REMOVE_USER,
});

const changePasswordSuccess = (message) => ({
  type: CHANGE_PASSWORD_SUCCESS,
  payload: message,
});

const changePasswordFailure = (error) => ({
  type: CHANGE_PASSWORD_FAILURE,
  payload: error,
});

const fetchProfileSuccess = (user) => ({
  type: FETCH_PROFILE_SUCCESS,
  payload: user,
});

const fetchProfileFailure = (error) => ({
  type: FETCH_PROFILE_FAILURE,
  payload: error,
});

const updateProfileSuccess = (user) => ({
  type: UPDATE_PROFILE_SUCCESS,
  payload: user,
});

const updateProfileFailure = (error) => ({
  type: UPDATE_PROFILE_FAILURE,
  payload: error,
});

// Thunks

export const thunkAuthenticate = () => async (dispatch) => {
  const response = await fetch("/api/auth/");
  if (response.ok) {
    const data = await response.json();
    if (!data.errors) {
      dispatch(setUser(data));
    }
  }
};

export const thunkLogin = (credentials) => async (dispatch) => {
  const csrfToken = document.cookie
    .split("; ")
    .find((row) => row.startsWith("csrf_token="))
    ?.split("=")[1];

  const response = await fetch("/api/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-CSRF-Token": csrfToken,
    },
    body: JSON.stringify(credentials),
  });

  if (response.ok) {
    const data = await response.json();
    dispatch(setUser(data));
  } else if (response.status < 500) {
    const errorMessages = await response.json();
    return errorMessages;
  } else {
    return { server: "Something went wrong. Please try again" };
  }
};

export const thunkSignup = (user) => async (dispatch) => {
  try {
    const csrfToken = document.cookie
      .split("; ")
      .find((row) => row.startsWith("csrf_token="))
      ?.split("=")[1];

    const response = await fetch("/api/auth/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-Token": csrfToken,
      },
      body: JSON.stringify(user),
    });

    if (response.ok) {
      const data = await response.json();
      dispatch(setUser(data));
    } else if (response.status < 500) {
      const errorMessages = await response.json();
      return errorMessages;
    } else {
      // Log the response to understand what went wrong
      const errorResponse = await response.text();
      console.error("Server error:", errorResponse);
      return { server: "Something went wrong. Please try again" };
    }
  } catch (err) {
    console.error("Network or server issue:", err);
    return { server: "An error occurred. Please try again later." };
  }
};

export const thunkLogout = () => async (dispatch) => {
  await fetch("/api/auth/logout");
  dispatch(removeUser());
  dispatch(clearFriends());
};

export const changePasswordThunk =
  (oldPassword, newPassword, confirmPassword) => async (dispatch) => {
    const csrfToken = document.cookie
      .split("; ")
      .find((row) => row.startsWith("csrf_token="))
      ?.split("=")[1];

    try {
      const response = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": csrfToken,
        },
        body: JSON.stringify({
          old_password: oldPassword,
          new_password: newPassword,
          confirm_password: confirmPassword,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        dispatch(changePasswordSuccess(data.message));
        return data.message;
      } else {
        const errorData = await response.json();
        dispatch(changePasswordFailure(errorData.error));
        return errorData.error;
      }
    } catch (error) {
      console.error("Failed to change password:", error);
      dispatch(changePasswordFailure("An error occurred. Please try again."));
      return "An error occurred. Please try again.";
    }
  };

export const thunkFetchProfile = () => async (dispatch) => {
  const response = await fetch("/api/auth/profile");

  if (response.ok) {
    const data = await response.json();
    dispatch(fetchProfileSuccess(data));
  } else {
    const errorData = await response.json();
    dispatch(fetchProfileFailure(errorData.error));
  }
};

export const thunkUpdateProfile = (profileData) => async (dispatch) => {
  const csrfToken = document.cookie
    .split("; ")
    .find((row) => row.startsWith("csrf_token="))
    ?.split("=")[1];

  const response = await fetch("/api/auth/profile", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "X-CSRF-Token": csrfToken,
    },
    body: JSON.stringify(profileData),
  });

  if (response.ok) {
    const data = await response.json();
    dispatch(updateProfileSuccess(data));
  } else {
    const errorData = await response.json();
    dispatch(updateProfileFailure(errorData.error));
  }
};

// Initial State
const initialState = {
  user: null,
  passwordChangeMessage: null,
  passwordChangeError: null,
  profileUpdateMessage: null,
  profileUpdateError: null,
};

// Reducer
function sessionReducer(state = initialState, action) {
  switch (action.type) {
    case SET_USER:
      return { ...state, user: action.payload };
    case REMOVE_USER:
      return { ...state, user: null };
    case CHANGE_PASSWORD_SUCCESS:
      return {
        ...state,
        passwordChangeMessage: action.payload,
        passwordChangeError: null,
      };
    case CHANGE_PASSWORD_FAILURE:
      return {
        ...state,
        passwordChangeMessage: null,
        passwordChangeError: action.payload,
      };
    case FETCH_PROFILE_SUCCESS:
    case UPDATE_PROFILE_SUCCESS:
      return {
        ...state,
        user: action.payload,
        profileUpdateMessage:
          action.type === UPDATE_PROFILE_SUCCESS
            ? "Profile updated successfully."
            : null,
        profileUpdateError: null,
      };
    case FETCH_PROFILE_FAILURE:
    case UPDATE_PROFILE_FAILURE:
      return {
        ...state,
        profileUpdateMessage: null,
        profileUpdateError: action.payload,
      };
    default:
      return state;
  }
}

export default sessionReducer;
