export const UPDATE_PAGE = 'UPDATE_PAGE';
export const UPDATE_OFFLINE = 'UPDATE_OFFLINE';
export const OPEN_SNACKBAR = 'OPEN_SNACKBAR';
export const CLOSE_SNACKBAR = 'CLOSE_SNACKBAR';
export const LOGIN = 'LOGIN';
export const UPDATE_SYNC_STATE = 'UPDATE_SYNC_STATE';

export const navigate = (location) => (dispatch) => {
  //action has been dispatched programmatically, we need to reflect that in the history
  if (location != (window.location.pathname + window.location.search)) {
    window.history.pushState({}, '', location);
  }
  const searchIndex = location.indexOf('?');
  let path = searchIndex > 0 ? location.slice(1, searchIndex) : location.slice(1);
  // Extract the page name from path.
  const page = location === '/' ? 'table-list' : path;
  // Any other info you might want to extract from the path (like page type),
  // you can do here
  dispatch(loadPage(page));
};

const loadPage = (page) => (dispatch) => {
  switch(page) {
    case 'settings':
      import('../../views/rfk-settings-view').then((module) => {
        // Put code in here that you want to run every time when
        // navigating to view1 after my-view1.js is loaded.
      });
      break;
      case 'table-list':
        import('../../views/rfk-table-list').then((module) => {
          console.dir(module);
        });
        break;
        case 'table':
          import('../../views/rfk-table').then((module) => {
            // Put code in here that you want to run every time when
            // navigating to view1 after my-view1.js is loaded.
          });
          break;
        case 'record-form':
            import('../../views/rfk-record-view').then((module) => {
            });
            break;
    default:
      page = 'view404';
      import('../../views/my-view404');
  }
  dispatch(updatePage(page));
};

const updatePage = (page) => {
  return {
    type: UPDATE_PAGE,
    page
    };
};

let snackbarTimer;

export const showSnackbar = () => (dispatch) => {
  dispatch({
    type: OPEN_SNACKBAR
  });
  window.clearTimeout(snackbarTimer);
  snackbarTimer = window.setTimeout(() =>
    dispatch({ type: CLOSE_SNACKBAR }), 3000);
};

export const updateOffline = (offline) => (dispatch, getState) => {
  // Show the snackbar only if offline status changes.
  if (offline !== getState().app.offline) {
    dispatch(showSnackbar());
  }
  dispatch({
    type: UPDATE_OFFLINE,
    offline
  });
};

export const updateLoginState = (authContext) => {
  return {
    type: LOGIN,
    loggedIn : authContext.loggedIn,
    username : authContext.username,
    token : authContext.token
  };
};

export const updateSyncState = (syncState) => {
  return {
    type: UPDATE_SYNC_STATE,
    syncState : syncState.state,
    syncError : syncState.error
  };
};