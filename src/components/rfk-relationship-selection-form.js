import { html, css, LitElement } from "lit-element";
import { render } from 'lit-html';
import "@vaadin/vaadin-dialog/vaadin-dialog.js";
import "@vaadin/vaadin-button/vaadin-button.js";
import "@vaadin/vaadin-item/vaadin-item.js"


export class RfkRelationshipSelectionForm extends LitElement {

    constructor(){
        super();
        //because: https://vaadin.com/forum/thread/17760006/events-from-vaadin-dialog-box-not-firing
        this.updateComplete.then(() => {
            this.dialog.renderer = root => {
              render(html`
                <vaadin-button @click="${this._linkNewElement.bind(this)}">New</vaadin-button>
                ${this._renderTargets()}
              `, root);
            }
          });
    }

    get dialog(){
        return this.shadowRoot.querySelector('vaadin-dialog');
    }

    static get properties() {
        return {
            opened : { type : Boolean },
            fieldName : {type : String},
            targets : { type : Object }
        }
    }

    render(){
        return html`
        <vaadin-dialog aria-label="simple" ?opened=${this.opened} @opened-changed="${(e) => this._dialogVisibilityChanged(e)}">
        </vaadin-dialog>
        `;
    }

    _renderTargets(){
        if (this.targets){
            return html`
                ${this.targets.map((target) => html`
                <vaadin-item @click="${() => this._linkExistingElement(target.id)}">${target.label}</vaadin-item>
                    `
                )}`;
        }  
    }

    _linkNewElement(){
        let selectionEvent = new CustomEvent('relationship-selected', {
            detail: {field: this.fieldName},
            bubbles: true
        });
        this.dispatchEvent(selectionEvent);
        this.opened = false;
    }

    _linkExistingElement(id){
        let selectionEvent = new CustomEvent('relationship-selected', {
            detail: {field: this.fieldName, value: id},
            bubbles: true
        });
        this.dispatchEvent(selectionEvent);
        this.opened = false;
    }

    _dialogVisibilityChanged(e){
        if(! e.detail.value){
            this.opened = false;
        }
    }
}
window.customElements.define('rfk-relationship-selection-form', RfkRelationshipSelectionForm);