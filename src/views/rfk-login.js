import { html, css } from 'lit-element';
import { PageViewElement } from '../components/page-view-element.js';
import { RfkLoginForm } from '../components/rfk-login-form.js'
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

  render() {
    return html`
      <section>
        <h2>Login</h2>
        <div style='{margin: 0 auto;}'>
          <rfk-login-form
          @user-loggedin="${e => this._userLoggedIn(e)}">
          </rfk-login-form>
        </div>

      </section>
    `;
  }

  _userLoggedIn(e) {
    console.log("User logged in");
    store.dispatch(login(e.detail.username, e.detail.token))
    store.dispatch(navigate(decodeURIComponent('#table-list')));
  }

}
window.customElements.define('rfk-login', RfkLogin);