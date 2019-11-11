import { html, LitElement } from "lit-element";
import "@vaadin/vaadin-button/vaadin-button.js";
import RelationshipResolver from '../components/db/relationship-resolver.js';
import { db } from '../components/db/database.js';

export class RfkHttpAction extends LitElement {
    
    static get properties() {
        return {
            data: { type: Object },
            options : { type: Object}
        }
    }

    constructor(){
        super();
    }

    render(){
        return html`
            <vaadin-button @click="${() => this._submit()}">${(this.options && this.options.name) ? this.options.name : 'Senden'}</vaadin-button>
        `;
    }

    _submit(){
            console.log("Expanding object")
            new RelationshipResolver(db).expandRelations(this.data).then((expandedDoc) => {
                console.log(expandedDoc);
                fetch(this.options.config.url, {
                method: this.options.config.method,
                mode: "cors",
                headers: {
                    "Content-type": "application/json; charset=UTF-8"
                },
                body: JSON.stringify({payload: expandedDoc, metadata: this.options.metadata})
            }).then((response) => {
                console.log(response);
            }).catch((err) => {
                console.error(err);
            })
            });
    }
}
window.customElements.define('rfk-http-action', RfkHttpAction);