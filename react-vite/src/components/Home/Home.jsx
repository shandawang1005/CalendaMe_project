import "./Home.css";
// import { useState } from "react";
// import { thunkLogin } from "../../redux/session";
import { useSelector } from "react-redux";
// import { Navigate, useNavigate } from "react-router-dom";

import Dashboard from "../DashBoard";
import Splashpage from "../SplashPage/Splashpage";

function Home() {
  // const navigate = useNavigate();
  // const dispatch = useDispatch();
  const user = useSelector((state) => state.session.user);
  return <>{user ? <Dashboard /> : <Splashpage />}</>;
}
export default Home;
