// Actions
const SET_RECEIVED_INVITATIONS = "invitations/SET_RECEIVED_INVITATIONS";
const REMOVE_INVITATION = "invitations/REMOVE_INVITATION";
const SEND_INVITATIONS_SUCCESS = "invitations/SEND_INVITATIONS_SUCCESS";

// Action Creators
const setReceivedInvitations = (invitations) => ({
  type: SET_RECEIVED_INVITATIONS,
  invitations,
});

const removeInvitation = (invitationId) => ({
  type: REMOVE_INVITATION,
  invitationId,
});

// Thunk: Fetch Invitations (both as inviter and invitee)
export const fetchReceivedInvitations = () => async (dispatch) => {
  try {
    const response = await fetch("/api/invitation/received", {
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      try {
        const invitations = await response.json();
        dispatch(setReceivedInvitations(invitations)); // Dispatch action to set invitations in Redux
      } catch (jsonError) {
        console.error("Failed to parse JSON:", jsonError);
        dispatch({
          type: SEND_INVITATIONS_SUCCESS,
          message: "Received invalid JSON. Please try again later.",
        });
      }
    } else {
      const errorText = await response.text(); // Fetch error response as text (in case it's HTML)
      console.error("Error fetching invitations:", errorText);
      dispatch({
        type: SEND_INVITATIONS_SUCCESS,
        message: "Failed to fetch invitations.",
      });
    }
  } catch (err) {
    console.error("Failed to fetch received invitations", err);
    dispatch({
      type: SEND_INVITATIONS_SUCCESS,
      message: "An error occurred while fetching invitations.",
    });
  }
};

// Thunk: Send Invitations
export const sendInvitations = (eventId, inviteeIds) => async (dispatch) => {
  try {
    const res = await fetch("/api/invitation/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        event_id: eventId,
        invitee_ids: inviteeIds,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      dispatch({
        type: SEND_INVITATIONS_SUCCESS,
        message: data.message,
      });
    } else if (res.status === 409) {
      const error = await res.json();
      dispatch({
        type: SEND_INVITATIONS_SUCCESS,
        message: error.error, // Notify the user about the conflict
      });
    } else {
      const error = await res.json();
      dispatch({
        type: SEND_INVITATIONS_SUCCESS,
        message: error.error,
      });
    }
  } catch (err) {
    console.error("Failed to send invitations", err);
    dispatch({
      type: SEND_INVITATIONS_SUCCESS,
      message: "An error occurred while sending invitations.",
    });
  }
};

// Thunk: Respond to an Invitation
export const respondToInvitation =
  (invitationId, response) => async (dispatch) => {
    try {
      const res = await fetch("/api/invitation/respond", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ invitation_id: invitationId, response }),
      });

      if (res.ok) {
        const data = await res.json();
        dispatch({
          type: SEND_INVITATIONS_SUCCESS,
          message: data.message, // Notify the user that their response was recorded
        });
        dispatch(fetchReceivedInvitations()); // Optionally refetch invitations to update the UI
      } else {
        const error = await res.json();
        dispatch({
          type: SEND_INVITATIONS_SUCCESS,
          message: error.error,
        });
      }
    } catch (err) {
      console.error("Failed to respond to invitation", err);
      dispatch({
        type: SEND_INVITATIONS_SUCCESS,
        message: "Failed to respond to invitation.",
      });
    }
  };

// Thunk: Cancel an Invitation
export const cancelInvitation = (invitationId) => async (dispatch) => {
  try {
    const response = await fetch(`/api/invitation/cancel/${invitationId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      const data = await response.json();
      dispatch({
        type: SEND_INVITATIONS_SUCCESS,
        message: data.message, // Notify the user that the invitation was canceled
      });
      dispatch(removeInvitation(invitationId)); // Dispatch action to remove the invitation from Redux
    } else {
      const error = await response.json();
      dispatch({
        type: SEND_INVITATIONS_SUCCESS,
        message: error.error, // Notify the user about the error
      });
    }
  } catch (err) {
    console.error("Failed to cancel invitation", err);
    dispatch({
      type: SEND_INVITATIONS_SUCCESS,
      message: "Failed to cancel invitation.",
    });
  }
};

// Initial State
const initialState = {
  receivedInvitations: [],
  message: null,
};

// Reducer
export default function invitationReducer(state = initialState, action) {
  switch (action.type) {
    case SET_RECEIVED_INVITATIONS:
      return {
        ...state,
        receivedInvitations: action.invitations,
      };
    case REMOVE_INVITATION:
      return {
        ...state,
        receivedInvitations: state.receivedInvitations.filter(
          (invitation) => invitation.id !== action.invitationId
        ),
      };
    case SEND_INVITATIONS_SUCCESS:
      return {
        ...state,
        message: action.message, // Update the message in the state
      };
    default:
      return state;
  }
}
