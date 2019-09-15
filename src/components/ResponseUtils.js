function status(response){
    if (response.status >= 200 && response.status < 300) {
        return Promise.resolve(response)
      } else if (response.status === 401) {
        console.log('Got 401 - Looks like session expired!');
    } else {
        return Promise.reject(new Error(response.statusText))
      }
}

function json(response) {
    return response.json();
}
export {status, json}