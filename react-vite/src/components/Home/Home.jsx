import "./Home.css";
import { useState } from "react";
import { thunkLogin } from "../../redux/session";
import { useDispatch, useSelector } from "react-redux";
import { Navigate, useNavigate } from "react-router-dom";
import LoginFormPage from "../LoginFormPage";
import Dashboard from "../DashBoard";

function Home() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.session.user);
  return <>{user ? <Dashboard /> : <LoginFormPage />}</>;
}
export default Home;
