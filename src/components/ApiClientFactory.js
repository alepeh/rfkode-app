import ApiClient from "./ApiClient";
import AuthenticationClient from "./AuthenticationClient";

export const dbApiClient = () => {
    return new ApiClient("102b21cf9053fdb257271d6e890117653adcf08ed1663f18f400d39b94f76a64", "https://api.alexanderpehm.at/api/v2");
}

export const authenticationClient = () => {
    return new AuthenticationClient("102b21cf9053fdb257271d6e890117653adcf08ed1663f18f400d39b94f76a64", "https://api.alexanderpehm.at/api/v2");
}