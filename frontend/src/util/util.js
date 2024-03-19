// Checks if an email is valid
// Reference: https://stackoverflow.com/questions/46155/how-can-i-validate-an-email-address-in-javascript
export const validateEmail = (email) => {
    return email.match(
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    );
};

export const validatePassword = (password) => {
    return password.length >= 6;
}