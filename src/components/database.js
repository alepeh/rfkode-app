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
            this.localDb.sync(this.remoteDb, {live: true, retry: true, /* other sync options */});
        });
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

    getDocument(id){
        return this.localDb.get(id);
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