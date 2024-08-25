
import Calendar from "./Calendar"; // Assuming Calendar is in the same directory
import "./DashBoard.css";

function Dashboard() {


  return (
    <div className="dashboard-container">
      <h1>Welcome to the Dashboard</h1>
      
      {/* Calendar Component */}
      <Calendar />

      
    </div>
  );
}

export default Dashboard;
