import { html, LitElement } from 'lit-element';
import { db } from "../components/database.js";
// This element is connected to the Redux store.
import { store } from '../store.js';
import { navigate } from '../actions/app.js';

// These are the actions needed by this element.
import { login, logout } from '../actions/auth.js';

// We are lazy loading its reducer.
import auth from '../reducers/auth.js';
store.addReducers({
  auth
});

export class RfkDatabaseReplicator extends LitElement {

    constructor(){
        super();
        this.username = '';
        this.password = '';
      }

    render(){
        return html`
        <div style='{margin: 0 auto;}'>
        <vaadin-text-field label="Username" id="username" .value="${this.username}">
        </vaadin-text-field>
        <vaadin-password-field label="Password" id="password" .value="${this.password}">
        </vaadin-password-field>
        <vaadin-button @click=${this._login}>Login</vaadin-button>
        </div>
        `;
    }

    _login(){
        this.username = this.shadowRoot.getElementById("username").value
        this.password = this.shadowRoot.getElementById("password").value
        db.sync(this.username, this.password).then(() => {
          console.log("User logged in");
          store.dispatch(login())
          store.dispatch(navigate(decodeURIComponent('#table-list')));
        });
      }
}
window.customElements.define('rfk-database-replicator', RfkDatabaseReplicator);
