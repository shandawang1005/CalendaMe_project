import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  fetchReceivedInvitations,
  respondToInvitation,
  cancelInvitation,
} from "../../redux/invitation";
import { useNotification } from "../NotificationPage/NotificationContainer"; // Import useNotification hook
import "./InvitationsPage.css"; // Import CSS for styling

const InvitationsPage = () => {
  const navigate = useNavigate();
  const user = useSelector((state) => state.session.user);
  useEffect(() => {
    if (!user) {
      navigate("/");
    }
  }, [user, navigate]);

  const dispatch = useDispatch();
  const invitations = useSelector(
    (state) => state.invitations.receivedInvitations
  );
  const currentUser = useSelector((state) => state.session.user);
  const { addNotification } = useNotification();

  useEffect(() => {
    dispatch(fetchReceivedInvitations());
  }, [dispatch]);

  const handleResponse = (invitationId, response) => {
    dispatch(respondToInvitation(invitationId, response));
    addNotification(`Invitation ${response} successfully.`, "success", 3000);
  };

  const handleCancel = (invitationId) => {
    dispatch(cancelInvitation(invitationId));
    addNotification("Invitation canceled successfully.", "success", 3000);
  };

  const calculateDurationInMinutes = (startTime, endTime) => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const durationMs = end - start;
    const durationMinutes = Math.round(durationMs / 60000);
    return durationMinutes;
  };
  const formatName = (name) => {
    if (!name) return "Unknown"; // Fallback to "Unknown" if name is null/undefined
    return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
  };
  return (
    <div className="invitations-page-container">
      <h2 className="invitations-heading">Your Invitations</h2>

      <ul className="invitations-list">
        {invitations.length > 0 ? (
          invitations.map((invitation) => (
            <li key={invitation.id} className="invitation-item">
              <div className="invitation-details">
                <p>
                  <strong>Event:</strong> {invitation.event_title} <br />
                  <strong>Status:</strong> {invitation.status} <br />
                  <strong>Start Time:</strong>{" "}
                  {new Date(invitation.event_start_time).toLocaleString()}{" "}
                  <br />
                  <strong>Duration:</strong>{" "}
                  {calculateDurationInMinutes(
                    invitation.event_start_time,
                    invitation.event_end_time
                  )}{" "}
                  minutes <br />
                  <strong>Location:</strong>{" "}
                  {invitation.event_location || "N/A"} <br />
                  {invitation.inviter_id === currentUser.id ? (
                    <span>
                      You sent this invitation to{" "}
                      {formatName(invitation.invitee_name)}
                    </span>
                  ) : (
                    <span>You were invited by {invitation.inviter_name}</span>
                  )}
                </p>
              </div>

              <div className="invitation-actions">
                {invitation.inviter_id === currentUser.id ? (
                  <button
                    className="invitation-button cancel-button"
                    onClick={() => handleCancel(invitation.id)}
                  >
                    Cancel Invitation
                  </button>
                ) : (
                  invitation.status === "pending" && (
                    <>
                      <button
                        className="invitation-button accept-button"
                        onClick={() =>
                          handleResponse(invitation.id, "accepted")
                        }
                      >
                        Accept
                      </button>
                      <button
                        className="invitation-button decline-button"
                        onClick={() =>
                          handleResponse(invitation.id, "declined")
                        }
                      >
                        Decline
                      </button>
                    </>
                  )
                )}
              </div>
            </li>
          ))
        ) : (
          <>
            <div>

            </div>
            <p className="no-invitations-message">No invitations available.</p>
          </>
        )}
      </ul>
    </div>
  );
};

export default InvitationsPage;
