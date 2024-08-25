import { createBrowserRouter } from "react-router-dom";
import LoginFormPage from "../components/LoginFormPage";
import SignupFormPage from "../components/SignupFormPage";
import Layout from "./Layout";
import Home from "../components/Home";
import Calendarpage from "../components/CalendarPage";
import FriendsPage from "../components/FriendsPage";
import MessagesPage from "../components/MessagesPage";
import DayEvent from "../components/DayEvent";
import NotFoundPage from "../components/NotFoundPage";
import InvitationsPage from "../components/MessagesPage/Invitation";
import ChangePasswordPage from "../components/ChangePasswordPage/ChangePasswordPage";
import Profile from "../components/Profile";
import EventHistory from "../components/EventHistory";
export const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      {
        path: "/",
        element: <Home />,
      },
      {
        path: "login",
        element: <LoginFormPage />,
      },
      {
        path: "signup",
        element: <SignupFormPage />,
      },
      {
        path: "today",
        element: <Calendarpage />,
      },
      {
        path: "friends",
        element: <FriendsPage />,
      },
      {
        path: "messages",
        element: <MessagesPage />,
      },

      {
        path: "invitation",
        element: <InvitationsPage />,
      },
      {
        path: "profile/change-password",
        element: <ChangePasswordPage />,
      },
      {
        path: "profile",
        element: <Profile />,
      },
      {
        path: "timeline/:date",
        element: <DayEvent />,
      },
      {
        path: "history",
        element: <EventHistory />,
      },

      {
        path: "*",
        element: <NotFoundPage />,
      },
    ],
  },
]);
