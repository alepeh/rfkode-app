import { html, css } from "lit-element";
import { PageViewElement } from "../components/page-view-element";
import { SharedStyles } from '../components/shared-styles.js';
import { RfkRecordForm } from '../components/rfk-record-form.js';
import { RfkRelationshipSelectionForm } from '../components/rfk-relationship-selection-form.js';
import { RfkAttachments } from '../components/rfk-attachments.js';
import { RfkHttpAction } from '../components/rfk-http-action.js';
import { db } from '../components/db/database.js';

import "@vaadin/vaadin-button/vaadin-button.js";

class RfkRecordView extends PageViewElement {
    static get styles() {
        return [
            SharedStyles,
            css`
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
            schemaDocId: { type: String },
            docId: { type: String },
            recordData: { type: Object },
            attachmentData: { type: Object }
        }
    }

    constructor() {
        super();
        this.schema;
        this.action;
    }

    /* We enter here via the router, so we need to set the data based on the URL we get. */
    attributeChangedCallback(name, oldValue, newValue) {
        super.attributeChangedCallback(name, oldValue, newValue);
        if (name === 'active' && newValue != null) {
            let params = new URLSearchParams(document.location.search.substring(1));
            this._setGlobalParametersAndLoadData(params.get("schemaDocId"), params.get("docId"), params.get("action"));
        }
    }

    _setGlobalParametersAndLoadData(tableName, recordId, action, initialFieldData) {
        this._setGlobalParameters(tableName, recordId, action);
        this._loadData(tableName, recordId, action, initialFieldData);
    }

    _setGlobalParameters(tableName, recordId, action) {
        this.tableName = tableName;
        this.recordId = recordId;
        this.action = action;
    }

    async _loadData(schemaId, recordId, action, initialFieldData) {
        await db.getDocument(schemaId).then((schema) => {
            this.schema = schema;
        });
        /* recordId is optional, if present, and the action is 'edit' we need to find the record in the db.
           If present, and the action is 'add', we create a new one using the id.
           If no id is given, we create a new id as well. */
        if (recordId && action === 'add') {
            console.log("InitialFieldData: " + initialFieldData);
            this.recordData = { _id: this.recordId, schemaDocId: this.schema._id };
            if(initialFieldData){
                console.log("Initial Field Data: " + initialFieldData.field + ", " + initialFieldData.value);
                this.recordData[initialFieldData.field] = initialFieldData.value;
            }
        }
        else if (recordId && (action === 'edit')) {
            await db.getDocument(recordId, { attachments: true }).then((document) => {
                this.recordData = document;
            });
        } else if (!recordId) {
            const newDocId = this._generateNewDocumentId(this.schema._id);
            this.recordId = newDocId;
            this.recordData = { _id: this.recordId, schemaDocId: this.schema._id };
        }
    }

    _extractSchemaNameFromSchemaId(schemaId){
        const schemaIdParts = schemaId.split(':');
        return schemaIdParts[1];
    }

    _generateNewDocumentId(schemaId) {
        const schemaIdParts = schemaId.split(':');
        const schemaName = schemaIdParts[1];
        const schemaVersion = schemaIdParts[2];
        const randomString = Math.random().toString(36).replace('0.', '');
        return 'record:' + schemaName + ':' + schemaVersion + ':' + randomString;
    }

    render() {
        console.log(this.schema);
        if (this.schema) {
            return html`
            <div id="content-container">
                <div id="content-wrap">
                    <rfk-record-form @record-updated="${(e) => { this.recordUpdated(e.detail) }}"
                        @relationship-selection-requested="${(e) => { this._relationshipSelection(e.detail) }}"
                        @relationship-view-requested="${(e) => { this._relationshipView(e.detail) }}"
                        @record-attachment-updated=${(e) => { this.recordAttachmentUpdated(e.detail) }}"
                        schema='${JSON.stringify(this.schema)}'
                        recordData='${JSON.stringify(this.recordData)}'>
                    </rfk-record-form>
                    ${this.recordData._attachments
                        ? html`<rfk-attachments attachments='${JSON.stringify(this.recordData._attachments)}'></rfk-attachments>`
                        : ``
                    }
                    <rfk-relationship-selection-form id="relForm" @relationship-selected="${(e) => this._linkRelationship(e)}"></rfk-relationship-selection-form>
                </div>
            </div>
            <footer>
                <vaadin-button id="saveBtn" disabled @click="${() => this._save()}">Save</vaadin-button>
                <vaadin-button id="deleteBtn" @click=${() => this._deleteDocument()}><iron-icon icon="vaadin:trash"></iron-icon></vaadin-button>
                ${(this.schema.actions && this.schema.actions['http'])
                    ? html`<rfk-http-action data=${JSON.stringify(this.recordData)} options=${JSON.stringify(this.schema.actions.http)}></rfk-http-action>`
                    : ``}
            </footer>
            `;
        } else {
            return html`<b>Schema is not defined (yet)!</b>`;
        }
    }

    _deleteDocument(document){
        db.removeDocument(this.recordData._id, this.recordData._rev).then(_ => {
            window.history.back();
        })
    }

    /**
     * opens a modal dialog to create a new or select an existing relationship
     */
    async _relationshipSelection(selectionEvent) {
        const relationship = selectionEvent.field;
        //open the dialog to select an existing/create a new record
        const relForm = this.shadowRoot.getElementById("relForm");
        relForm.targets = await this._getRelationshipTargets(relationship);
        relForm.fieldName = relationship;
        relForm.opened = true;
    }

    /**
     * find all potential targets for this relationship
     */
    async _getRelationshipTargets(field){
        const relatedSchemaName = this.schema.jsonSchema.relationships[field].$ref;
        const docs = await db.allDocsOfSchema(relatedSchemaName);
        const relatedSchema = await db.getDocument(relatedSchemaName);
        let labelProperty = "_id";
        if(relatedSchema.uiSchema["_label"]){
            labelProperty = relatedSchema.uiSchema["_label"].property;
        }
        if(docs.rows) {
            return docs.rows.map((doc) => {
                return {id: doc.doc._id, label: doc.doc[labelProperty]};
            })
        }
    }

    /**
     * called to navigate to an existing relationship
     */
    _relationshipView(selectionevent) {
        const relationship = selectionevent.field;
        const relatedSchema = this.schema.jsonSchema.relationships[relationship].$ref;
        const relatedRecordId = this.recordData[relationship];
        this._setGlobalParametersAndLoadData(relatedSchema, relatedRecordId, 'edit');
        this.requestUpdate();
    }

    _linkRelationship(e) {
        console.log("relationship selected");
        console.dir(e);
        const fieldName = e.detail.field;
        const existingRelationship = e.detail.value;
        if(existingRelationship){
            //oldRelValue, newRelValue
            this._updateReverseRelationship(this.recordData[fieldName], existingRelationship);
            this.recordData[fieldName] = existingRelationship;
            this._save();
        }
        else {
            const relatedSchema = this.schema.jsonSchema.relationships[fieldName].$ref;
            const relatedRecordId = this._generateNewDocumentId(relatedSchema);
            //TODO save the new recordId before reloading data
            this.recordData[fieldName] = relatedRecordId;
            this._save();
            this._setGlobalParametersAndLoadData(relatedSchema, relatedRecordId, 'add', {field: this._extractSchemaNameFromSchemaId(this.tableName), value: this.recordId});
            this.requestUpdate();
        }
    }

    _updateReverseRelationship(oldRelatedDocumentId, newRelatedDocumentId){
        console.log("New RelatedDocument: " + newRelatedDocumentId);
        db.getDocument(oldRelatedDocumentId).then(doc => {
            doc[this._extractSchemaNameFromSchemaId(this.tableName)] = "";
            db.put(doc).then(() => console.log("Cleared old Related Doc"));
        });
        db.getDocument(newRelatedDocumentId).then(doc => {
            doc[this._extractSchemaNameFromSchemaId(this.tableName)] = this.recordId;
            db.put(doc).then(() => console.log("Saved New Related Doc"));
        });
    }

    recordUpdated(updateEvent) {
        this._enableSaveButton();
        this.recordData[updateEvent.field] = updateEvent.value;
        console.dir(this.recordData);
    }

    recordAttachmentUpdated(updateEvent) {
        console.dir(updateEvent);
        console.log("Id: " + this.recordData._id);
        let attachment = {};
        attachment[updateEvent.field] = { //filename
            content_type: updateEvent.value.type,
            data: updateEvent.value
        };
        this.recordData._attachments = attachment;
        db.put(this.recordData).then((doc) => {
            this.recordData._rev = doc.rev;
            console.log("File saved as attachment");
        }).catch((err) => {
            console.log(err);
        });
    }

    _save() {
        db.put(this.recordData).then((doc) => {
            console.log(doc);
            this.recordData._rev = doc.rev;
            this._saveSuccessful();
        }).catch((error) => {
            console.error(error);
            this._errorSaving();
        });
    }

    _saveSuccessful() {
        this._getSaveButton().innerHTML = `Saved`;
        this._disableSaveButton();
        this.requestUpdate();
    }

    _errorSaving() {
        this._getSaveButton().innerHTML = `Error`;
        window.setTimeout(() =>
            this._enableSaveButton(), 3000);
    }

    _disableSaveButton() {
        this._getSaveButton().setAttribute("disabled", true);
    }

    _enableSaveButton() {
        this._getSaveButton().innerHTML = `Save`;
        this._getSaveButton().removeAttribute("disabled");
    }

    _getSaveButton() {
        return this.shadowRoot.getElementById('saveBtn')
    }

}
window.customElements.define('rfk-record-view', RfkRecordView);