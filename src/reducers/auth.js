import { LOGIN, LOGOUT } from '../actions/auth.js'

const INITIAL_STATE = {
    username: '',
    token: ''
  };
  
const auth = (state = INITIAL_STATE, action) => {
    switch (action.type) {
      case LOGIN:
        return {
            username: action.username,
            token: action.token
        };
      case LOGOUT:
        return {
           username: '',
           token: ''
        };
      default:
        return state;
    }
  };
  
  export default auth;