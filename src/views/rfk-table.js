import { db } from '../components/database.js';
import { html } from 'lit-element'
import { PageViewElement } from '../components/page-view-element';
import { SharedStyles } from '../components/shared-styles.js';
import { store } from '../store.js';
import { navigate } from '../actions/app.js';
import { installRouter } from 'pwa-helpers/router.js';


class RfkTable extends PageViewElement {
    static get styles() {
        return [
          SharedStyles
        ];
      }
    
    static get properties(){
        return {
            tableName : {type: String},
            schema : { type :Object },
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
        await db.getDocument(name).then((schema) => {
            this.schema = schema;
            this.tableName = schema.name;
        })
        await db.allDocsOfSchema(name).then((records) => {
            this.records = records;
            console.dir(records);
        });
    }

    onAction(action, id){
        //store.dispatch(navigate("/record-form?tableName=" + this.tableName + (id ? '&recordId=' + id : '') + '&action=' + action));
        //window.location = "/record-form?tableName=" + this.schema._id + (id ? '&recordId=' + id : '') + '&action=' + action;
    }

    firstUpdated() {
        //installRouter((location) => store.dispatch(navigate(decodeURIComponent(location.pathname))));
    }

    render() {
        return html`
            <section>
                <h2>Table ${this.tableName}</h2>
                <table>
                <tr>
                ${Object.keys(this.schema.jsonSchema.properties).map(
                  (field) => html`
                  <th id=${field}>${field}</th>
                  `
                )}
                </tr>
                ${this.records.rows.map(
                    (row) => html`
                    <tr>
                    <a href="/record-form?tableName=${this.schema._id + '&recordId=' + row.doc._id + '&action=edit'}">
                    ${Object.keys(this.schema.jsonSchema.properties).map(
                        (field) => html`
                    <td>${row.doc[field]}</td>`
                )}  </a>
                    </tr>
                    `
                  )}
                <td>
                </td>
                  </table>
            </section>
            `;
    }
}
window.customElements.define('rfk-table', RfkTable);