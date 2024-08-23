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

const sendInvitationsSuccess = (message) => ({
  type: SEND_INVITATIONS_SUCCESS,
  message,
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
        alert("Received invalid JSON. Please try again later.");
      }
    } else {
      const errorText = await response.text(); // Fetch error response as text (in case it's HTML)
      console.error("Error fetching invitations:", errorText);
      alert("Failed to fetch invitations.");
    }
  } catch (err) {
    console.error("Failed to fetch received invitations", err);
    alert("An error occurred while fetching invitations.");
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
      body: JSON.stringify({ event_id: eventId, invitee_ids: inviteeIds }),
    });

    if (response.ok) {
      const data = await response.json();
      dispatch(sendInvitationsSuccess(data.message));
      alert("Invitations sent successfully!");
    } else {
      const error = await response.json();
      alert(error.error);
    }
  } catch (err) {
    console.error("Failed to send invitations", err);
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
        alert(data.message); // Notify the user that their response was recorded
        dispatch(fetchReceivedInvitations()); // Optionally refetch invitations to update the UI
      } else {
        const error = await res.json();
        alert(error.error);
      }
    } catch (err) {
      console.error("Failed to respond to invitation", err);
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
      alert(data.message); // Notify the user that the invitation was canceled
      dispatch(removeInvitation(invitationId)); // Dispatch action to remove the invitation from Redux
    } else {
      const error = await response.json();
      alert(error.error);
    }
  } catch (err) {
    console.error("Failed to cancel invitation", err);
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
        message: action.message,
      };
    default:
      return state;
  }
}
