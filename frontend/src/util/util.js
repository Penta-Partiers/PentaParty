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

// Reference for generating random alphanumeric string:
// https://stackoverflow.com/questions/10726909/random-alpha-numeric-string-in-javascript
export const generateLobbyCode = () => {
    return Array.from(Array(6), () => Math.floor(Math.random() * 36).toString(36)).join('').toUpperCase();
}