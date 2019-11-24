import { html, LitElement } from "lit-element";
import "@vaadin/vaadin-button/vaadin-button.js";
import RelationshipResolver from '../components/db/relationship-resolver.js';
import { db } from '../components/db/database.js';

export class RfkHttpAction extends LitElement {
        /*
        {payload, metadata : {
            template : {
                key : ""
            },
            output : {
                bucket: "",
                key: ""
            }
        }}
    */
    static get properties() {
        return {
            data: { type: Object },
            actionConfig : { type: Object}
        }
    }

    constructor(){
        super();
    }

    render(){
        console.log("Action Config " + this.actionConfig);
        return html`
            <vaadin-button @click="${() => this._submit()}">${(this.actionConfig && this.actionConfig.title) ? this.actionConfig.title : 'Senden'}</vaadin-button>
        `;
    }

    _submit(){
            console.log("Expanding object")
            new RelationshipResolver(db).expandRelations(this.data).then((expandedDoc) => {
                console.log(expandedDoc);
                fetch(this.actionConfig.config.url, {
                method: this.actionConfig.config.method,
                mode: "cors",
                headers: {
                    "Content-type": "application/json; charset=UTF-8"
                },
                body: JSON.stringify({payload: expandedDoc, metadata: this.actionConfig.metadata})
            }).then((response) => {
                console.log(response);
            }).catch((err) => {
                this.shadowRoot.querySelector('vaadin-button').innerHTML = 'Error';
                console.error(err);
            })
            });
    }
}
window.customElements.define('rfk-http-action', RfkHttpAction);