// Plugin

var exec;
try {
    exec = require('cordova/exec');
} catch (error) {
    exec = function(callback, errorCallback, pluginName, command, parameters) {

    };
}

var PLUGIN_NAME = "VerIDPlugin";

function decodeResultAndIssueCallback(callback) {
    return function(params) {
        callback(JSON.parse(params));
    }
}

function decodeSessionResultAndIssueCallback(callback) {
    return function(response) {
        var result = JSON.parse(response);
        callback(new module.exports.SessionResult(result));
    }
}

/** @module verid */
/**
 * Load Ver-ID
 * @param {string} [apiSecret] API secret obtained at {@linkplain https://dev.ver-id.com/admin/register}. If you omit this parameter you must specify the API secret in your app's Info.plist file (iOS) or manifest.xml (Android).
 * @param {function} callback Function to be called when the Ver-ID load operation finishes
 * @param {function} errorCallback Function to be called if the load operation fails
 */
module.exports.load = function(apiSecret, callback, errorCallback) {
    var options = [];
    if (apiSecret && (typeof apiSecret === "string")) {
        options.push({"apiSecret":apiSecret});
    } else if (apiSecret && (typeof apiSecret === "function")) {
        errorCallback = callback;
        callback = apiSecret;
    }
    exec(callback, errorCallback, PLUGIN_NAME, "load", options);
}

/**
 * Unload Ver-ID
 * Call this function to free resources when your app no longer requires Ver-ID
 */
module.exports.unload = function() {
    exec(null, null, PLUGIN_NAME, "unload", []);
}

/**
 * Register user
 * @param {module:verid.RegistrationSessionSettings} [settings] An instance of {@linkcode module:verid.RegistrationSessionSettings RegistrationSessionSettings}
 * @param {module:verid.SessionCallback} callback Function to be called if the registration session finishes
 * @param {function} errorCallback Function to be called if the registration session fails
 */
module.exports.register = function(settings, callback, errorCallback) {
    if (settings && (typeof settings === "function")) {
        errorCallback = callback;
        callback = settings;
        settings = new module.exports.RegistrationSessionSettings();
    }
    settings = JSON.stringify(settings);
    exec(decodeSessionResultAndIssueCallback(callback), errorCallback, PLUGIN_NAME, "registerUser", [{"settings":settings}]);
}

/**
 * Authenticate user
 * @param {module:verid.AuthenticationSessionSettings} [settings] An instance of {@linkcode module:verid.AuthenticationSessionSettings AuthenticationSessionSettings}
 * @param {module:verid.SessionCallback} callback Function to be called if the authentication session completes
 * @param {function} errorCallback Function to be called if the session fails
 */
module.exports.authenticate = function(settings, callback, errorCallback) {
    if (settings && (typeof settings === "function")) {
        errorCallback = callback;
        callback = settings;
        settings = new module.exports.AuthenticationSessionSettings();
    }
    settings = JSON.stringify(settings);
    exec(decodeSessionResultAndIssueCallback(callback), errorCallback, PLUGIN_NAME, "authenticate", [{"settings":settings}]);
}

/**
 * Capture live face
 * @param {module:verid.LivenessDetectionSessionSettings} [settings] An instance of {@linkcode module:verid.LivenessDetectionSessionSettings LivenessDetectionSessionSettings}
 * @param {module:verid.SessionCallback} callback Function to be called if the liveness detection session completes
 * @param {function} errorCallback Function to be called if the session fails
 */
module.exports.captureLiveFace = function(settings, callback, errorCallback) {
    if (settings && (typeof settings === "function")) {
        errorCallback = callback;
        callback = settings;
        settings = new module.exports.LivenessDetectionSessionSettings();
    }
    settings = JSON.stringify(settings);
    exec(decodeSessionResultAndIssueCallback(callback), errorCallback, PLUGIN_NAME, "captureLiveFace", [{"settings":settings}]);
}

/**
 * Retrieve a list of registered users
 * @param {module:verid.UserCallback} callback Function to be called if the opration succeeds. The response will be an array of objects with a string member "userId" and an array member "bearings" with int members corresponding to the user's registered bearings as defined by the Bearing constants.
 * @param {function} errorCallback Function to be called if the operation fails.
 */
module.exports.getRegisteredUsers = function(callback, errorCallback) {
    exec(decodeResultAndIssueCallback(callback), errorCallback, PLUGIN_NAME, "getRegisteredUsers", []);
}

