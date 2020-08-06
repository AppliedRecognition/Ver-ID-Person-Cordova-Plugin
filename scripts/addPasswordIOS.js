const IosOperations = require('./classes/iOS');

module.exports = function (context) {
    const ios = new IosOperations(context);

    return ios.init();
};
