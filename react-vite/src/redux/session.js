// Action Types
const SET_USER = "session/setUser";
const REMOVE_USER = "session/removeUser";
const CHANGE_PASSWORD_SUCCESS = "session/changePasswordSuccess";
const CHANGE_PASSWORD_FAILURE = "session/changePasswordFailure";

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

// Thunks
export const thunkAuthenticate = () => async (dispatch) => {
  const response = await fetch("/api/auth/");
  if (response.ok) {
    const data = await response.json();
    if (data.errors) {
      return;
    }
    dispatch(setUser(data));
  }
};

export const thunkLogin = (credentials) => async (dispatch) => {
  // Get the CSRF token from the cookies
  const csrfToken = document.cookie
    .split("; ")
    .find((row) => row.startsWith("csrf_token="))
    ?.split("=")[1];

  const response = await fetch("/api/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-CSRF-Token": csrfToken, // Include the CSRF token in the headers
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
  // Get the CSRF token from the cookies
  const csrfToken = document.cookie
    .split("; ")
    .find((row) => row.startsWith("csrf_token="))
    ?.split("=")[1];

  const response = await fetch("/api/auth/signup", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-CSRF-Token": csrfToken, // Include the CSRF token in the headers
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
    return { server: "Something went wrong. Please try again" };
  }
};

export const thunkLogout = () => async (dispatch) => {
  const csrfToken = document.cookie
    .split("; ")
    .find((row) => row.startsWith("csrf_token="))
    ?.split("=")[1];

  await fetch("/api/auth/logout", {
    method: "POST",
    headers: {
      "X-CSRF-Token": csrfToken,
    },
  });
  dispatch(removeUser());
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

// Initial State
const initialState = {
  user: null,
  passwordChangeMessage: null,
  passwordChangeError: null,
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
    default:
      return state;
  }
}

export default sessionReducer;