/**
 * @callback module:verid.UserCallback
 * @param {Array.<module:verid.User>} users - Registered users
 */

/**
 * Delete a registered user
 * @function
 * @param {string} userId The id of the user to delete.
 * @param {function} callback Function to be called if the operation succeeds.
 * @param {function} errorCallback Function to be called if the operation fails.
 */
module.exports.deleteUser = function(userId, callback, errorCallback) {
    exec(callback, errorCallback, PLUGIN_NAME, "deleteUser", [{"userId": userId}]);
}

/**
 * Constants representing the bearing of a face looking at the camera
 * @readonly
 * @enum {string}
 */
module.exports.Bearing = {
    /** Facing the camera straight on */
    STRAIGHT: 'STRAIGHT',
    /** Looking up */
    UP: 'UP',
    /** Looking right and up */
    RIGHT_UP: 'RIGHT_UP',
    /** Looking right */
    RIGHT: 'RIGHT',
    /** Looking right and down */
    RIGHT_DOWN: 'RIGHT_DOWN',
    /** Looking down */
    DOWN: 'DOWN',
    /** Looking left and down */
    LEFT_DOWN: 'LEFT_DOWN',
    /** Looking left */
    LEFT: 'LEFT',
    /** Looking left and up */
    LEFT_UP: 'LEFT_UP'
};
/**
 * Constants representing liveness detection settings
 * @readonly
 * @enum {string}
 */
module.exports.LivenessDetection = {
    /** No liveness detection */
    NONE: "NONE",
    /** Regular liveness detection */
    REGULAR: "REGULAR",
    /** Strict liveness detection (requires the user to register additional bearings) */
    STRICT: "STRICT"
};

/**
 * Constants representing the outcome of a Ver-ID session
 * @readonly
 * @enum {string}
 */
module.exports.SessionOutcome = {
    /** The session succeeded in registering or authenticating the user. */
    "SUCCESS": "SUCCESS",
    /** The session failed because it didn't gather enough valid images before it timed out. */
    "FAIL_NUMBER_OF_RESULTS": "FAIL_NUMBER_OF_RESULTS",
    /** The session failed. */
    "UNKNOWN_FAILURE": "UNKNOWN_FAILURE",
    /** The session was cancelled by the user. */
    "CANCEL": "CANCEL",
    /** The session failed because it failed the anti-spoofing challenge. */
    "FAIL_ANTI_SPOOFING_CHALLENGE": "FAIL_ANTI_SPOOFING_CHALLENGE",
    /** The session failed because the app hasn't authenticated to use the Ver-ID API. Only applies to the demo version of the Ver-ID library. */
    "FAIL_HOST_AUTHENTICATION": "FAIL_HOST_AUTHENTICATION",
    /** Failed because of an exception thrown by the face detection and recognition library. */
    "DET_REC_LIB_FAILURE": "DET_REC_LIB_FAILURE",
    /** Face was detected but the user moved away from the camera. */
    "FACE_LOST": "FACE_LOST",
    /** User passed liveness detection but the face cannot be authenticated. */
    "NOT_AUTHENTICATED": "NOT_AUTHENTICATED"
};

/**
 * @classdesc Base class for session settings
 * @class
 * @property {number} expiryTime Seconds before the session expires
 * @property {number} numberOfResultsToCollect Number of results (face images) to collect before the session returns
 * @property {boolean} showResult Whether to show the result of the session to the user before returning it to your app
 * @property {boolean} includeFaceTemplatesInResult Set to `true` if you plan using the result for face comparison. This is always set to `true` on authentication and registration sessions.
 */
module.exports.SessionSettings = function() {
    this.expiryTime = 30;
    this.numberOfResultsToCollect = 1;
    this.showResult = false;
    this.includeFaceTemplatesInResult = false;
};

/**
 * @classdesc Liveness detection session settings
 * @class
 * @param {number} [numberOfResultsToCollect=2] Number of results (face images) to collect before the session returns
 * @augments module:verid.SessionSettings
 * @inheritdoc
 * @property {Array<module:verid.Bearing>} bearings Possible bearings the user may be prompted to assume during liveness detection
 */
