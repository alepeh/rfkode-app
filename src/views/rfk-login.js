import { html, css } from 'lit-element';
import { PageViewElement } from '../components/page-view-element.js';
import "@vaadin/vaadin-text-field/vaadin-password-field.js";
import "@vaadin/vaadin-button/vaadin-button.js";
import { db } from "../components/database.js";
// These are the shared styles needed by this element.
import { SharedStyles } from '../components/shared-styles.js';

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

class RfkLogin extends PageViewElement {
  static get styles() {
    return [
      SharedStyles
    ];
  }

  constructor(){
    super();
    this.username = '';
    this.password = '';
  }

  render() {
    return html`
      <section>
        <h2>Login</h2>
        <div style='{margin: 0 auto;}'>
        <vaadin-text-field label="Username" id="username" .value="${this.username}">
        </vaadin-text-field>
        <vaadin-password-field label="Password" id="password" .value="${this.password}">
        </vaadin-password-field>
        <vaadin-button @click=${this._login}>Login</vaadin-button>
        </div>

      </section>
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
window.customElements.define('rfk-login', RfkLogin);