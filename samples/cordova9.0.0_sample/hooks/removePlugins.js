const { exec } = require("child_process");

const commandLineLog = (error, stdout, stderr) => {
    if (error) {
        console.log(`error: ${error.message}`);
        return;
    }
    if (stderr) {
        console.log(`stderr: ${stderr}`);
        return;
    }
    console.log(`${stdout}`);
}

module.exports = context => {
    exec("cordova plugin rm com-appliedrec-plugins-verid", commandLineLog);
    exec("cordova plugin rm cordova-plugin-test-framework", commandLineLog);
};