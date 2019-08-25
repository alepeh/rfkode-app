import { dbApiClient } from '../components/ApiClientFactory.js';
import { html } from 'lit-element'
import { PageViewElement } from '../components/page-view-element';
import { SharedStyles } from '../components/shared-styles.js';

class RfkTable extends PageViewElement {
    static get styles() {
        return [
          SharedStyles
        ];
      }
    
    static get properties(){
        return {
            tableName : {type: String},
            records : { type: Object }
        }
    }

    constructor() {
        super();
        //this.order = { field: 'DATUM', direction: 'desc'};
        this.table = {};
        this.schema = {};
    }

    attributeChangedCallback(name,oldValue, newValue){
        super.attributeChangedCallback(name, oldValue, newValue);
        if(name === 'active' && newValue != null){
            let params = new URLSearchParams(document.location.search.substring(1));
            let tableNameParam = params.get("name");
            this.tableName = tableNameParam;
            this.table = {};
            this.getResource(tableNameParam);
        }
    }

    async getResource(name){
        await dbApiClient().fetchResourceSchema(name)
            .then((schema) => {
                this.schema = schema;
            });
        await dbApiClient().fetchResourceData(name, this.order)
            .then((data) => {
                this.records = data;
            });
    }

    onAction(action, id){
        //store.dispatch(navigate("/form?tableName=" + this.tableName + (id ? '&recordId=' + id : '') + '&action=' + action));
        document.location = "/record-form?tableName=" + this.tableName + (id ? '&recordId=' + id : '') + '&action=' + action;
    }

    render() {
        return html`
            <section>
                <h2>Table ${this.tableName}</h2>
                <table>
                <tr>

                ${this.schema.field.map(
                  (field) => html`
                  <th id=${field.name}>${field.name}</th>
                  `
                )}
                </tr>
                ${this.records.resource.map(
                    (resource) => html`
                    <tr @click=${_ => this.onAction('edit',resource.ID)}>
                    ${Object.values(resource).map(
                        (row) => html`
                        <td>${row}</td>
                    `)}
                    </tr>
                    `
                  )}
                  </table>
            </section>
            `;
    }
}
window.customElements.define('rfk-table', RfkTable);