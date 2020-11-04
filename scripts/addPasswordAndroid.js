const AndroidOperations = require('./classes/Android');

module.exports = function (context) {
    const android = new AndroidOperations(context);

    android.init();
};
