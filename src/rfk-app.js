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
import { menuIcon} from './components/rfk-icons.js';
import './components/snack-bar.js';
import { store } from './store.js';
import {
    navigate,
    updateOffline,
    updateDrawerState
  } from './actions/app.js';


class RfkApp extends connect(store)(LitElement) {

    static get properties() {
        return {
          appTitle: { type: String },
          _page: { type: String },
          _drawerOpened: { type: Boolean },
          _snackbarOpened: { type: Boolean },
          _offline: { type: Boolean }
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
              <button class="menu-btn" title="Menu" @click="${this._menuButtonClicked}">${menuIcon}</button>
              <div main-title>${this.appTitle}</div>
            </app-toolbar>
          </app-header>
          <!-- Drawer content -->
          <app-drawer
              .opened="${this._drawerOpened}"
              @opened-changed="${this._drawerOpenedChanged}">
              <nav class="drawer-list">
              <a href="/settings">Settings</a>
              <a href="/table-list">Table List</a>
            </nav>
        </app-drawer>
    
          <!-- Main content -->
          <main role="main" class="main-content">
            <rfk-settings-view class="page" ?active="${this._page === 'settings'}"></rfk-settings-view>
            <rfk-table-list class="page" ?active="${this._page === 'table-list'}"></rfk-table-list>
            <rfk-table class="page" ?active="${this._page === 'table'}"></rfk-table>
            <rfk-record-view class="page" ?active="${this._page === 'record-form'}"></rfk-record-form>
            <my-view404 class="page" ?active="${this._page === 'view404'}"></my-view404>
           </main>

          <snack-bar ?active="${this._snackbarOpened}">
            You are now ${this._offline ? 'offline' : 'online'}.
          </snack-bar>
        `;
      }

      firstUpdated() {
        installRouter((location) => store.dispatch(navigate(decodeURIComponent(location.pathname))));
        installOfflineWatcher((offline) => store.dispatch(updateOffline(offline)));
        installMediaQueryWatcher(`(min-width: 460px)`,
            () => store.dispatch(updateDrawerState(false)));
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
    
      _menuButtonClicked() {
        store.dispatch(updateDrawerState(true));
      }
    
      _drawerOpenedChanged(e) {
        store.dispatch(updateDrawerState(e.target.opened));
      }
    
      stateChanged(state) {
        this._page = state.app.page;
        this._offline = state.app.offline;
        this._snackbarOpened = state.app.snackbarOpened;
        this._drawerOpened = state.app.drawerOpened;
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
    
              --app-drawer-background-color: var(--app-secondary-color);
              --app-drawer-text-color: var(--app-light-text-color);
              --app-drawer-selected-color: #78909C;
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
            }
    
            /* Wide layout: when the viewport width is bigger than 460px, layout
            changes to a wide layout */
            @media (min-width: 460px) {
    
            .main-content {
                padding-top: 107px;
              }
            }

            .drawer-list {
                box-sizing: border-box;
                width: 100%;
                height: 100%;
                padding: 24px;
                background: var(--app-drawer-background-color);
                position: relative;
                z-index: 100;
              }
      
              .drawer-list > a {
                display: block;
                text-decoration: none;
                color: var(--app-drawer-text-color);
                line-height: 40px;
                padding: 0 24px;
                z-index: 100;
              }
      
              .drawer-list > a[selected] {
                color: var(--app-drawer-selected-color);
                z-index: 100;
              }
          `
        ];
      }

}
window.customElements.define('rfk-app', RfkApp);