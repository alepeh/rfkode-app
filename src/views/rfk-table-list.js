import { html } from 'lit-element';
import { PageViewElement } from '../components/page-view-element.js';
import { dbApiClient } from '../components/ApiClientFactory.js';

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
      tables : { type: Object}
    }
  }

  connectedCallback() {
    super.connectedCallback();
    this.getResources();
  }

  render() {
    return html`
      <section>
        <h2>Table List</h2>
        <p>
        ${this.tables.map(
          (resource) => html`
            <div><a href="/table?name=${resource.name}">${this.capitalize(resource.name)}</a></div>
          `
        )}
        </p>
      </section>
    `
  }
  
  capitalize(text){
    return text.replace(/_/g, ' ').toLowerCase();
  }

  getResources(){
      dbApiClient().fetchResources()
        .then((data) => {
            this.tables = data.resource;
            console.dir(data);
        }
    )
    .catch(function (err) {
        console.log('Fetch Error :-S', err);
    });
  }
}
window.customElements.define('rfk-table-list', RfkTableList);
