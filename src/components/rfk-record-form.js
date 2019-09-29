import { html, css, LitElement } from "lit-element";
import "@vaadin/vaadin-text-field/vaadin-password-field.js";
import "@vaadin/vaadin-text-field/vaadin-text-area.js";
import "@vaadin/vaadin-upload/vaadin-upload.js";
import "@vaadin/vaadin-date-picker/vaadin-date-picker.js"
import "@vaadin/vaadin-select/vaadin-select.js"

export class RfkRecordForm extends LitElement {

    constructor(){
        super();
    }

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
            (row) => this.produceWidget(row, this.schema.uiSchema ? this.schema.uiSchema[row] : null, this.recordData ? this.recordData[row] : '')
        )}
        `;
    }

    produceWidget(id, uiSchema, data){
        console.log(id);
        console.dir(uiSchema);
        if (!uiSchema){
            console.log("no special ui schema")
            return this.widgetFor({jsonSchema: this.schema.jsonSchema.properties[id], uiOptions: this.schema.uiSchema ? this.schema.uiSchema[id] : '', id : id, data : this.recordData ? this.recordData[id] : ''});
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
                return html`<p>
                <vaadin-button id=${id} @click="${e => this._relationshipSelected(id)}">${this.recordData[id] ? 'Show ' + id : 'New ' + id}</vaadin-button></p>`;
            default: 
                return html`
                    <vaadin-text-field label=${id} id="${id}" .value=${this.recordData ? data : ''} @change=${e => this.inputChanged(e.target.value,id)}>
                    </vaadin-text-field>`
        }
    }

    widgetFor(widgetDescriptor) {
        console.log("widgetDescriptor");
        console.dir(widgetDescriptor);
        switch(widgetDescriptor.jsonSchema.type){
            case 'string': return this.produceTextWidget(widgetDescriptor);
                    
        }
    }

    produceTextWidget(widgetDescriptor) {
        console.log(widgetDescriptor.jsonSchema['format']);
        //Select Box
        if(widgetDescriptor.jsonSchema.enum){
            return this.produceSelectOneWidget(widgetDescriptor);
        }
        //Date
        if(widgetDescriptor.jsonSchema['format'] === 'date'){
            return this.produceDateWidget(widgetDescriptor);
        }
        return html`
        <vaadin-text-field label=${widgetDescriptor.id} id=${widgetDescriptor.id} .value=${widgetDescriptor.data ? widgetDescriptor.data : ''} @change=${e => this.inputChanged(e.target.value,widgetDescriptor.id)}>
        </vaadin-text-field>`;
    }
    
    produceSelectOneWidget(widgetDescriptor) {
        return html`
        <vaadin-select label=${widgetDescriptor.id} .value=${widgetDescriptor.data ? widgetDescriptor.data : ''} @change=${e => this.inputChanged(e.target.value,widgetDescriptor.id)}>
            <template>
                <vaadin-list-box>
                    ${widgetDescriptor.jsonSchema.enum.map(option => {
                        return html`
                            <vaadin-item>${option}</vaadin-item>
                        `;
                    })}
                </vaadin-list-box>
            </template>
        </vaadin-select>   
        `;
    }

    produceDateWidget(widgetDescriptor){
        return html`
        <vaadin-date-picker label=${widgetDescriptor.id} id=${widgetDescriptor.id} 
            .value=${widgetDescriptor.data ? widgetDescriptor.data : ''} 
            @change=${e => this.inputChanged(e.target.value,widgetDescriptor.id)}>
        </vaadin-date-picker>`;
    }

    inputChanged(val,field){
        let updateEvent = new CustomEvent('record-updated', {
            detail: {field: field, value: val},
            bubbles: true
        });
        this.dispatchEvent(updateEvent);
    }

    _relationshipSelected(field){
        console.log("_rel selected");
        console.dir(field);
        let selectionEvent = new CustomEvent('relationship-selected', {
            detail: {field: field},
            bubbles: true
        });
        this.dispatchEvent(selectionEvent);
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