"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
exports.__esModule = true;
exports.setTestingMode = exports.unload = exports.load = exports.VerID = exports.FaceComparisonResult = exports.SessionResult = exports.Error = exports.DetectedFace = exports.Face = exports.FaceTemplate = exports.RegistrationSessionSettings = exports.AuthenticationSessionSettings = exports.LivenessDetectionSessionSettings = exports.VerIDSessionSettings = exports.Bearing = void 0;
var PLUGIN_NAME = "VerIDPlugin";
var Bearing;
(function (Bearing) {
    Bearing["STRAIGHT"] = "STRAIGHT";
    Bearing["UP"] = "UP";
    Bearing["RIGHT_UP"] = "RIGHT_UP";
    Bearing["RIGHT"] = "RIGHT";
    Bearing["RIGHT_DOWN"] = "RIGHT_DOWN";
    Bearing["DOWN"] = "DOWN";
    Bearing["LEFT_DOWN"] = "LEFT_DOWN";
    Bearing["LEFT"] = "LEFT";
    Bearing["LEFT_UP"] = "LEFT_UP";
})(Bearing = exports.Bearing || (exports.Bearing = {}));
var VerIDSessionSettings = (function () {
    function VerIDSessionSettings() {
        this.expiryTime = 30.0;
        this.numberOfResultsToCollect = 2;
        this.showResult = false;
    }
    return VerIDSessionSettings;
}());
exports.VerIDSessionSettings = VerIDSessionSettings;
var LivenessDetectionSessionSettings = (function (_super) {
    __extends(LivenessDetectionSessionSettings, _super);
    function LivenessDetectionSessionSettings() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.bearings = LivenessDetectionSessionSettings.DEFAULT_BEARINGS;
        return _this;
    }
    LivenessDetectionSessionSettings.DEFAULT_BEARINGS = [Bearing.STRAIGHT, Bearing.LEFT, Bearing.LEFT_UP, Bearing.RIGHT_UP, Bearing.RIGHT];
    return LivenessDetectionSessionSettings;
}(VerIDSessionSettings));
exports.LivenessDetectionSessionSettings = LivenessDetectionSessionSettings;
var AuthenticationSessionSettings = (function (_super) {
    __extends(AuthenticationSessionSettings, _super);
    function AuthenticationSessionSettings(userId) {
        var _this = _super.call(this) || this;
        _this.userId = userId;
        return _this;
    }
    return AuthenticationSessionSettings;
}(LivenessDetectionSessionSettings));
exports.AuthenticationSessionSettings = AuthenticationSessionSettings;
var RegistrationSessionSettings = (function (_super) {
    __extends(RegistrationSessionSettings, _super);
    function RegistrationSessionSettings(userId) {
        var _this = _super.call(this) || this;
        _this.bearingsToRegister = [Bearing.STRAIGHT, Bearing.LEFT, Bearing.RIGHT];
        _this.userId = userId;
        _this.numberOfResultsToCollect = 1;
        return _this;
    }
    return RegistrationSessionSettings;
}(VerIDSessionSettings));
exports.RegistrationSessionSettings = RegistrationSessionSettings;
var FaceTemplate = (function () {
    function FaceTemplate() {
    }
    return FaceTemplate;
}());
exports.FaceTemplate = FaceTemplate;
var Face = (function () {
    function Face() {
    }
    return Face;
}());
exports.Face = Face;
var DetectedFace = (function () {
    function DetectedFace() {
    }
    return DetectedFace;
}());
exports.DetectedFace = DetectedFace;
var Error = (function () {
    function Error() {
    }
    return Error;
}());
exports.Error = Error;
var SessionResult = (function () {
    function SessionResult() {
        this.attachments = [];
    }
    return SessionResult;
}());
exports.SessionResult = SessionResult;
var FaceComparisonResult = (function () {
    function FaceComparisonResult() {
    }
    return FaceComparisonResult;
}());
exports.FaceComparisonResult = FaceComparisonResult;
function decodeResult(callback) {
    return function (encoded) {
        if (encoded) {
            if (typeof encoded === 'string') {
                var decoded = JSON.parse(encoded);
                callback(decoded);
            }
            else {
                callback(encoded);
            }
        }
        else {
            callback();
        }
    };
}
var VerID = (function () {
    function VerID() {
    }
    VerID.prototype.register = function (settings) {
        return new Promise(function (resolve, reject) {
            var options = [{ "settings": JSON.stringify(settings) }];
            cordova.exec(decodeResult(resolve), reject, PLUGIN_NAME, "registerUser", options);
        });
    };
    VerID.prototype.authenticate = function (settings) {
        return new Promise(function (resolve, reject) {
            var options = [{ "settings": JSON.stringify(settings) }];
            cordova.exec(decodeResult(resolve), reject, PLUGIN_NAME, "authenticate", options);
        });
    };
    VerID.prototype.captureLiveFace = function (settings) {
        return new Promise(function (resolve, reject) {
            var options = [{ "settings": JSON.stringify(settings) }];
            cordova.exec(decodeResult(resolve), reject, PLUGIN_NAME, "captureLiveFace", options);
        });
    };
    VerID.prototype.getRegisteredUsers = function () {
        return new Promise(function (resolve, reject) {
            cordova.exec(decodeResult(resolve), reject, PLUGIN_NAME, "getRegisteredUsers", []);
        });
    };
    VerID.prototype.deleteRegisteredUser = function (userId) {
        return new Promise(function (resolve, reject) {
            cordova.exec(resolve, reject, PLUGIN_NAME, "deleteUser", [{ "userId": userId }]);
        });
    };
    VerID.prototype.compareFaces = function (face1, face2) {
        return new Promise(function (resolve, reject) {
            cordova.exec(decodeResult(resolve), reject, PLUGIN_NAME, "compareFaces", [{ "face1": JSON.stringify(face1) }, { "face2": JSON.stringify(face2) }]);
        });
    };
    VerID.prototype.detectFaceInImage = function (image) {
        return new Promise(function (resolve, reject) {
            function callback(encoded) {
                if (encoded == null) {
                    return reject("Face not found");
                }
                return resolve(JSON.parse(encoded));
            }
            cordova.exec(callback, reject, PLUGIN_NAME, "detectFaceInImage", [{ "image": image }]);
        });
    };
    return VerID;
}());
exports.VerID = VerID;
function load(password) {
    return new Promise(function (resolve, reject) {
        var options = [];
        if (password != undefined) {
            options.push({ "password": password });
        }
        cordova.exec(function () {
            var verid = new VerID();
            resolve(verid);
        }, reject, PLUGIN_NAME, "load", options);
    });
}
exports.load = load;
function unload() {
    return new Promise(function (resolve, reject) {
        cordova.exec(resolve, reject, PLUGIN_NAME, "unload", []);
    });
}
exports.unload = unload;
function setTestingMode(mode) {
    return new Promise(function (resolve, reject) {
        if (typeof mode === "boolean") {
            cordova.exec(resolve, reject, PLUGIN_NAME, "setTestingMode", [mode]);
        }
        else {
            reject('Invalid Parameter');
        }
    });
}
exports.setTestingMode = setTestingMode;
//# sourceMappingURL=Ver-ID.js.map