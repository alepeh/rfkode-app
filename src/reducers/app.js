import {
    UPDATE_PAGE,
    UPDATE_OFFLINE,
    OPEN_SNACKBAR,
    CLOSE_SNACKBAR,
    UPDATE_DRAWER_STATE,
    LOGIN,
    UPDATE_SYNC_STATE
  } from '../actions/app.js';
  
  const INITIAL_STATE = {
    page: '',
    offline: false,
    drawerOpened: false,
    snackbarOpened: false,
    loggedIn: false,
    syncState: 'PENDING'
  };
  
  const app = (state = INITIAL_STATE, action) => {
    switch (action.type) {
      case UPDATE_PAGE:
        return {
          ...state,
          page: action.page
        };
      case UPDATE_OFFLINE:
        return {
          ...state,
          offline: action.offline
        };
      case UPDATE_DRAWER_STATE:
        return {
          ...state,
          drawerOpened: action.opened
        };
      case OPEN_SNACKBAR:
        return {
          ...state,
          snackbarOpened: true
        };
      case CLOSE_SNACKBAR:
        return {
          ...state,
          snackbarOpened: false
        };
      case LOGIN:
        return {
          ...state,
          loggedIn: action.loggedIn,
          username: action.username,
          token: action.token
        };
      case UPDATE_SYNC_STATE:
        console.dir(action);
        return {
          ...state,
          syncState: action.syncState,
          syncError: action.syncError
        };
      default:
        return state;
    }
  };
  
  export default app;