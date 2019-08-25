import { html } from "lit-element";
import { dbApiClient } from '../components/ApiClientFactory.js';
import { PageViewElement } from "../components/page-view-element";
import { SharedStyles } from '../components/shared-styles.js';

class RfkRecordForm extends PageViewElement {
    static get styles() {
        return [
            SharedStyles
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
        await dbApiClient().fetchResourceSchema(name)
            .then((schema) => {
                this.schema = schema;
            })
            .then(_ => {
                if(id){
                        dbApiClient().fetchResourceDataById(name, id)
                        .then((data) => {
                        this.recordData = data;
                        console.dir(data);
                        });
                }
        })
    }

    render() {
        return html`
        <style>
            input {
                width: 100%;
                padding: 12px 20px;
                margin: 8px 0;
                display: inline-block;
                border: 1px solid #ccc;
                border-radius: 4px;
                box-sizing: border-box;
                font-size: 1em;
            }
            label {
                color: #818181;
            }
        </style>
            <section>
                <h2>Record</h2>
        <table>
        ${this.schema.field.map(
            (row) => html`
            <label for="${row.name}">${row.name}</label>
            <input id="${row.name}" .value=${this.recordData ? this.recordData[row.name] : ''} @change=${e => this.inputChanged(e,row.name)}></input>
          `
        )}
        </table>
        <spinning-button id='saveBtn' @click=${_ => this.save()}></spinning-button>
        </section>
        `;
    }

    inputChanged(e,field){
        this.changedData[field] = e.target.value;
    }
}
window.customElements.define('rfk-record-form', RfkRecordForm);