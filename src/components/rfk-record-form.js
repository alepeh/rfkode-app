import { html, css, LitElement } from "lit-element";
import "@vaadin/vaadin-text-field/vaadin-password-field.js";
import "@vaadin/vaadin-text-field/vaadin-text-area.js";
import "@vaadin/vaadin-upload/vaadin-upload.js";
import "@vaadin/vaadin-date-picker/vaadin-date-picker.js"

export class RfkRecordForm extends LitElement {

    static get properties() {
        return {
            recordData : { type : Object },
            schema : { type : Object }
        }
    }

    static get styles() {
        return [
            css`
            vaadin-text-field, vaadin-text-area {
                width: 100%;
            }
            vaadin-text-area {
                min-height: 200px;
            }
            `
        ]
    }

    render() {
        return html`
        ${Object.keys(this.schema.jsonSchema.properties).map(
            (row) => this.produceWidget(row, this.schema.uiSchema ? this.schema.uiSchema[row] : null, this.recordData[row])
        )}
        `;
    }

    produceWidget(id, uiSchema, data){
        if (!uiSchema){
            return html`
            <vaadin-text-field label=${id} id="${id}" .value=${this.recordData ? data : ''} @change=${e => this.inputChanged(e.target.value,id)}>
            </vaadin-text-field>`
        }
        switch(uiSchema.widget){
            case 'textarea' :
                return html`
                    <vaadin-text-area label=${id} id=${id} .value=${this.recordData ? JSON.stringify(data, null, '\t') : ''} @change=${e => this.inputChanged(JSON.parse(e.target.value),id)}>
                    </vaadin-text-area>
                `;
            case 'file' :
                return html`
                    <label for=${id}>${id}</label>
                    <input type="file" id=${id} @change=${e => this.fileSelected(e,id)}></input>`;
            case 'selectRelated' :
                return html`
                <vaadin-button id=${id} @click="${e => this._relationshipSelected(id)}">${this.recordData[id] ? 'Show ' + id : 'New ' + id}</vaadin-button>`;
            case 'datePicker' :
                    return html`
                    <vaadin-date-picker label=${id} id=${id} .value=${this.recordData ? data : ''} @change=${e => this.inputChanged(e.target.value,id)}></vaadin-date-picker>`;
            default: 
                return html`
                    <vaadin-text-field label=${id} id="${id}" .value=${this.recordData ? data : ''} @change=${e => this.inputChanged(e.target.value,id)}>
                    </vaadin-text-field>`
        }
    }

    _relationshipSelected(field){
        let selectionEvent = new CustomEvent('relationship-selected', {
            detail: {field: field},
            bubbles: true
        });
        this.dispatchEvent(selectionEvent);
    }

    inputChanged(val,field){
        let updateEvent = new CustomEvent('record-updated', {
            detail: {field: field, value: val},
            bubbles: true
        });
        this.dispatchEvent(updateEvent);
    }

    fileSelected(e,field){
        let file = this.shadowRoot.getElementById(field).files[0]
        let updateEvent = new CustomEvent('record-attachment-updated', {
            detail: {field: field, value: file},
            bubbles: true
        });
        this.dispatchEvent(updateEvent);
    }
}
window.customElements.define('rfk-record-form', RfkRecordForm);