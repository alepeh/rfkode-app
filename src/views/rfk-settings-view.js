import { html } from 'lit-element';
import { PageViewElement } from '../components/page-view-element.js';
import { RfkDatabaseReplicator } from '../components/rfk-database-replicator';
import "@vaadin/vaadin-text-field/vaadin-password-field.js";
import "@vaadin/vaadin-button/vaadin-button.js";
// These are the shared styles needed by this element.
import { SharedStyles } from '../components/shared-styles.js';

class RfkSettingsView extends PageViewElement {
  static get styles() {
    return [
      SharedStyles
    ];
  }

  render() {
    return html`
      <section>
        <h2>Settings</h2>
        <rfk-database-replicator></rfk-database-replicator>
      </section>
    `;
  }
}
window.customElements.define('rfk-settings-view', RfkSettingsView);