import createAuth0Client from '@auth0/auth0-spa-js';
import { PageViewElement } from '../components/page-view-element';
import { SharedStyles } from '../components/shared-styles.js';
import { html } from "lit-element";


class RfkLoginView extends PageViewElement {

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

    async _configureClient() {
        const response = await fetch("/config.json");
        const config = await response.json();

        this.auth0 = await createAuth0Client({
            domain: config.domain,
            client_id: config.clientId
        });
    };

    async attributeChangedCallback(name, oldValue, newValue) {
        super.attributeChangedCallback(name, oldValue, newValue);
        if (name === 'active' && newValue != null) {
            console.log("isActive");
            await this._configureClient();
            console.log("clientConfigured");
            const query = window.location.search;
            if (query.includes("code=") && query.includes("state=")) {
                // Process the login state
                await this.auth0.handleRedirectCallback();
                window.history.replaceState({}, document.title, "/login");
            }
            this.isAuthenticated = await this.auth0.isAuthenticated();
            console.log(this.isAuthenticated);
        }
    }

    render() {
        return html`
        <h2>Login</h2>
        <button id="btn-login" ?disabled=${this.isAuthenticated} @click=${() => this.login()}>Log in</button>
        <button id="btn-logout" ?disabled=${!this.isAuthenticated} @click="${() => this.logout()}">Log out</button>
        `;
    }

    async login() {
        await this.auth0.loginWithRedirect({
            redirect_uri: window.location.href
        });
    };
}
window.customElements.define('rfk-login-view', RfkLoginView);