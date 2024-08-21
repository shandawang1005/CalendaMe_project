import { createBrowserRouter } from "react-router-dom";
import LoginFormPage from "../components/LoginFormPage";
import SignupFormPage from "../components/SignupFormPage";
import Layout from "./Layout";
import Home from "../components/Home";
import Calendarpage from "../components/CalendarPage";
import FriendsPage from "../components/FriendsPage";
import Messagespage from "../components/MessagesPage";
import Notificationpage from "../components/NotificationPage";
import NotFoundPage from "../components/NotFoundPage";
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
        element: <Messagespage />,
      },
      {
        path: "notification",
        element: <Notificationpage />,
      },
      {
        path: "*",
        element: <NotFoundPage />,
      },
    ],
  },
]);
