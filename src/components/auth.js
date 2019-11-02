import createAuth0Client from '@auth0/auth0-spa-js';
import { store } from '../store.js';
// These are the actions needed by this element.
import { updateLoginState } from '../actions/app.js';

class Auth {

    constructor(){
        this.auth0;
    }

    async _configureClient() {
        this.auth0 = await createAuth0Client({
            domain: "dev-dzzf-al0.eu.auth0.com",
            clientId: "l5Ttrvjjt21czQJROZK1EaBdoQ8BRasi",
            audience : "https://lake.alexanderpehm.at"
        });
    };

    async loginWithRedirect(redirectUri){
        await this._configureClient();
        await this.auth0.loginWithRedirect({
            redirect_uri: redirectUri
        });
    }
    
    async handleRedirectCallback(){
        await this._configureClient();
        await this.auth0.handleRedirectCallback();
        console.log("clientConfigured");
    }

    async getTokenSilently(){
        await this._configureClient();
        const token = await this.auth0.getTokenSilently().catch(error => {
            console.log(error);
            store.dispatch(updateLoginState({loggedIn: false, username : '', token: ''}));
        });
        if (token){
            const user = await this.auth0.getUser();
            console.dir(user);
            store.dispatch(updateLoginState({loggedIn: true, username : user.name, token: token}));
            return token;
        }
        return '';
    }

    async isAuthenticated(){
        return this.auth0.isAuthenticated();
    }

}
export let authenticator = new Auth();