import { db } from '../components/db/database.js';
import { html, css } from 'lit-element'
import { PageViewElement } from '../components/page-view-element';
import { SharedStyles } from '../components/shared-styles.js';
import "@vaadin/vaadin-grid/all-imports.js"
import "@vaadin/vaadin-icons/vaadin-icons.js"
import "@vaadin/vaadin-button/vaadin-button.js";
import { store } from '../state/store.js';
import { navigate } from '../state/actions/app.js';

class RfkTableView extends PageViewElement {

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
        this.table = {};
        this.schema = {};
        this.useNewFormEditor;
    }

    attributeChangedCallback(name,oldValue, newValue){
        super.attributeChangedCallback(name, oldValue, newValue);
        if(name === 'active' && newValue != null){
            console.log(this.useNewFormEditor);
            let params = new URLSearchParams(document.location.search.substring(1));
            let tableNameParam = params.get("name");
            this.tableName = tableNameParam;
            this.table = {};
            this.getResource(tableNameParam);
        }
    }

    updated(changedProperties){
        const grid = this.shadowRoot.getElementById('grid');
        const gridItems = this.records.rows.map(row => {
            let doc = row.doc;
            doc['schema'] = this.schema._id;
            return doc;
        })
        grid.items = gridItems;
        grid.addEventListener('active-item-changed', this._documentSelected);
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

    _documentSelected(event){
        const item = event.detail.value;
        grid.selectedItems = item ? [item] : [];
        const useNewFormEditor = store.getState().app.useNewFormEditor;
        const formEditor = (useNewFormEditor ? '/form' : '/record-form');
        console.log("Form Editor: " + formEditor);
        store.dispatch(navigate(formEditor + "?schemaDocId="+event.detail.value.schemaDocId+"&docId="+event.detail.value._id+"&action=edit"));
    }

    render() {
        return html`
                ${this.tableName} <vaadin-button @click=${() => store.dispatch(navigate("/record-form?schemaDocId=schema:schema:v1&docId="+this.schema._id+"&action=edit"))}><iron-icon icon="vaadin:edit"></iron-icon></vaadin-button>
                <vaadin-button @click=${() => store.dispatch(navigate("/record-form?schemaDocId="+this.schema._id))}><iron-icon icon="vaadin:plus"></iron-icon></vaadin-button>
                ${this.schema.jsonSchema.properties ? 
                html`
                <vaadin-grid id="grid" theme="compact column-borders">
                ${Object.keys(this.schema.jsonSchema.properties).map(
                    (field) => html`
                    <vaadin-grid-filter-column auto-width path="${field}" header="${field}"></vaadin-grid-filter-column>
                    `
                  )}                    
                </vaadin-grid>
                ` : ``}`;
    }
}
window.customElements.define('rfk-table-view', RfkTableView);