import { html, css, LitElement } from "lit-element";
import "@vaadin/vaadin-text-field/vaadin-password-field.js";

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
            vaadin-text-field {
                width: 100%;
            }
            `
        ]
    }

    render() {
        return html`
        ${Object.keys(this.schema.jsonSchema.properties).map(
            (row) => html`
            <vaadin-text-field label=${row} id="${row}" .value=${this.recordData ? this.recordData[row] : ''} @change=${e => this.inputChanged(e,row.name)}>
            </vaadin-text-field>
          `
        )}
        `;
    }

    inputChanged(e,field){
        let updateEvent = new CustomEvent('record-updated', {
            detail: {field: field, vaue: e.target.value},
            bubbles: true
        });
        this.dispatchEvent(updateEvent);
    }
}
window.customElements.define('rfk-record-form', RfkRecordForm);