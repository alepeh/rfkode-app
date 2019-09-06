import { html } from 'lit-element';
import { PageViewElement } from '../components/page-view-element.js';
import { db } from '../components/database.js';

// These are the shared styles needed by this element.
import { SharedStyles } from '../components/shared-styles.js';

class RfkTableList extends PageViewElement {
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
      <section>
        <h2>Table List</h2>
        <p>
        ${this.schemas.map(
          (schema) => html`
            <div><a href="/table?name=${schema.doc._id}">${schema.doc.name}</a></div>
          `
        )}
        </p>
      </section>
    `
  }
}
window.customElements.define('rfk-table-list', RfkTableList);
