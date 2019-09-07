import { html, css } from "lit-element";
import { PageViewElement } from "../components/page-view-element";
import { SharedStyles } from '../components/shared-styles.js';
import { RfkRecordForm } from '../components/rfk-record-form.js'
import { db } from '../components/database.js';
import "@vaadin/vaadin-button/vaadin-button.js";

class RfkRecordView extends PageViewElement {
        static get styles() {
        return [
            SharedStyles,
            css `
            #content-container {
                position: relative;
                min-height: 100vh;
              }
              
              #content-wrap {
                padding-bottom: 1rem;    /* Footer height */
              }
              
              #footer {
                position: fixed;
                bottom: 0;
                width: 100%;
                height: 1rem;            /* Footer height */
              }
            `
        ];
    }

    static get properties() {
        return {
            tableName : { type: String},
            recordId : { type : String},
            recordData : { type : Object}
        }
    }

    constructor() {
        super();
        this.schema;
    }

    attributeChangedCallback(name,oldValue, newValue){
        super.attributeChangedCallback(name, oldValue, newValue);
        if(name === 'active' && newValue != null){
            let params = new URLSearchParams(document.location.search.substring(1));
            this.tableName = params.get("tableName");
            this.recordId = params.get("recordId");
            this.fetchDataFromBackend(this.tableName, this.recordId);
        }
    }

    async fetchDataFromBackend(name, id){
        await db.getDocument(name).then((schema) => {
            this.schema = schema;
        })
        await db.getDocument(id).then((document) => {
            this.recordData = document;
            console.dir(document);
        });
    }

    render() {
        console.log(this.schema);
        if (this.schema) {
            return html`
            <div id="content-container">
                <div id="content-wrap">
                    <rfk-record-form @record-updated="${(e) => { this.recordUpdated(e.detail) }}" 
                        schema='${JSON.stringify(this.schema)}'
                        recordData='${JSON.stringify(this.recordData)}'>
                    </rfk-record-form>
                </div>
            </div>
            <footer>
                <vaadin-button id="saveBtn" disabled @click="${() => this._save()}">Save</vaadin-button>
            </footer>
            `;
        } else {
            return html`<b>Schema is not defined (yet)!</b>`;
        }
    }

    recordUpdated(updateEvent){
        this.shadowRoot.getElementById('saveBtn').removeAttribute("disabled");
        this.recordData[updateEvent.field] = updateEvent.value;
        console.dir(this.recordData);
    }

    _save(){
        db.put(this.recordData);
    }
    
}
window.customElements.define('rfk-record-view', RfkRecordView);