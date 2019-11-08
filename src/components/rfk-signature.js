import { html, LitElement } from "lit-element";
import SignaturePad from "signature_pad";
import "@vaadin/vaadin-icons/vaadin-icons.js";
import "@vaadin/vaadin-button/vaadin-button.js";
import * as blobUtil from 'blob-util';

export class RfkSignature extends LitElement {

    constructor(){
        super();
        this.signaturePad;
        this.canvas;
    }

    firstUpdated() {
        this.canvas = this.shadowRoot.querySelector("canvas");
        this.signaturePad = new SignaturePad(this.canvas);
        this._clearSignature();
    }

    render(){
        return html` 
            <canvas style="border:1px solid #000000;"></canvas>
            <vaadin-button @click=${() => this._clearSignature()}>
                <iron-icon icon="vaadin:trash"></iron-icon>
            </vaadin-button>
            <vaadin-button @click=${() => this._saveSignature()}>
                <iron-icon icon="vaadin:check"></iron-icon>
            </vaadin-button>`;
    }

    _clearSignature(){
        this.signaturePad.clear();
    }

    _saveSignature(){
        const dataUrl =this.signaturePad.toDataURL();
        const file = blobUtil.dataURLToBlob(dataUrl);
        let updateEvent = new CustomEvent('signature-change', {
            detail: {file},
            bubbles: true
        });
        this.dispatchEvent(updateEvent);
    }
}
window.customElements.define('rfk-signature', RfkSignature);