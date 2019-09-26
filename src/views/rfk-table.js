import { db } from '../components/database.js';
import { html, css } from 'lit-element'
import { PageViewElement } from '../components/page-view-element';
import { SharedStyles } from '../components/shared-styles.js';
import "@vaadin/vaadin-grid/all-imports.js"
import "@vaadin/vaadin-icons/vaadin-icons.js"

class RfkTable extends PageViewElement {

      static get styles() {
        return [
            SharedStyles,
            css`
            vaadin-grid {
                width: 100%;
            },
            :host(.auto-width) {
                display: inline-block;
              }
            `
        ]
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

    updated(changedProperties){
        const columns = this.shadowRoot.querySelectorAll('vaadin-grid-column');
        columns[0].renderer = function(root, column, rowData) {
              root.innerHTML = `<div style="white-space: normal"><a href="/record-form?tableName=${rowData.item.schema}&recordId=${rowData.item._id}&action=edit">
                <iron-icon icon="vaadin:edit"></iron-icon>
              </a></div>`;
          };

        const grid = this.shadowRoot.getElementById('grid');
        const gridItems = this.records.rows.map(row => {
            let doc = row.doc;
            doc['schema'] = this.schema._id;
            return doc;
        })
        grid.items = gridItems;
        console.log("grid-defined");
    }

    async getResource(name){
        await db.getDocument(name).then((schema) => {
            this.schema = schema;
            this.tableName = schema.name;
        })
        await db.allDocsOfSchema(name).then((records) => {
            this.records = records;
        });
    }

    render() {
        return html`
            <section>
                <h2>Table ${this.tableName} <a href="/record-form?tableName=schema:schema:v1&recordId=${this.schema._id}&action=edit"><iron-icon icon="vaadin:edit"></iron-icon></a>
                <a href="/record-form?tableName=${this.schema._id}"><iron-icon icon="vaadin:plus"></iron-icon></a>
                </h2>

                <vaadin-grid id="grid" theme="compact column-borders">
                <vaadin-grid-column auto-width path="edit" header="edit"></vaadin-grid-column>
                ${Object.keys(this.schema.jsonSchema.properties).map(
                    (field) => html`
                    <vaadin-grid-sort-column auto-width path="${field}" header="${field}"></vaadin-grid-sort-column>
                    `
                  )}                    
                </vaadin-grid>
            </section>
            `;
    }
}
window.customElements.define('rfk-table', RfkTable);