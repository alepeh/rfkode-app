import { html, LitElement } from "lit-element";
import SignaturePad from "signature_pad";

export class RfkSignature extends LitElement {

    constructor(){
        super();
        this.signaturePad;
    }

    firstUpdated() {
        const canvas = this.shadowRoot.querySelector("canvas");
        this.signaturePad = new SignaturePad(canvas);
    }

    render(){
        return html` 
            <canvas style="border:1px solid #000000;"></canvas>
        `;
    }
}
window.customElements.define('rfk-signature', RfkSignature);