module.exports.LivenessDetectionSessionSettings = function(numberOfResultsToCollect) {
    module.exports.SessionSettings.call(this);
    if (typeof numberOfResultsToCollect === "number") {
        this.numberOfResultsToCollect = Math.max(1, Math.round(numberOfResultsToCollect));
    } else {
        this.numberOfResultsToCollect = 2;
    }
    this.bearings = [module.exports.Bearing.STRAIGHT, module.exports.Bearing.LEFT, module.exports.Bearing.LEFT_UP, module.exports.Bearing.RIGHT_UP, module.exports.Bearing.RIGHT];
};

/**
 * @classdesc Authentication session settings
 * @class
 * @augments module:verid.LivenessDetectionSessionSettings
 * @inheritdoc
 * @param {string} [userId=default] The ID of the user to authenticate (must be previously registered)
 * @param {module:verid.LivenessDetection} [livenessDetection=module:verid.LivenessDetection.REGULAR] Liveness detection settings
 * @property {string} userId The ID of the user to authenticate (must be previously registered)
 * @property {module:verid.LivenessDetection} livenessDetection Liveness detection settings
 */
module.exports.AuthenticationSessionSettings = function(userId, livenessDetection) {
    module.exports.LivenessDetectionSessionSettings.call(this);
    this.userId = userId || "default";
    this.livenessDetection = livenessDetection || module.exports.LivenessDetection.REGULAR;
    this.includeFaceTemplatesInResult = true;
};

/**
 * @classdesc Registration session settings
 * @class
 * @augments module:verid.SessionSettings
 * @inheritdoc
 * @param {string} [userId=default] The ID of the user to register
 * @param {module:verid.LivenessDetection} [livenessDetection=module:verid.LivenessDetection.REGULAR] Liveness detection settings
 * @property {string} userId The ID of the user to register
 * @property {module:verid.LivenessDetection} livenessDetection Liveness detection settings
 * @property {Array<module:verid.Bearing>} bearingsToRegister Face bearings to register in this session
 * @property {boolean} appendIfUserExists Append the registered faces to a user with the same ID if one exists
 */
module.exports.RegistrationSessionSettings = function(userId, livenessDetection) {
    module.exports.SessionSettings.call(this);
    this.userId = userId || "default";
    this.livenessDetection = livenessDetection || module.exports.LivenessDetection.REGULAR;
    if (this.livenessDetection == module.exports.LivenessDetection.STRICT) {
        this.bearingsToRegister = [module.exports.Bearing.STRAIGHT, module.exports.Bearing.LEFT, module.exports.Bearing.LEFT_UP, module.exports.Bearing.UP, module.exports.Bearing.RIGHT_UP, module.exports.Bearing.RIGHT];
    } else {
        this.bearingsToRegister = [module.exports.Bearing.STRAIGHT];
    }
    this.numberOfResultsToCollect = 3;
    this.appendIfUserExists = true;
    this.includeFaceTemplatesInResult = true;
};

/**
 * @classdesc Session result
 * @class
 * @param {Object} json JSON object received from the API call
 * @property {module:verid.SessionOutcome} outcome Outcome of the session
 * @property {module:verid.Face} [face] Detected face
 * @property {string} [image] Data URI scheme image in which the face was detected
 * @property {Object.<string,module:verid.Bearing>} users Users recognized or registered in the faces
 * @property {Array.<module:verid.SessionResult>} constituentResults Array of results that constitute the final result – the app collects 1 or more results before the session finishes
 */
module.exports.SessionResult = function(json) {
    this.outcome = json.outcome;
    this.face = json.face;
    this.image = json.image;
    this.bearing = json.bearing;
    this.constituentResults = [];
    if (json.constituentResults) {
        for (var i in json.constituentResults) {
            this.constituentResults.push(new module.exports.SessionResult(json.constituentResults[i]));
        }
    }
}

/**
 * Get faces captured in the session
 * @param {module:verid.Bearing} [bearing] Limit the faces to the given bearing
 */
module.exports.SessionResult.prototype.getFaces = function(bearing) {
    var faces = [];
    if (this.face && (!bearing || this.bearing == bearing)) {
        faces.push(this.face);
    }
    for (var i in this.constituentResults) {
        faces = faces.concat(this.constituentResults[i].getFaces(bearing));
    }
    return faces;
}


