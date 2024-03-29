import { html, css, LitElement } from "lit-element";
import "@vaadin/vaadin-text-field/vaadin-password-field.js";
import "@vaadin/vaadin-text-field/vaadin-number-field.js"
import "@vaadin/vaadin-text-field/vaadin-text-area.js";
import "@vaadin/vaadin-upload/vaadin-upload.js";
import "@vaadin/vaadin-date-picker/vaadin-date-picker.js";
import "@vaadin/vaadin-select/vaadin-select.js";
import "@vaadin/vaadin-checkbox/vaadin-checkbox.js";
import "@vaadin/vaadin-checkbox/vaadin-checkbox-group.js";
import "@vaadin/vaadin-custom-field/vaadin-custom-field.js"
import "@vaadin/vaadin-list-box/vaadin-list-box.js"
import { RfkSignature } from '../components/rfk-signature.js';

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
            vaadin-text-field, vaadin-text-area, 
            vaadin-text-area, vaadin-number-field, vaadin-select {
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
        if (!uiSchema){
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
            case 'signature' :
                return html`
                    <rfk-signature label=${id} id=${id} @signature-change=${e => this._attachmentUpdated(id, e.detail.file)}>
                    </rfk-signature>`;
            case 'selectRelated' :
                return html`<p><label for=${id}>${id}</label>
                ${this.recordData[id]
                    ? html`<vaadin-button id=${id} @click="${e => this._viewRelationship(id)}">View</vaadin-button>`
                    : html``
                }
                    <vaadin-button id=${id} @click="${e => this._selectRelationship(id)}">Select</vaadin-button>
                </p>`;
            case 'selectMultipleRelated' : 
                return this.produceSelectMultipleRelatedWidget(id);
            default: 
                return html`
                    <vaadin-text-field label=${id} id="${id}" .value=${this.recordData ? data : ''} @change=${e => this.inputChanged(e.target.value,id)}>
                    </vaadin-text-field>`
        }
    }

    widgetFor(widgetDescriptor) {
        switch(widgetDescriptor.jsonSchema.type){
            case 'string': return this.produceTextWidget(widgetDescriptor);
            case 'array': return this.produceSelectMultipleWidget(widgetDescriptor);
            case 'boolean': return this.produceCheckboxWidget(widgetDescriptor);
            case 'number': return this.produceNumberWidget(widgetDescriptor);
        }
    }

    produceSelectMultipleRelatedWidget(id){
        console.log(this.recordData[id]);
        return html`<p><div><label for=${id}>${id}</label>
        <vaadin-button @click="${e => this._addRelationship(id)}">+</vaadin-button>
        </div>
        ${this.recordData[id] 
            ? html`${this.recordData[id].map(relatedRecord => {
                return html`<vaadin-button @click="${e => this._viewRelationship(id, relatedRecord)}">View</vaadin-button>`;
            })}` : html``
        }`;
    }

    produceSelectMultipleWidget(widgetDescriptor){
        if(widgetDescriptor.jsonSchema.items.enum){
            return html`
            <vaadin-checkbox-group label=${widgetDescriptor.id} .value=${widgetDescriptor.data ? widgetDescriptor.data : []} @value-changed=${e => this.inputChanged(e.target.value,widgetDescriptor.id)}>
                ${widgetDescriptor.jsonSchema.items.enum.map(option => {
                    return html`
                        <vaadin-checkbox value=${option}>${option}</vaadin-checkbox>
                    `;
                })}
            </vaadin-checkbox-group>
            `;
        }
        if(widgetDescriptor.jsonSchema.items.format === "relationship"){
            console.log("Multiple Relationships field!");
        }
    }

    produceCheckboxWidget(widgetDescriptor){
        return html`
        <diV>
        <vaadin-custom-field label="${widgetDescriptor.id}">
            <vaadin-checkbox ?checked=${widgetDescriptor.data ? widgetDescriptor.data : false} @change=${e => this.inputChanged((e.target.hasAttribute('checked') ? true : false),widgetDescriptor.id)}></vaadin-checkbox>
        </vaadin-custom-field>
        </div>
        `;
    }

    produceNumberWidget(widgetDescriptor){
        return html`
        <vaadin-number-field label=${widgetDescriptor.id} id=${widgetDescriptor.id} .value=${widgetDescriptor.data ? widgetDescriptor.data : ''} @change=${e => this.inputChanged(e.target.value,widgetDescriptor.id)}></vaadin-number-field>
        `;
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
        const oldValue = this.recordData[field];
        //update event is only fired when old and new value differs
        if(val != oldValue){
            let updateEvent = new CustomEvent('record-updated', {
                detail: {field: field, value: val},
                bubbles: true
            });
            this.dispatchEvent(updateEvent);
        }
    }

    _addRelationship(field){
        let selectionEvent = new CustomEvent('relationship-selection-requested', {
            detail: {field: field},
            bubbles: true
        });
        this.dispatchEvent(selectionEvent);     
    }

    _selectRelationship(field){
        let selectionEvent = new CustomEvent('relationship-selection-requested', {
            detail: {field: field},
            bubbles: true
        });
        this.dispatchEvent(selectionEvent);
    }

    //related record is only passed when we have a multi-select option
    _viewRelationship(field, relatedRecord){
        let selectionEvent = new CustomEvent('relationship-view-requested', {
            detail: {field: field, documentId: relatedRecord},
            bubbles: true
        });
        this.dispatchEvent(selectionEvent);
    }

    fileSelected(e,field){
        let file = this.shadowRoot.getElementById(field).files[0];
        this._attachmentUpdated(field, file);
    }

    _attachmentUpdated(fieldName, file){
        let updateEvent = new CustomEvent('record-attachment-updated', {
            detail: {field: fieldName, value: file},
            bubbles: true
        });
        this.dispatchEvent(updateEvent);
    }
}
window.customElements.define('rfk-record-form', RfkRecordForm);