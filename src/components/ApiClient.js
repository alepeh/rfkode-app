import * as token from "./Token";
import * as response from "./ResponseUtils";
import AuthenticationClient from "./AuthenticationClient";

export default class ApiClient {

    constructor(apikey, apiBasePath) {
        this.APIKEY =  apikey;
        this.API_BASE_PATH = apiBasePath;
        this.authClient = new AuthenticationClient();
    }

    async fetchResources() {
        await this.authClient.refreshTokenIfRequired();
        return fetch(this.API_BASE_PATH + '/AWS_RDS1/_schema', {
            mode: "cors",
            headers: {
                "X-DreamFactory-Session-Token": token.getSessionTokenFromCookie(),
                "X-DreamFactory-API-Key": this.APIKEY
            }
        })
        .then(response.status)
        .then(response.json)
    }

    async fetchResourceSchema(name) {
        await this.authClient.refreshTokenIfRequired();
        return fetch(this.API_BASE_PATH + '/AWS_RDS1/_schema/' + name, {
            mode: "cors",
            headers: {
                "X-DreamFactory-Session-Token": token.getSessionTokenFromCookie(),
                "X-DreamFactory-API-Key": this.APIKEY
            }
        })
        .then(response.status)
        .then(response.json)
    }

    async fetchResourceData(name, order) {
        await this.authClient.refreshTokenIfRequired();
        let url = this.API_BASE_PATH + '/AWS_RDS1/_table/' + name;
        if(order){
            url = url + '?order=' + order.field + ' ' + order.direction;
        }
        return fetch(url, {
            mode: "cors",
            headers: {
                "X-DreamFactory-Session-Token": token.getSessionTokenFromCookie(),
                "X-DreamFactory-API-Key": this.APIKEY
            }
        })
        .then(response.status)
        .then(response.json)
    }

    async fetchResourceDataById(name, id) {
        await this.authClient.refreshTokenIfRequired();
        let url = this.API_BASE_PATH + '/AWS_RDS1/_table/' + name + "/" + id;
        return fetch(url, {
            mode: "cors",
            headers: {
                "X-DreamFactory-Session-Token": token.getSessionTokenFromCookie(),
                "X-DreamFactory-API-Key": this.APIKEY
            }
        })
        .then(response.status)
        .then(response.json)
    }

    async partialUpdate(resourceName, id, changedData) {
        await this.authClient.refreshTokenIfRequired();
        return fetch(this.API_BASE_PATH + '/AWS_RDS1/_table/' + resourceName + '/' + id, {
            method: "PATCH",
            mode: "cors",
            headers: {
                "X-DreamFactory-Session-Token": token.getSessionTokenFromCookie(),
                "X-DreamFactory-API-Key": this.APIKEY,
                "Content-type": "application/json; charset=UTF-8"
            },
            body: JSON.stringify(changedData)
        })
        .then(response.status)
        .then(response.json)
    }

    async add(resourceName, data) {
        await this.authClient.refreshTokenIfRequired();
        return fetch(this.API_BASE_PATH + '/AWS_RDS1/_table/' + resourceName, {
            method: "POST",
            mode: "cors",
            headers: {
                "X-DreamFactory-Session-Token": token.getSessionTokenFromCookie(),
                "X-DreamFactory-API-Key": this.APIKEY,
                "Content-type": "application/json; charset=UTF-8"
            },
            body: JSON.stringify(data)
        })
        .then(response.status)
        .then(response.json)
    }

    async delete(resourceName, id) {
        await this.authClient.refreshTokenIfRequired();
        return fetch(this.API_BASE_PATH + '/AWS_RDS1/_table/' + resourceName + "/" + id, {
            method: "DELETE",
            mode: "cors",
            headers: {
                "X-DreamFactory-Session-Token": token.getSessionTokenFromCookie(),
                "X-DreamFactory-API-Key": this.APIKEY,
            }
        })
        .then(response.status)
        .then(response.json)
    }
}