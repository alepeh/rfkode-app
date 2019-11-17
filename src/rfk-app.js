import { LitElement, html, css } from 'lit-element';
import '@polymer/app-layout/app-drawer/app-drawer.js';
import '@polymer/app-layout/app-header/app-header.js';
import '@polymer/app-layout/app-scroll-effects/effects/waterfall.js';
import '@polymer/app-layout/app-toolbar/app-toolbar.js';
import { connect } from 'pwa-helpers/connect-mixin.js';
import { installMediaQueryWatcher } from 'pwa-helpers/media-query.js';
import { installOfflineWatcher } from 'pwa-helpers/network.js';
import { installRouter } from 'pwa-helpers/router.js';
import { updateMetadata } from 'pwa-helpers/metadata.js';
import "@vaadin/vaadin-icons/vaadin-icons.js"
import './components/snack-bar.js';
import { authenticator } from './components/auth.js'
import { store } from './state/store.js';
import {
    navigate,
    updateOffline,
  } from './state/actions/app.js';


class RfkApp extends connect(store)(LitElement) {

    static get properties() {
        return {
          appTitle: { type: String },
          _page: { type: String },
          _snackbarOpened: { type: Boolean },
          _offline: { type: Boolean },
          _loggedIn: { type: Boolean}
        };
      }

    constructor(){
        super();
    }

    render() {
        return html`
          <!-- Header -->
          <app-header condenses reveals effects="waterfall">
            <app-toolbar class="toolbar-top">
              <div @click=${() => store.dispatch(navigate("/table-list"))}><iron-icon icon="vaadin:home-o"></iron-icon></div>
              <div main-title>${this.appTitle}</div>
              <div @click=${() => store.dispatch(navigate("/settings"))}>${this._loggedIn ? html`<iron-icon icon="vaadin:user-check">` : html`<iron-icon icon="vaadin:sign-in">`}</iron-icon></div>
            </app-toolbar>
          </app-header>
          
    
          <!-- Main content -->
          <main role="main" class="main-content">
            <rfk-settings-view class="page" ?active="${this._page === 'settings'}"></rfk-settings-view>
            <rfk-table-list-view class="page" ?active="${this._page === 'table-list'}"></rfk-table-list-view>
            <rfk-table-view class="page" ?active="${this._page === 'table'}"></rfk-table-view>
            <rfk-record-view class="page" ?active="${this._page === 'record-form'}"></rfk-record-view>
            <my-view404 class="page" ?active="${this._page === 'view404'}"></my-view404>
           </main>

          <snack-bar ?active="${this._snackbarOpened}">
            You are now ${this._offline ? 'offline' : 'online'}.
          </snack-bar>
        `;
      }

      firstUpdated() {
        installRouter((location) => store.dispatch(navigate((location.pathname + location.search))));
        installOfflineWatcher((offline) => store.dispatch(updateOffline(offline)));
        authenticator.getTokenSilently();
      }
    
      updated(changedProps) {
        if (changedProps.has('_page')) {
          const pageTitle = this.appTitle + ' - ' + this._page;
          updateMetadata({
            title: pageTitle,
            description: pageTitle
            // This object also takes an image property, that points to an img src.
          });
        }
      }
    
      stateChanged(state) {
        this._page = state.app.page;
        this._offline = state.app.offline;
        this._snackbarOpened = state.app.snackbarOpened;
        this._loggedIn = state.app.loggedIn;
      }

    static get styles() {
        return [
          css`
            :host {
              display: block;
    
              --app-drawer-width: 256px;
    
              --app-primary-color: #E91E63;
              --app-secondary-color: #293237;
              --app-dark-text-color: var(--app-secondary-color);
              --app-light-text-color: white;
              --app-section-even-color: #f7f7f7;
              --app-section-odd-color: white;
    
              --app-header-background-color: white;
              --app-header-text-color: var(--app-dark-text-color);
              --app-header-selected-color: var(--app-primary-color);
            }
    
            app-header {
              position: fixed;
              top: 0;
              left: 0;
              width: 100%;
              text-align: center;
              background-color: var(--app-header-background-color);
              color: var(--app-header-text-color);
              border-bottom: 1px solid #eee;
            }
    
            .toolbar-top {
              background-color: var(--app-header-background-color);
            }
    
            [main-title] {
              font-family: 'Pacifico';
              text-transform: lowercase;
              font-size: 30px;
              /* In the narrow layout, the toolbar is offset by the width of the
              drawer button, and the text looks not centered. Add a padding to
              match that button */
              padding-right: 44px;
            }
    
            .toolbar-list {
              display: none;
            }
    
            .toolbar-list > a {
              display: inline-block;
              color: var(--app-header-text-color);
              text-decoration: none;
              line-height: 30px;
              padding: 4px 24px;
            }
    
            .toolbar-list > a[selected] {
              color: var(--app-header-selected-color);
              border-bottom: 4px solid var(--app-header-selected-color);
            }
    
            .menu-btn {
              background: none;
              border: none;
              fill: var(--app-header-text-color);
              cursor: pointer;
              height: 44px;
              width: 44px;
            }
    
    
            /* Workaround for IE11 displaying <main> as inline */
            main {
              display: block;
            }
    
            .main-content {
              padding-top: 64px;
              min-height: 100vh;
            }
    
            .page {
              display: none;
            }
    
            .page[active] {
              display: block;
              position: relative;
              z-index: 1;
            }
    
            /* Wide layout: when the viewport width is bigger than 460px, layout
            changes to a wide layout */
            @media (min-width: 460px) {
    
            .main-content {
                padding-top: 107px;
              }
            }
          `
        ];
      }
}
window.customElements.define('rfk-app', RfkApp);