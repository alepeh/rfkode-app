function saveSessionTokenInCookie(sessionToken){
    let d = new Date();
    d.setTime(d.getTime() + (60 * 60 * 1000));
    document.cookie = "token=" + sessionToken;
    document.cookie = "expires=" + d.getTime();
}

function getSessionTokenFromCookie(){
    if (document.cookie === ""){
        return null;
    }
    let cookie = document.cookie.split(';').filter((item) => item.includes('token='));
    if(cookie.length != 0) {
        return cookie[0].trim().substring("token=".length);
    }
    return null;
}

function isSessionTokenExpired(){
    const currentTimeUTC = new Date().getTime();
    let expiryStringInCookie = document.cookie.split(';').filter((item) => item.includes('expires='));
    if (expiryStringInCookie == ""){
        return true;
    }
    let expiryTimeInCookie = expiryStringInCookie[0].trim().substring("expires=".length)
    const expiryTimeUTC = new Date().setTime(expiryTimeInCookie);
    return (expiryTimeUTC > currentTimeUTC) ? false : true;
}

export { saveSessionTokenInCookie, getSessionTokenFromCookie, isSessionTokenExpired}