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
 * [JSON schema]{@link https://dev.ver-id.com/schemas/verid/root.json#/definitions/faceTemplate}
 * @typedef {Object} FaceTemplate
 * @property {integer} version Version of the template model
 * @property {string} data Base 64 encoded binary representation of the face
 */

/**
 * [JSON schema]{@link https://dev.ver-id.com/schemas/verid/root.json#/definitions/face}
 * @typedef {Object} Face
 * @property {number} x Distance in pixels from the left edge of the image
 * @property {number} y Distance in pixels from the top edge of the image
 * @property {number} width Width of the face in pixels
 * @property {number} height Height of the face in pixels
 * @property {number} yaw Yaw angle of the face in degrees
 * @property {number} pitch Pitch angle of the face in degrees
 * @property {number} roll Roll angle of the face in degrees
 * @property {module:verid~FaceTemplate} [faceTemplate] Face template in portable format
 */

 /**
  * @typedef {Object} User
  * @property {string} userId User ID
  * @property {Array.<module:verid.Bearing>} bearings Registered (face bearings)[#verid.Bearing]
  */

/**
 * @callback SessionCallback
 * @param {module:verid.SessionResult} result - Result of the session
 */

/**
 * @callback UserCallback
 * @param {Array.<string>} users - Registered users
 */

/**
 * Load Ver-ID
 * @param {string} [apiSecret] API secret obtained at {@linkplain https://dev.ver-id.com/admin/register}. If you omit this parameter you must specify the API secret in your app's Info.plist file (iOS) or manifest.xml (Android).
 * @param {function} [callback] Function to be called when the Ver-ID load operation finishes
 * @param {function} [errorCallback] Function to be called if the load operation fails
 * @returns {Promise} If callback is not specified the function returns a promise
 */
module.exports.load = function(apiSecret, callback, errorCallback) {
    var options = [];
    if (apiSecret && (typeof apiSecret === "string")) {
        options.push({"apiSecret":apiSecret});
    }
    if (callback || (typeof apiSecret === "function")) {
        if (apiSecret && (typeof apiSecret === "function")) {
            exec(apiSecret, callback, PLUGIN_NAME, "load", options);
        } else {
            exec(callback, errorCallback, PLUGIN_NAME, "load", options);
        }
    } else {
        return new Promise(function(resolve,reject) {
            exec(resolve, reject, PLUGIN_NAME, "load", options);
        });
    }
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
 * @param {module:verid~SessionCallback} [callback] Function to be called if the registration session finishes
 * @param {function} [errorCallback] Function to be called if the registration session fails
 * @returns {Promise<module:verid.SessionResult>} If callback is not specified returns a promise
 */
module.exports.register = function(settings, callback, errorCallback) {
    var options = [{}];
    if (settings && (typeof settings === "object")) {
        options[0].settings = JSON.stringify(settings);
    } else {
        options[0].settings = JSON.stringify(new module.exports.RegistrationSessionSettings());
    }
    if (callback || (typeof settings === "function")) {
        if (settings && (typeof settings === "function")) {
            exec(decodeSessionResultAndIssueCallback(settings), callback, PLUGIN_NAME, "registerUser", options);
        } else {
            exec(decodeSessionResultAndIssueCallback(callback), errorCallback, PLUGIN_NAME, "registerUser", options);
        }
    } else {
        return new Promise(function(resolve,reject) {
            exec(decodeSessionResultAndIssueCallback(resolve), reject, PLUGIN_NAME, "registerUser", options);
        });
    }
}

/**
 * Authenticate user
 * @param {module:verid.AuthenticationSessionSettings} [settings] An instance of {@linkcode module:verid.AuthenticationSessionSettings AuthenticationSessionSettings}
 * @param {module:verid~SessionCallback} [callback] Function to be called if the authentication session completes
 * @param {function} [errorCallback] Function to be called if the session fails
 * @returns {Promise<module:verid.SessionResult>} If callback is not specified returns a promise
 */
module.exports.authenticate = function(settings, callback, errorCallback) {
    var options = [{}];
    if (settings && (typeof settings === "object")) {
        options[0].settings = JSON.stringify(settings);
    } else {
        options[0].settings = JSON.stringify(new module.exports.AuthenticationSessionSettings());
    }
    if (callback || (typeof settings === "function")) {
        if (typeof settings === "function") {
            exec(decodeSessionResultAndIssueCallback(settings), callback, PLUGIN_NAME, "authenticate", options);
        } else {
            exec(decodeSessionResultAndIssueCallback(callback), errorCallback, PLUGIN_NAME, "authenticate", options);
        }
    } else {
        return new Promise(function(resolve,reject) {
            exec(decodeSessionResultAndIssueCallback(resolve), reject, PLUGIN_NAME, "authenticate", options);
        });
    }
}

/**
 * Capture live face
 * @param {module:verid.LivenessDetectionSessionSettings} [settings] An instance of {@linkcode module:verid.LivenessDetectionSessionSettings LivenessDetectionSessionSettings}
 * @param {module:verid~SessionCallback} [callback] Function to be called if the liveness detection session completes
 * @param {function} [errorCallback] Function to be called if the session fails
 * @returns {Promise<module:verid.SessionResult>} If callback is not specified returns a promise
 */
module.exports.captureLiveFace = function(settings, callback, errorCallback) {
    var options = [{}];
    if (settings && (typeof settings === "object")) {
        options[0].settings = JSON.stringify(settings);
    } else {
        options[0].settings = JSON.stringify(new module.exports.LivenessDetectionSessionSettings());
    }
    if (callback || (typeof settings === "function")) {
        if (typeof settings === "function") {
            exec(decodeSessionResultAndIssueCallback(settings), callback, PLUGIN_NAME, "captureLiveFace", options);
        } else {
            exec(decodeSessionResultAndIssueCallback(callback), errorCallback, PLUGIN_NAME, "captureLiveFace", options);
        }
    } else {
        return new Promise(function(resolve,reject) {
            exec(decodeSessionResultAndIssueCallback(resolve), reject, PLUGIN_NAME, "captureLiveFace", options);
        });
    }
}

/**
 * Retrieve a list of registered users
 * @param {module:verid~UserCallback} [callback] Function to be called if the opration succeeds. The response will be an array of objects with a string member "userId" and an array member "bearings" with int members corresponding to the user's registered bearings as defined by the Bearing constants.
 * @param {function} [errorCallback] Function to be called if the operation fails.
 * @returns {Promise<Array.<string>>} If callback is not specified returns a promise
 */
module.exports.getRegisteredUsers = function(callback, errorCallback) {
    if (callback) {
        exec(decodeResultAndIssueCallback(callback), errorCallback, PLUGIN_NAME, "getRegisteredUsers", []);
    } else {
        return new Promise(function(resolve,reject) {
            exec(decodeResultAndIssueCallback(resolve), reject, PLUGIN_NAME, "getRegisteredUsers", []);
        });
    }
}

/**
 * Delete a registered user
 * @function
 * @param {string} userId The id of the user to delete.
 * @param {function} [callback] Function to be called if the operation succeeds.
 * @param {function} [errorCallback] Function to be called if the operation fails.
 * @returns {Promise} If callback is not specified returns a promise
 */
module.exports.deleteUser = function(userId, callback, errorCallback) {
    if (callback) {
        exec(callback, errorCallback, PLUGIN_NAME, "deleteUser", [{"userId": userId}]);
    } else {
        return new Promise(function(resolve,reject) {
            exec(resolve, reject, PLUGIN_NAME, "deleteUser", [{"userId":userId}]);
        });
    }
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
 * [JSON schema]{@link https://dev.ver-id.com/schemas/verid/registration_settings.json#/definitions/sessionSettings}
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
 * [JSON schema]{@link https://dev.ver-id.com/schemas/verid/liveness_detection_settings.json}
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
 * [JSON schema]{@link https://dev.ver-id.com/schemas/verid/authentication_settings.json}
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
 * [JSON schema]{@link https://dev.ver-id.com/schemas/verid/registration_settings.json}
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
 * [JSON schema]{@link https://dev.ver-id.com/schemas/verid/session_result.json}
 * @class
 * @param {Object} json JSON object received from the API call
 * @property {module:verid.SessionOutcome} outcome Outcome of the session
 * @property {module:verid~Face} [face] Detected face
 * @property {module:verid.Bearing} [bearing] Bearing of the detected face
 * @property {string} [image] Data URI scheme image in which the face was detected
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
        return face.hasOwnProperty("faceTemplate") && face.faceTemplate != null;
    }).map(function(face) {
        return face.faceTemplate;
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
 * Called after face template comparison
 * @callback CompareFacesCallback
 * @param {number} score Score between 0.0 and 1.0 indicating the similarity between the two templates: 0 = different, 1 = very similar
 */

/**
 * Compare face templates
 * @param {module:verid~FaceTemplate} template1 Face template to compare to the other template
 * @param {module:verid~FaceTemplate} template2 Face template to compare to the first template
 * @param {module:verid~CompareFacesCallback} callback Called when the comparison succeeds
 * @param {function} errorCallback Called if the comparison fails
 */
module.exports.compareFaceTemplates = function(template1, template2, callback, errorCallback) {
    var t1 = JSON.stringify(template1);
    var t2 = JSON.stringify(template2);
    var options = [{"template1":t1},{"template2":t2}];
    if (callback) {
        exec(function(result) {
            callback(result.score);
        }, errorCallback, PLUGIN_NAME, "compareFaceTemplates", options);
    } else {
        return new Promise(function(resolve,reject) {
            exec(function(result){
                resolve(result.score);
            }, reject, PLUGIN_NAME, "compareFaceTemplates", options);
        });
    }
}

/**
 * Called when face is detected in image 
 * @callback DetectFaceCallback
 * @param {module:verid~Face} face Detected face
 */

/**
 * Detect face in image
 * @param {string} image Data URL scheme image, e.g. data:image/jpeg;base64,encodedImageData
 * @param {module:verid~DetectFaceCallback} callback Callback when face is detected
 * @param {function} errorCallback Error callback
 */
module.exports.detectFaceInImage = function(image, callback, errorCallback) {
    exec(function(encodedFace) {
        if (encodedFace) {
            var face = JSON.parse(encodedFace);
            callback(face);
        } else {
            errorCallback("Received null face");
        }
    }, errorCallback, PLUGIN_NAME, "detectFaceInImage", [{"image":image}]);
}