/**
 * Get images captured in the session
 * @param {module:verid.Bearing} [bearing] Limit to images with faces of the given bearing
 * @example var sessionResult; // Received in a session callback
 * var images = sessionResult.getImages(verid.Bearing.STRAIGHT);
 * if (images.length > 0) {
 *    // The images are encoded using data URI scheme, e.g., "data:image/jpeg;base64,imagedatahere"
 *    // You can pass this value directly to a Javascript image element
 *    document.getElementById("image").src = images[0];
 * }
 */
module.exports.SessionResult.prototype.getImages = function(bearing) {
    var images = [];
    if (this.image && (!bearing || !this.face || this.bearing == bearing)) {
        images.push(this.image);
    }
    for (var i in this.constituentResults) {
        images = images.concat(this.constituentResults[i].getImages(bearing));
    }
    return images;
}

/**
 * Get face templates that can be used in comparison functions
 * @param {module:verid.Bearing} [bearing] Limit to templates extracted from faces with the given bearing
 */
module.exports.SessionResult.prototype.getFaceComparisonTemplates = function(bearing) {
    return this.getFaces(bearing).filter(function(face) {
        return face.hasOwnProperty("comparisonTemplate") && face.comparisonTemplate != null;
    }).map(function(face) {
        return face.comparisonTemplate;
    });
}

/**
 * Get face and image pairs captured in the session
 * @param {module:verid.Bearing} [bearing] Limit to entries with faces of the given bearing
 */
module.exports.SessionResult.prototype.getFaceImages = function(bearing) {
    var faceImages = [];
    if (this.face && this.image && (!bearing || this.bearing == bearing)) {
        faceImages.push({"face": this.face, "image": this.image});
    }
    for (var i in this.constituentResults) {
        faceImages = faceImages.concat(this.constituentResults[i].getFaceImages(bearing));
    }
    return faceImages;
}

/**
 * @typedef {Object} module:verid.FaceTemplate
 * @property {number} version Version of the template model
 * @property {string} data Base 64 encoded binary representation of the face
 */

/**
 * @typedef {Object} module:verid.Face
 * @property {number} x Distance in pixels from the left edge of the image
 * @property {number} y Distance in pixels from the top edge of the image
 * @property {number} width Width of the face in pixels
 * @property {number} height Height of the face in pixels
 * @property {module:verid.Bearing} bearing Bearing of the face
 * @property {module:verid.FaceTemplate} [faceTemplate] Face template in portable format
 * @property {string} [comparisonTemplate] Face template that can be used for face comparison functions
 */

 /**
  * @typedef {Object} module:verid.User
  * @property {string} userId User ID
  * @property {Array.<module:verid.Bearing>} bearings Registered (face bearings)[#verid.Bearing]
  */

/**
 * @callback module:verid.SessionCallback
 * @param {module:verid.SessionResult} result - Result of the session
 */

/**
 * Compare face templates
 * @param {string} t1 Base 64 encoded face comparison template
 * @param {string} t2 Base 64 encoded face comparison template
 * @returns {number} Score between 0.0 and 1.0 indicating the similarity between the two templates: 0 = different, 1 = same
 */
module.exports.compareFaceTemplates = function(t1, t2) {
    t1 = base64ToFloat32Array(t1);
    t2 = base64ToFloat32Array(t2);
    return get_score_between_templates_with_unit_norms(t1, t2);
}

function base64ToFloat32Array(base64) {
    var buffer = new Buffer(base64, "base64");
    var bytes = new Uint8Array(buffer.length);
    var dataView = new DataView(bytes.buffer);
    for (var i=0; i<dataView.byteLength; i++) {
        dataView.setUint8(i, buffer[i]);
    }
    var floats = [];
    for (var i=0; i<dataView.byteLength; i+=4) {
        floats.push(dataView.getFloat32(i));
    }
    return floats;
}

function inner_product(v1, v2) {
    var sum = 0;
    for (var i = 0; i < v1.length; i++) {
        sum += v1[i] * v2[i];
    }    
    return Math.max(Math.min(sum, 1), 0);
}

function get_norm(v1) {
    return Math.sqrt(inner_product(v1, v1));
}

function get_score_between_templates_with_specified_norms(v1, v1_norm, v2, v2_norm) {
    return inner_product(v1, v2) / (v1_norm * v2_norm);
}

function get_score_between_templates_with_unit_norms(v1, v2) {
    return inner_product(v1, v2);
}

function get_score_between_templates(v1, v2) {
    return get_score_between_templates_with_specified_norms(v1, v2, get_norm(v1), get_norm(v2));
}