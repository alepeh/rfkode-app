import "pouchdb/dist/pouchdb.js";
import * as response from "./ResponseUtils";

class Database {

    constructor(){
        this.DBNAME = 'rfkode';
        this.COUCHDB_HOST = 'https://couch.alexanderpehm.at/';
        this.localDb = new PouchDB(this.DBNAME);
        this.remoteDb = new PouchDB(this.COUCHDB_HOST + this.DBNAME);
    }

    sync(username, password) {
        console.log("logging in: " + username +  " " + password);
        return this._login(username, password).then(() => {
            console.log("Login success");
            this.localDb.sync(this.remoteDb, {live: true, retry: true})
                .on('change', (info) => {
                this._syncLog('change');
              }).on('paused', (err) => {
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
        });
    }

    _syncLog(action, detail){
        console.log('Replication ' + action + ' detail: ' + JSON.stringify(detail));
    }

    _login(username, password){
        // this creates an auth session that's stored as a cookie
        return fetch(this.COUCHDB_HOST + '_session', {
            method: "POST",
            mode: "cors",
            credentials: "include",
            headers: {
                "Content-type": "application/json; charset=UTF-8"
            },
            body: JSON.stringify({
                "name": username,
                "password": password
            })
        }).then(response.status)
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