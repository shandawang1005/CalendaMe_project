import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchReceivedInvitations,
  respondToInvitation,
  cancelInvitation,
} from "../../redux/invitation";

const InvitationsPage = () => {
  const dispatch = useDispatch();
  const invitations = useSelector(
    (state) => state.invitations.receivedInvitations
  );
  const currentUser = useSelector((state) => state.session.user); // Assuming the current user is stored in session

  useEffect(() => {
    dispatch(fetchReceivedInvitations());
  }, [dispatch]);

  const handleResponse = (invitationId, response) => {
    dispatch(respondToInvitation(invitationId, response));
  };

  const handleCancel = (invitationId) => {
    dispatch(cancelInvitation(invitationId)); // Dispatch to cancel the invitation
  };

  const calculateDurationInMinutes = (startTime, endTime) => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const durationMs = end - start;
    const durationMinutes = Math.round(durationMs / 60000); // Convert milliseconds to minutes and round
    return durationMinutes;
  };

  return (
    <div>
      <h2>Your Invitations</h2>
      <ul>
        {invitations.map((invitation) => (
          <li key={invitation.id}>
            <p>
              <strong>Event:</strong> {invitation.event_title} <br />
              <strong>Status:</strong> {invitation.status} <br />
              <strong>Start Time:</strong>{" "}
              {new Date(invitation.event_start_time).toLocaleString()} <br />
              <strong>Duration:</strong>{" "}
              {calculateDurationInMinutes(
                invitation.event_start_time,
                invitation.event_end_time
              )}{" "}
              minutes <br />
              <strong>Location:</strong> {invitation.event_location || "N/A"}{" "}
              <br />
              {invitation.inviter_id === currentUser.id
                ? `You sent this invitation to ${invitation.invitee_name}`
                : `You were invited by ${invitation.inviter_name}`}
            </p>

            {/* If the current user is the inviter, allow cancellation */}
            {invitation.inviter_id === currentUser.id ? (
              <button onClick={() => handleCancel(invitation.id)}>
                Cancel Invitation
              </button>
            ) : (
              <>
                {invitation.status === "pending" && (
                  <>
                    <button
                      onClick={() => handleResponse(invitation.id, "accepted")}
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => handleResponse(invitation.id, "declined")}
                    >
                      Decline
                    </button>
                  </>
                )}
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default InvitationsPage;
