import { html } from 'lit-element';
import { PageViewElement } from '../components/page-view-element.js';
import { db } from '../components/db/database.js';

// These are the shared styles needed by this element.
import { SharedStyles } from '../components/shared-styles.js';
import "@vaadin/vaadin-item/vaadin-item.js"
import "@vaadin/vaadin-text-field/vaadin-text-field.js";
import "@vaadin/vaadin-button/vaadin-button.js";

export class RfkTableListView extends PageViewElement {
  static get styles() {
    return [
      SharedStyles
    ];
  }

  static get properties() {
    return {
      schemas : { type: Object}
    }
  }

  connectedCallback() {
    super.connectedCallback();
  }

  attributeChangedCallback(name,oldValue, newValue){
    super.attributeChangedCallback(name, oldValue, newValue);
    if(name === 'active' && newValue != null){
      db.allSchemas().then((docs => {
        this.schemas = docs.rows;
      }));
    }
}

  render() {
    return html`
    <vaadin-text-field id="schemaName" placeholder="Schema Name"></vaadin-text-field>
    <vaadin-button id="saveBtn" @click="${() => this.createNewSchema()}">Neu</vaadin-button>

      <section>
        ${this.schemas.map(
          (schema) => html`
            <vaadin-item><a href="/table?name=${schema.doc._id}">${schema.doc.name}</a></vaadin-item>
          `
        )}
      </section>
    `
  }

  createNewSchema(){
    const schemaName = this.shadowRoot.getElementById("schemaName").value;
    if(schemaName){
      const schemaDocument = {
        "_id" : "schema:" + schemaName.toLowerCase() + ":v1",
        "name" : schemaName,
        "jsonSchema" : {}
      }
      db.put(schemaDocument);
      this.shadowRoot.getElementById("schemaName").value = '';
      this.requestUpdate();
    }
    else {
      console.log("No Schema Name specified");
    }
    }
    
}
window.customElements.define('rfk-table-list-view', RfkTableListView);