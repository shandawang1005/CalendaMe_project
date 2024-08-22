// Actions
const SET_RECEIVED_INVITATIONS = "invitations/SET_RECEIVED_INVITATIONS";
const REMOVE_INVITATION = "invitations/REMOVE_INVITATION";

// Action Creators
const setReceivedInvitations = (invitations) => ({
  type: SET_RECEIVED_INVITATIONS,
  invitations,
});

const removeInvitation = (invitationId) => ({
  type: REMOVE_INVITATION,
  invitationId,
});

// Thunk: Send Invitations
export const sendInvitations = (eventId, inviteeIds) => async (dispatch) => {
  try {
    const response = await fetch("/api/invitations/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ event_id: eventId, invitee_ids: inviteeIds }),
    });

    if (response.ok) {
      const data = await response.json();
      alert(data.message); // Notify the user that invitations were sent
    } else {
      const error = await response.json();
      alert(error.error);
    }
  } catch (err) {
    console.error("Failed to send invitations", err);
  }
};

// Thunk: Fetch Received Invitations
export const fetchReceivedInvitations = () => async (dispatch) => {
  try {
    const response = await fetch("/api/invitations/received", {
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      const invitations = await response.json();
      dispatch(setReceivedInvitations(invitations)); // Dispatch action to set invitations in Redux
    } else {
      const error = await response.json();
      alert(error.error);
    }
  } catch (err) {
    console.error("Failed to fetch received invitations", err);
  }
};

// Thunk: Respond to an Invitation
export const respondToInvitation =
  (invitationId, response) => async (dispatch) => {
    try {
      const res = await fetch("/api/invitations/respond", {
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
    const response = await fetch(`/api/invitations/cancel/${invitationId}`, {
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
    default:
      return state;
  }
}
