import { LitElement, html } from "lit-element";
import { authenticationClient } from "./ApiClientFactory";
import "@vaadin/vaadin-text-field/vaadin-password-field.js";
import "@vaadin/vaadin-button/vaadin-button.js"


export class RfkLoginForm extends LitElement {

    static get properties() {
      return {
        username: { type: String },
      }
    }

    constructor(){
        super();
        this.username = '';
        this.password = '';
    }

    render() {
        return html`
              <vaadin-text-field label="Username" id="username" .value="${this.username}">
              </vaadin-text-field>
              <vaadin-password-field label="Password" id="password" .value="${this.password}">
              </vaadin-password-field>
              <vaadin-button @click=${this._login}>Login</vaadin-button>
        `;
      }

      _login(){
        this.username = this.shadowRoot.getElementById("username").value
        this.password = this.shadowRoot.getElementById("password").value
        authenticationClient().login(this.username, this.password).then((data) => {
          const event = new CustomEvent('user-loggedin', 
            {
                detail: {token: data.session_token, username: data.name},
                bubbles: true
            });
            this.dispatchEvent(event);
            this.username = '';
            this.password = '';
            this.render();
        });
    }
}
window.customElements.define('rfk-login-form', RfkLoginForm);