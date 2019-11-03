import { html, css } from "lit-element";
import { PageViewElement } from "../components/page-view-element";
import { SharedStyles } from '../components/shared-styles.js';
import { RfkRecordForm } from '../components/rfk-record-form.js';
import { RfkAttachments } from '../components/rfk-attachments.js';
import { db } from '../components/database.js';
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
            tableName: { type: String },
            recordId: { type: String },
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
            this._setGlobalParametersAndLoadData(params.get("tableName"), params.get("recordId"), params.get("action"));
        }
    }

    _setGlobalParametersAndLoadData(tableName, recordId, action) {
        this._setGlobalParameters(tableName, recordId, action);
        this._loadData(tableName, recordId, action);
    }

    _setGlobalParameters(tableName, recordId, action) {
        this.tableName = tableName;
        this.recordId = recordId;
        this.action = action;
    }

    async _loadData(schemaId, recordId, action) {
        await db.getDocument(schemaId).then((schema) => {
            this.schema = schema;
        });
        /* recordId is optional, if present, and the action is 'edit' we need to find the record in the db.
           If present, and the action is 'add', we create a new one using the id.
           If no id is given, we create a new id as well. */
        if (recordId && action === 'add') {
            this.recordData = { _id: this.recordId };
        }
        else if (recordId && (action === 'edit')) {
            await db.getDocument(recordId, { attachments: true }).then((document) => {
                this.recordData = document;
            });
        } else if (!recordId) {
            const newDocId = this._generateNewDocumentId(this.schema._id);
            this.recordId = newDocId;
            this.recordData = { _id: this.recordId };
        }
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
                        @relationship-selected="${(e) => { this._relationshipSelected(e.detail) }}"
                        @record-attachment-updated=${(e) => { this.recordAttachmentUpdated(e.detail) }}"
                        schema='${JSON.stringify(this.schema)}'
                        recordData='${JSON.stringify(this.recordData)}'>
                    </rfk-record-form>
                    <rfk-attachments attachments='${JSON.stringify(this.recordData._attachments)}'></rfk-attachments>
                </div>
            </div>
            <footer>
                <vaadin-button id="saveBtn" disabled @click="${() => this._save()}">Save</vaadin-button>
                <vaadin-button id="mergeBtn" @click="${() => this._generateDocument()}">Generate Document</vaadin-button>
            </footer>
            `;
        } else {
            return html`<b>Schema is not defined (yet)!</b>`;
        }
    }

    _relationshipSelected(selectionEvent) {
        console.dir(selectionEvent);
        const relationship = selectionEvent.field;
        let relatedRecordId = this.recordData[relationship];
        const relatedSchema = this.schema.jsonSchema.relationships[relationship].$ref;
        if (!relatedRecordId) {
            console.log("Related record not set, creating new one");
            relatedRecordId = this._generateNewDocumentId(relatedSchema);
            //TODO save the new recordId before reloading data
            this.recordData[relationship] = relatedRecordId;
            this._save();
            this._setGlobalParametersAndLoadData(relatedSchema, relatedRecordId, 'add');
        }
        else {
            this._setGlobalParametersAndLoadData(relatedSchema, relatedRecordId, 'edit');
        }
        this.requestUpdate();
    }

    _generateDocument() {
        const mergeconfiguration = this.schema.actions['generateDocument'];
        const payload = {
            template: mergeconfiguration.templateName,
            data: this.recordData,
            options: mergeconfiguration.options
        };

        /* replace all relationshipIds with the full object data */
        let promises = [];

        Object.keys(this.schema.jsonSchema.relationships).map((relationship) => {
            promises.push(db.getDocument(this.recordData[relationship]).then((recordData) => {
                console.log("Related record:");
                console.dir(recordData);
                payload.data[relationship] = recordData;
            })
            )
        });

        console.log("Calling document merge with the following payload");
        console.log(payload);
        
        Promise.all(promises).then(_ => {
            fetch('http://localhost:4000/reports', {
                method: "POST",
                mode: "cors",
                headers: {
                    "Content-type": "application/json; charset=UTF-8"
                },
                body: JSON.stringify(payload)
            }).then((response) => {
                console.log(response);
            }).catch((err) => {
                console.error(err);
            })
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