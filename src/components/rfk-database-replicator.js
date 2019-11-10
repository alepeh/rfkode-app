import { html, LitElement } from 'lit-element';
import { db } from "../components/db/database.js";
import "@vaadin/vaadin-custom-field/vaadin-custom-field.js"
import "@vaadin/vaadin-button/vaadin-button.js";
import { connect } from 'pwa-helpers/connect-mixin.js';
import { store } from '../state/store.js';
import "@vaadin/vaadin-icons/vaadin-icons.js"

export class RfkDatabaseReplicator extends connect(store)(LitElement) {

    constructor(){
        super();
        this.token;
    }

    static get properties() {
      return {
        _inSync: { type: Boolean }
      };
    }

    stateChanged(state){
      this.token = state.app.token;
      this._inSync = (state.app.syncState === 'COMPLETE' ? true : false);
      console.log("InSync: " + this._inSync);
    }

    render(){
        return html`
        <div style='{margin: 0 auto;}'>
          <vaadin-custom-field label="Replication">
          <vaadin-button @click=${this._sync}>Sync</vaadin-button>
            ${this._inSync
              ? html`<iron-icon icon="vaadin:vaadin:check"></iron-icon>`
              : html`Pending`
          }
        </vaadin-custom-field>
        </div>
        `;
    }

    _sync(){
        console.log("Token is " + this.token);
        db.sync(this.token);
      }
}
window.customElements.define('rfk-database-replicator', RfkDatabaseReplicator);
