// Plugin

var exec = require('cordova/exec');

var PLUGIN_NAME = "VerIDPlugin";

var veridPlugin = {
    /**
     * Load Ver-ID
     * @param {string} [apiSecret] API secret obtained at https://dev.ver-id.com/admin/register. If you omit this parameter you must specify the API secret in your app's Info.plist file (iOS) or manifest.xml (Android).
     * @param {function} callback Function to be called when the Ver-ID load operation finishes. The callback has a boolean parameter `success` indicating the success of the load operation.
     * @param {function} errorCallback Function to be called if the load operation fails.
     */
    load: function(apiSecret, callback, errorCallback) {
        var options = [];
        if (apiSecret && (typeof apiSecret === "string")) {
            options.push({"apiSecret":apiSecret});
        } else if (apiSecret && (typeof apiSecret === "function")) {
            callback = apiSecret;
        }
        exec(callback, errorCallback, PLUGIN_NAME, "load", options);
    },

    /**
     * Unload Ver-ID
     * Call this function to free resources when your app no longer requires Ver-ID.
     */
    unload: function() {
        exec(null, null, PLUGIN_NAME, "unload", []);
    },

    /**
     * Register user
     * @param {RegistrationSessionSettings} settings An instance of RegistrationSessionSettings or null to use default settings.
     * @param {function} callback Function to be called if the registration session finishes.
     * @param {function} errorCallback Function to be called if the registration session fails.
     */
    register: function(settings, callback, errorCallback) {
        exec(callback, errorCallback, PLUGIN_NAME, "registerUser", [{"settings":settings}]);
    },

    /**
     * Authenticate user
     * @param {AuthenticationSessionSettings} settings An instance of AuthenticationSessionSettings or null to use default settings. With the default settings the session will not use anti-spoofing.
     * @param {function} callback Function to be called if the authentication session completes.
     * @param {function} errorCallback Function to be called if the session fails.
     */
    authenticate: function(settings, callback, errorCallback) {
        exec(callback, errorCallback, PLUGIN_NAME, "authenticate", [{"settings":settings}]);
    },

    /**
     * Capture live face
     * @param {LivenessDetectionSessionSettings} settings An instance of LivenessDetectionSessionSettings or null to use default settings.
     * @param {function} callback Function to be called if the liveness detection session completes.
     * @param {function} errorCallback Function to be called if the session fails.
     */
    captureLiveFace: function(settings, callback, errorCallback) {
        exec(callback, errorCallback, PLUGIN_NAME, "captureLiveFace", [{"settings":settings}]);
    },

    /**
     * Retrieve a list of registered users
     * @param {function} callback Function to be called if the opration succeeds. The response will be an array of objects with a string member "userId" and an array member "bearings" with int members corresponding to the user's registered bearings as defined by the Bearing constants.
     * @param {function} errorCallback Function to be called if the operation fails.
     */
    getRegisteredUsers: function(callback, errorCallback) {
        exec(callback, errorCallback, PLUGIN_NAME, "getRegisteredUsers", []);
    },

    /**
     * Delete a registered user
     * @param {string} userId The id of the user to delete.
     * @param {function} callback Function to be called if the operation succeeds.
     * @param {function} errorCallback Function to be called if the operation fails.
     */
    deleteUser: function(userId, callback, errorCallback) {
        exec(callback, errorCallback, PLUGIN_NAME, "deleteUser", [{"userId": userId}]);
    }
};

/**
 * Constants representing the bearing of a face looking at the camera
 * @readonly
 * @enum {number}
 * @property {number} STRAIGHT Facing the camera straight on
 * @property {number} UP Looking up
 * @property {number} RIGHT_UP Looking right and up
 * @property {number} RIGHT Looking right
 * @property {number} RIGHT_DOWN Looking right and down
 * @property {number} DOWN Looking down
 * @property {number} LEFT_DOWN Looking left and down
 * @property {number} LEFT Looking left
 * @property {number} LEFT_UP Looking left and up
 */
veridPlugin.Bearing = {
    STRAIGHT: 0,
    UP: 1,
    RIGHT_UP: 2,
    RIGHT: 3,
    RIGHT_DOWN: 4,
    DOWN: 5,
    LEFT_DOWN: 6,
    LEFT: 7,
    LEFT_UP: 8
};
/**
 * Constants representing liveness detection settings
 * @readonly
 * @enum {number}
 * @property {number} NONE No liveness detection
 * @property {number} REGULAR Regular liveness detection
 * @property {number} STRICT Strict liveness detection (requires the user to register additional bearings)
 */
veridPlugin.LivenessDetection = {
    NONE: 0,
    REGULAR: 1,
    STRICT: 2
};

/**
 * @classdesc Base class for session settings
 * @class
 * @param {number} [expiryTime=30] Seconds before the session expires
 * @param {number} [numberOfResultsToCollect=1] Number of results (face images) to collect before the session returns
 */
veridPlugin.SessionSettings = function(expiryTime, numberOfResultsToCollect) {
    if (expiryTime) {
        this.expiryTime = expiryTime;
    }
    if (numberOfResultsToCollect) {
        this.numberOfResultsToCollect = numberOfResultsToCollect;
    }
};
/**
 * @property {number} expiryTime Seconds before the session expires
 * @property {number} numberOfResultsToCollect Number of results (face images) to collect before the session returns
 * @property {boolean} showGuide Show a session guide to the user before the face image collection begins
 * @property {boolean} showResult Show the result of the session to the user before returning it to your app
 */
veridPlugin.SessionSettings.prototype = {
    expiryTime: 30,
    numberOfResultsToCollect: 1,
    showGuide: false,
    showResult: false
};

