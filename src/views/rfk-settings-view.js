import createAuth0Client from '@auth0/auth0-spa-js';
import { PageViewElement } from '../components/page-view-element';
import { SharedStyles } from '../components/shared-styles.js';
import { html } from "lit-element";
import "jwt-decode/build/jwt-decode.js";
import { authenticator } from "../components/auth.js"
import { RfkDatabaseReplicator } from '../components/rfk-database-replicator';
import "@vaadin/vaadin-button/vaadin-button.js";

class RfkSettingView extends PageViewElement {

    constructor(){
        super();
        this.accessToken = '';
        this.user = '';
    }

    static get styles() {
        return [
            SharedStyles
        ];
    }

    static get properties() {
        return {
            isAuthenticated: { type: String }
        }
    }

    async attributeChangedCallback(name, oldValue, newValue) {
        super.attributeChangedCallback(name, oldValue, newValue);
        if (name === 'active' && newValue != null) {
            console.log("isActive");
            const query = window.location.search;
            if (query.includes("code=") && query.includes("state=")) {
                await authenticator.handleRedirectCallback();
                window.history.replaceState({}, document.title, "/login");
            }
            this.accessToken = await authenticator.getTokenSilently();
            this.isAuthenticated = await authenticator.isAuthenticated();
            console.log(this.isAuthenticated);
            console.log(jwt_decode(this.accessToken));
        }
    }

    render() {
        return html`
        <vaadin-button id="btn-login" ?disabled=${this.isAuthenticated} @click=${() => this.login()}>Log in</vaadin-button>
        <rfk-database-replicator></rfk-database-replicator>
        `;
    }

    login() {
        authenticator.loginWithRedirect(window.location.href);
    };
}
window.customElements.define('rfk-settings-view', RfkSettingView);