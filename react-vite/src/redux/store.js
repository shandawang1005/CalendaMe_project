import {
  legacy_createStore as createStore,
  applyMiddleware,
  compose,
  combineReducers,
} from "redux";
import thunk from "redux-thunk";
import sessionReducer from "./session";
import friendsReducer from "./friends";
import eventsReducer from "./event";
import invitationReducer from "./invitation";
import messagesReducer from "./messages";
const rootReducer = combineReducers({
  session: sessionReducer,
  friends: friendsReducer,
  events: eventsReducer,
  invitations: invitationReducer,
  messages: messagesReducer,
});

let enhancer;
if (import.meta.env.MODE === "production") {
  enhancer = applyMiddleware(thunk);
} else {
  const logger = (await import("redux-logger")).default;
  const composeEnhancers =
    window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
  enhancer = composeEnhancers(applyMiddleware(thunk, logger));
}

const configureStore = (preloadedState) => {
  return createStore(rootReducer, preloadedState, enhancer);
};

export default configureStore;
