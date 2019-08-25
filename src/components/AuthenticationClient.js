import * as response from "./ResponseUtils";
import * as token from "./Token";

export default class AuthenticationClient {
    
    constructor(apikey, apiBasePath) {
        this.APIKEY =  apikey;
        this.API_BASE_PATH = apiBasePath;
    }

    login(user, pass) {
        console.log("login with username: " + user);
        return fetch(this.API_BASE_PATH + '/user/session', {
            method: 'post',
            mode: "cors",
            headers: {
                "Content-type": "application/json; charset=UTF-8"
            },
            body: JSON.stringify({
                "email": user,
                "password": pass,
                "remember_me": true
            })
        })
        .then(response.status)
        .then(response.json)
        .then(this.saveToken)
        .then((data) => {
            return data;
        })
        .catch((err) => {
            console.log('Fetch Error :-S', err);
        });
    }

    refreshSessionToken() {
        fetch(this.API_BASE_PATH + '/user/session', {
            method: "put",
            mode: "cors",
            headers: {
                "X-DreamFactory-Session-Token": token.getSessionTokenFromCookie(),
                "X-DreamFactory-API-Key": this.APIKEY
            }
        })
        .then(response.status)
        .then(response.json)
        .then(this.saveToken)
        .catch((err) => {
            console.log('Fetch Error on refresh :-S', err);
        });
    }

    saveToken(data) {
        token.saveSessionTokenInCookie(data.session_token);
        return data;
    }

    refreshTokenIfRequired(){
        if(token.isSessionTokenExpired()){
            console.log("Session Token is expired - trying to refresh")
            return this.refreshSessionToken();
        } else {
            console.log("Session Token still valid")
            return Promise.resolve();
        }
    }
}