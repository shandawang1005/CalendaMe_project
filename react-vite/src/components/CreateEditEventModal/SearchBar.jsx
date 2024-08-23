import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { searchFriendsForEvent, clearSearchResults } from "../../redux/friends"; // Adjust based on your redux actions
import "./SearchBar.css"; // Add your custom CSS here

const SearchBar = ({ onSelectFriend }) => {
  const dispatch = useDispatch();
  const [query, setQuery] = useState("");
  const searchResults = useSelector(
    (state) => state.friends.searchResults || []
  );

  useEffect(() => {
    return () => {
      dispatch(clearSearchResults()); // Clear results when the component unmounts
    };
  }, [dispatch]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      dispatch(searchFriendsForEvent(query.trim())); // Dispatch action to search for friends
    }
  };

  const handleSelectFriend = (friend) => {
    onSelectFriend(friend); // Callback to add selected friend to invite list
  };

  return (
    <div className="search-bar">
      <form onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="Search for friends"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button type="submit">Search</button>
      </form>
      <ul className="search-results">
        {searchResults.map((friend) => (
          <li key={friend.id} onClick={() => handleSelectFriend(friend)}>
            {friend.username} ({friend.email})
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SearchBar;
