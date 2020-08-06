const ErrorHeader = `
---------------------------------------------
-                  ERROR                    -
---------------------------------------------
\n`;

const showMessage = (message) => {
    const msg = `
---------------------------------------------
            ${message}
-                                           -
---------------------------------------------
\n`;
    console.log(msg);
};

const VerifyingHeader = `
---------------------------------------------
-                 Verifying                 -
---------------------------------------------
\n`;

const SuccessHeader = `
---------------------------------------------
-                  Success                  -
---------------------------------------------
\n`;

const EndMessage = `
---------------------------------------------
`;

const logError = (error) => {
    console.error(ErrorHeader, error, EndMessage);
};

const showErrors = (errors) => {
    if (errors && errors.length > 0) {
        console.log(ErrorHeader);
        errors.forEach((error, index) => {
            console.log(`${index}.`, error);
        });
    } else {
        console.log(SuccessHeader);
    }
};

module.exports = {
    logError: logError,
    showErrors: showErrors,
    showMessage: showMessage,
    VerifyingHeader: VerifyingHeader,
};
