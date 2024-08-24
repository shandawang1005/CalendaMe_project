import "./Profile.css";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { thunkFetchProfile, thunkUpdateProfile } from "../../redux/session"; 

function Profile() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.session.user);
  const [username, setUsername] = useState(user?.username || "");
  const [email, setEmail] = useState(user?.email || "");
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    // Fetch the profile data when the component mounts
    dispatch(thunkFetchProfile());
  }, [dispatch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Dispatch the thunk to update the profile information
    dispatch(thunkUpdateProfile({ username, email }));
    setEditMode(false);
  };

  return (
    <div className="profile-container">
      <h2>Your Profile</h2>
      {editMode ? (
        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <button type="submit">Save Changes</button>
        </form>
      ) : (
        <div>
          <p>
            <strong>Username:</strong> {user.username}
          </p>
          <p>
            <strong>Email:</strong> {user.email}
          </p>
          <button onClick={() => setEditMode(true)}>Edit Profile</button>
        </div>
      )}
    </div>
  );
}

export default Profile;
