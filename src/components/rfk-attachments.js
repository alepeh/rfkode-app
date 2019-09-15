import { LitElement, html } from 'lit-element';
import * as blobUtil from 'blob-util';

export class RfkAttachments extends LitElement {

    static get properties() {
        return {
            attachments: { type: Object },
            attachmentDataUrls : { type: Object}
        }
    }

    render() {
        if (this.attachments) {
            return html`
        <ul>
            ${Object.keys(this.attachments).map((attachmentName) => {
                return html`<li><a href="${this.buildDataUrl(attachmentName, this.attachments)}">${attachmentName}</a></li>`
            })
                }
        <ul>
        `;
        }
    }

    buildDataUrl(attachmentName, attachments){
        return "data:" + attachments[attachmentName].content_type + ";base64," + attachments[attachmentName].data;
    }

    attributeChangedCallback(name,oldValue, newValue){
        super.attributeChangedCallback(name, oldValue, newValue);
        this.attachmentDataUrls = this._convertAttachmentsToDataUrls(this.attachments);
    }

    _convertAttachmentsToDataUrls(attachments){
        if(attachments){
            console.log("Converting");
            console.dir(attachments);
            console.log(Object.keys(attachments));
            return Object.keys(attachments)
                .map(
                     (attachment) => {
                        console.log("Trying to convert")
                        console.dir(attachments[attachment]);
                        blobUtil.blobToDataURL(attachments[attachment].data).then((dataUrl) => {
                        return {name: attachment, data : dataUrl};
                  }).catch(e => {
                      console.dir(e);
                  })
                }
            )
        }
    }
}
window.customElements.define('rfk-attachments', RfkAttachments);
