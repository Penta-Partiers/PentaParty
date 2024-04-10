/** 
 * Checks if an email is valid
 * Reference: https://stackoverflow.com/questions/46155/how-can-i-validate-an-email-address-in-javascript
 * 
 * ==> Functional Requirements: FR1, FR2
 */
export const validateEmail = (email) => {
    return email.match(
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    );
};

/** 
 * Checks if an password is valid
 * ==> Functional Requirements: FR1, FR2
 */
export const validatePassword = (password) => {
    return password.length >= 6;
}

/**
 *  Reference for generating random alphanumeric string as lobby code:
 *  https://stackoverflow.com/questions/10726909/random-alpha-numeric-string-in-javascript
 *  ==> Functional Requirements: FR8, FR10
 */
export const generateLobbyCode = () => {
    // TODO: Check for duplicated lobby code just to be sure
    return Array.from(Array(6), () => Math.floor(Math.random() * 36).toString(36)).join('').toUpperCase();
}

/**
 *  Comparison function for sorting an array with objects that contain the field [object].score 
 *  in descending score order
 * 
 *  ==> Functional Requirements: FR26
 */

export const compareScores = (a, b) => {
    const scoreA = a.score;
    const scoreB = b.score;
    if (scoreA < scoreB) {
        return 1;
    }
    if (scoreA > scoreB) {
        return -1;
    }
    return ('' + a.username).localeCompare(b.username);
}