const IosOperations = require('./classes/iOS');
const AndroidOperations = require('./classes/Android');

module.exports = function (context) {
    const ios = new IosOperations(context);
    const android = new AndroidOperations(context);

    return ios.remove().then(android.remove);
};
