import { createBrowserRouter } from "react-router-dom";
import LoginFormPage from "../components/LoginFormPage";
import SignupFormPage from "../components/SignupFormPage";
import Layout from "./Layout";
import Home from "../components/Home";
import Calendarpage from "../components/CalendarPage";
import FriendsPage from "../components/FriendsPage";
import MessagesPage from "../components/MessagesPage";

import NotFoundPage from "../components/NotFoundPage";
import InvitationsPage from "../components/MessagesPage/Invitation";
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
        path: "calendar",
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
        path: "*",
        element: <NotFoundPage />,
      },
    ],
  },
]);
