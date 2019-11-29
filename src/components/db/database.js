import "pouchdb/dist/pouchdb.js";
import { store } from '../../state/store.js';
import { updateSyncState } from '../../state/actions/app.js';

class Database {

    constructor(){
        this.DBNAME = 'rfkode';
        this.localDb = new PouchDB(this.DBNAME);
    }

    sync(token) {
        const remoteDbUrl = this._extractRemoteDbUrlFromToken(token);
        const authSession = this._extractAuthSessionFromToken(token);
        console.log(remoteDbUrl);

        const remoteDb = new PouchDB(remoteDbUrl, {
            auth: authSession,
          });
        this.localDb.sync(remoteDb, {live: true, retry: true})
                .on('change', (info) => {
                this._syncLog('change');
              }).on('paused', (err) => {
                store.dispatch(updateSyncState({state: 'COMPLETE'}));
                this._syncLog('paused', err);
              }).on('active', () => {
                this._syncLog('active');
              }).on('denied', (err) => {
                this._syncLog('denied', err);
              }).on('complete', (info) => {
                this._syncLog('complete');
              }).on('error', (err) => {
                this._syncLog('error', err);
              });
    }

    _extractRemoteDbUrlFromToken(token){
        return this._decodeTokenPayload(token)['https://rfkode.alexanderpehm.at/cloudant_db_url'];
    }

    _extractAuthSessionFromToken(token){
        let auth = {};
        auth.username = this._decodeTokenPayload(token)['https://rfkode.alexanderpehm.at/remote_db_username'];
        auth.password = this._decodeTokenPayload(token)['https://rfkode.alexanderpehm.at/remote_db_password'];
        return auth;
    }


    _decodeTokenPayload(token){
        const tokenPayload = token.split('.')[1];
        return JSON.parse(window.atob(tokenPayload));
    }

    _syncLog(action, detail){
        console.log('Replication ' + action + ' detail: ' + JSON.stringify(detail));
    }

    allSchemas(){
        return this.localDb.allDocs({
            include_docs: true,
            startkey: 'schema',
            endkey: 'schema\ufff0'
        })
    }

    put(document){
        return this.localDb.put(document);
    }

    getDocument(id, options){
        return this.localDb.get(id, {attachments : true});
    }

    removeDocument(id, rev){
        return this.localDb.remove(id, rev);
    }

    allDocsOfSchema(schemaId){
        let schemaName = schemaId.split(':')[1];
        console.log("schema name: " + schemaName);
        return this.localDb.allDocs({
            include_docs: true,
            startkey: 'record:'+schemaName,
            endkey: 'record:'+schemaName+'\ufff0'
        })
    }

    getAttachment(docId, attachmentName){
        return this.localDb.getAttachment(docId, attachmentName);
    }

    allDocs(){
        return this.localDb.allDocs({
            include_docs: true
        });
    }

    info(){
        console.log(this.localDb.info());
    }
}
export let db = new Database();