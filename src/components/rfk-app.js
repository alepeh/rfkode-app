import { LitElement, html, css } from 'lit-element';

class RfkApp extends LitElement {

    constructor(){
        super();
    }

    render(){
        return html`<h1>Hello World</h1>`;
    }


}
window.customElements.define('rfk-app', RfkApp);