/**
 * @classdesc Liveness detection session settings
 * @class
 * @param {number} [numberOfResultsToCollect=2] Number of results (face images) to collect before the session returns
 * @augments veridPlugin.SessionSettings
 * @inheritdoc
 */
veridPlugin.LivenessDetectionSessionSettings = function(numberOfResultsToCollect) {
    veridPlugin.SessionSettings.call(this);
    if (typeof numberOfResultsToCollect === "number") {
        this.numberOfResultsToCollect = Math.max(1, Math.round(numberOfResultsToCollect));
    } else {
        this.numberOfResultsToCollect = 2;
    }
};
/**
 * @property {Array} bearings The user will be prompted to assume one or more of these bearings
 * @property {number} segmentDuration The minimum duration of each segment where the user is asked to assume a bearing
 * @property {boolean} includeFaceTemplatesInResult Set to `true` if you plan using the result for face comparison
 */
veridPlugin.LivenessDetectionSessionSettings.prototype = Object.create(veridPlugin.SessionSettings.prototype, {
    expiryTime: {
        value: 30,
        enumerable: true,
        configurable: true,
        writable: true
    },
    numberOfResultsToCollect: {
        value: 2,
        configurable: true,
        enumerable: true,
        writable: true
    },
    showGuide: {
        value: false,
        enumerable: true,
        configurable: true,
        writable: true
    },
    showResult: {
        value: false,
        enumerable: true,
        configurable: true,
        writable: true
    },
    bearings: {
        value: [veridPlugin.Bearing.STRAIGHT, veridPlugin.Bearing.LEFT, veridPlugin.Bearing.LEFT_UP, veridPlugin.Bearing.RIGHT_UP, veridPlugin.Bearing.RIGHT],
        enumerable: true,
        configurable: true,
        writable: true
    },
    segmentDuration: {
        value: 3,
        enumerable: true,
        configurable: true,
        writable: true
    },
    includeFaceTemplatesInResult: {
        value: false,
        enumerable: true,
        configurable: true,
        writable: true
    }
});
veridPlugin.LivenessDetectionSessionSettings.prototype.constructor = veridPlugin.LivenessDetectionSessionSettings;

/**
 * @classdesc Authentication session settings 
 * @class
 * @augments veridPlugin.LivenessDetectionSessionSettings
 * @inheritdoc
 * @param {string} userId The ID of the user to authenticate (must be previously registered)
 * @param {veridPlugin.LivenessDetection} livenessDetection Liveness detection settings
 */
veridPlugin.AuthenticationSessionSettings = function(userId, livenessDetection) {
    veridPlugin.LivenessDetectionSessionSettings.call(this);
    this.userId = userId;
    if (livenessDetection) {
        this.livenessDetection = livenessDetection;
    }
};
/**
 * @property {string} userId The ID of the user to authenticate (must be previously registered)
 * @property {veridPlugin.LivenessDetection} livenessDetection Liveness detection settings
 */
veridPlugin.AuthenticationSessionSettings.prototype = Object.create(veridPlugin.LivenessDetectionSessionSettings.prototype, {
    userId: {
        value: 'default',
        enumerable: true,
        configurable: true,
        writable: true
    },
    livenessDetection: {
        value: veridPlugin.LivenessDetection.REGULAR,
        enumerable: true,
        configurable: true,
        writable: true
    }
});
veridPlugin.AuthenticationSessionSettings.prototype.constructor = veridPlugin.AuthenticationSessionSettings;

/**
 * @classdesc Registration session settings
 * @class
 * @augments SessionSettings
 * @inheritdoc
 * @param {string} userId The ID of the user to register
 * @param {veridPlugin.LivenessDetection} livenessDetection Liveness detection settings
 * @param {boolean} showGuide Show a session guide to the user before the face image collection begins
 * @param {boolean} showResult Show the result of the session to the user before returning it to your app
 */
veridPlugin.RegistrationSessionSettings = function(userId, livenessDetection, showGuide, showResult) {
    SessionSettings.call(this);
    this.userId = userId;
    if (livenessDetection) {
        this.livenessDetection = livenessDetection;
    }
    if (this.livenessDetection == veridPlugin.LivenessDetection.STRICT) {
        this.bearingsToRegister = [veridPlugin.Bearing.STRAIGHT, veridPlugin.Bearing.LEFT, veridPlugin.Bearing.LEFT_UP, veridPlugin.Bearing.UP, veridPlugin.Bearing.RIGHT_UP, veridPlugin.Bearing.RIGHT];
    }
    if (typeof(showGuide) !== "undefined") {
        this.showGuide = showGuide;
    }
    if (typeof(showResult) !== 'undefined') {
        this.showResult = showResult;
    }
    this.numberOfResultsToCollect = 3;
};
/**
 * @property {string} userId The ID of the user to register
 * @property {veridPlugin.LivenessDetection} livenessDetection Liveness detection settings
 * @property {Array} bearingsToRegister Face bearings to register in this session
 * @property {boolean} appendIfUserExists Append the registered faces to a user with the same ID if one exists
 */
veridPlugin.RegistrationSessionSettings.prototype = Object.create(veridPlugin.SessionSettings.prototype, {
    userId: {
        value: 'default',
        enumerable: true,
        configurable: true,
        writable: true
    },
    livenessDetection: {
        value: veridPlugin.LivenessDetection.REGULAR,
        enumerable: true,
        configurable: true,
        writable: true
    },
    bearingsToRegister: {
        value: [veridPlugin.Bearing.STRAIGHT],
        enumerable: true,
        configurable: true,
        writable: true
    },
    appendIfUserExists: {
        value: false,
        enumerable: true,
        configurable: true,
        writable: true
    }
});
veridPlugin.RegistrationSessionSettings.prototype.constructor = veridPlugin.RegistrationSessionSettings;

module.exports = veridPlugin;
