/**
 * Ver-ID Plugin
 */

declare var cordova: any;

var PLUGIN_NAME: string = "VerIDPlugin";

export enum Bearing {
    STRAIGHT = "STRAIGHT",
    UP = "UP",
    RIGHT_UP = "RIGHT_UP",
    RIGHT = "RIGHT",
    RIGHT_DOWN = "RIGHT_DOWN",
    DOWN = "DOWN",
    LEFT_DOWN = "LEFT_DOWN",
    LEFT = "LEFT",
    LEFT_UP = "LEFT_UP"
}

/**
 * Base class for Ver-ID session settings
 */
export class VerIDSessionSettings {
    /**
     * Time it will take for the session to expire (in seconds)
     */
    expiryTime: number = 30.0;
    /**
     * The number of detected faces and images the session must collect before finishing
     */
    numberOfResultsToCollect: number = 2;
    /**
     * Set to `true` to display the result of the session to the user
     */
    showResult: boolean = false;
}

/**
 * Settings for liveness detection sessions
 */
export class LivenessDetectionSessionSettings extends VerIDSessionSettings {

    /**
     * Default pool of bearings the session will draw from when asking for a random pose
     */
    static DEFAULT_BEARINGS: Bearing[] = [Bearing.STRAIGHT, Bearing.LEFT, Bearing.LEFT_UP, Bearing.RIGHT_UP, Bearing.RIGHT];

    /**
     * The bearings the session will draw from when asking for a random pose
     */
    bearings: Bearing[] = LivenessDetectionSessionSettings.DEFAULT_BEARINGS;
}

/**
 * Settings for authentication sessions
 */
export class AuthenticationSessionSettings extends LivenessDetectionSessionSettings {

    /**
     * ID of the user to authenticate
     */
    userId: string;

    /**
     * @param userId ID of the user to authenticate
     */
    constructor(userId: string) {
        super();
        this.userId = userId;
    }
}

/**
 * Settings for registration sessions
 */
export class RegistrationSessionSettings extends VerIDSessionSettings {

    /**
     * ID of the user to register
     */
    userId: string;
    /**
     * Bearings to register in this session
     * 
     * @note The number of faces to register is determined by the {@linkcode VerIDSessionSettings.numberOfResultsToCollect} parameter. If the number of results to collect exceeds the number of bearings to register the session will start take the next bearing from the beginning of the bearings array. 
     * 
     * For example, a session with bearings to register set to `[Bearing.STRAIGHT, Bearing.LEFT, Bearing.RIGHT]` and `numberOfResultsToCollect` set to `2` will register faces with bearings: `[Bearing.STRAIGHT, Bearing.LEFT]`.
     * 
     * A session with bearings to register set to ```[Bearing.STRAIGHT, Bearing.LEFT, Bearing.RIGHT]` and `numberOfResultsToCollect` set to `2` will register faces with bearings: `[Bearing.STRAIGHT, Bearing.LEFT, Bearing.RIGHT, Bearing.STRAIGHT]`.
     */
    bearingsToRegister: Bearing[] = [Bearing.STRAIGHT, Bearing.LEFT, Bearing.RIGHT];

    /**
     * @param userId ID of the user whose faces should be registered
     */
    constructor(userId: string) {
        super();
        this.userId = userId;
        this.numberOfResultsToCollect = 1;
    }
}

/**
 * Face recognition template
 */
export class FaceTemplate {
    /**
     * Data used for face recognition
     */
    data: string;
    /**
     * Template version
     */
    version: number;
}

/**
 * Represents a detected face
 */
export class Face {
    /**
     * Distance of the left edge of the face from the left edge of the image (in pixels)
     */
    x: number;
    /**
     * Distance of the top edge of the face from the top edge of the image (in pixels)
     */
    y: number;
    /**
     * Width of the face in the image (in pixels)
     */
    width: number;
    /**
     * Height of the face in the image (in pixels)
     */
    height: number;
    /**
     * Yaw of the face in relation to the camera
     */
    yaw: number;
    /**
     * Pitch of the face in relation to the camera
     */
    pitch: number;
    /**
     * Roll of the face in relation to the camera
     */
    roll: number;
    /**
     * Quality of the face landmarks (10 maximum)
     */
    quality: number;
    /**
     * Face template used for face recognition
     */
    faceTemplate: FaceTemplate;
}

/**
 * Face detected during a session
 */
export class DetectedFace {
    /**
     * Detected face
     */
    face: Face;
    /**
     * Detected face bearing
     */
    bearing: Bearing;
    /**
     * Image encoded using [data URI scheme](https://en.wikipedia.org/wiki/Data_URI_scheme)
     */
    image: string;
}

export class Error {
    domain: string;
    code: number;
    description: string;
}

/**
 * Result of a Ver-ID session
 */
export class SessionResult {
    /**
     * Faces and images detected during a session
     */
    attachments: DetectedFace[] = [];
    /**
     * Error (if any) that caused the session to fail
     */
    error?: Error;
}

/**
 * Result of a face comparison
 */
export class FaceComparisonResult {
    /**
     * The result score
     */
    score: number;
    /**
     * Comparisons with scores higher than the threshold may be considered authenticated
     */
    authenticationThreshold: number;
    /**
     * Maximum possible score
     */
    max: number;
}

function decodeResult<T>(callback: (result?: T) => void) {
    return function(encoded?: string) {
        if (encoded) {
            if (typeof encoded === 'string') {
                var decoded = JSON.parse(encoded);
                callback(decoded);
            } else {            
                callback(encoded);
            }
        } else {
            callback();
        }
    }
}

export class VerID {

    /**
     * Register faces for user
     * @param settings Session settings
     */
    register(settings: RegistrationSessionSettings): Promise<SessionResult> {
        return new Promise<SessionResult>((resolve, reject) => {
            var options = [{"settings": JSON.stringify(settings)}];
            cordova.exec(decodeResult(resolve), reject, PLUGIN_NAME, "registerUser", options);
        });
    }

    /**
     * Authenticate user
     * @param settings Session settings
     */
    authenticate(settings: AuthenticationSessionSettings): Promise<SessionResult> {
        return new Promise<SessionResult>((resolve, reject) => {
            var options = [{"settings": JSON.stringify(settings)}];
            cordova.exec(decodeResult(resolve), reject, PLUGIN_NAME, "authenticate", options);
        });
    }

    /**
     * Capture a live face
     * @param settings Session settings
     */
    captureLiveFace(settings: LivenessDetectionSessionSettings): Promise<SessionResult> {
        return new Promise<SessionResult>((resolve, reject) => {
            var options = [{"settings": JSON.stringify(settings)}];
            cordova.exec(decodeResult(resolve), reject, PLUGIN_NAME, "captureLiveFace", options);
        });
    }

    /**
     * Get an array of users with registered faces
     */
    getRegisteredUsers(): Promise<string[]> {
        return new Promise<string[]>((resolve, reject) => {
            cordova.exec(decodeResult(resolve), reject, PLUGIN_NAME, "getRegisteredUsers", []);
        });
    }

    /**
     * Delete user with registered faces
     * @param userId ID of the user to delete
     */
    deleteRegisteredUser(userId: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            cordova.exec(resolve, reject, PLUGIN_NAME, "deleteUser", [{"userId":userId}]);
        });
    }

    /**
     * Compare faces and return a result
     * @param face1 Face to compare to the other face
     * @param face2 Other face to compare to the first face
     */
    compareFaces(face1: Face, face2: Face): Promise<FaceComparisonResult> {
        return new Promise<FaceComparisonResult>((resolve, reject) => {
            cordova.exec(decodeResult(resolve), reject, PLUGIN_NAME, "compareFaces", [{"face1":JSON.stringify(face1)},{"face2":JSON.stringify(face2)}]);
        });
    }

    /**
     * Detect a face in image
     * @param image [Data URI scheme](https://en.wikipedia.org/wiki/Data_URI_scheme) encoded image in which to detect a face
     */
    detectFaceInImage(image: string): Promise<Face> {
        return new Promise<Face>((resolve, reject) => {
            function callback(encoded: string) {
                if (encoded == null) {
                    return reject("Face not found");
                }
                return resolve(JSON.parse(encoded));
            }
            cordova.exec(callback, reject, PLUGIN_NAME, "detectFaceInImage", [{"image":image}]);
        });
    }
}

/**
 * Load Ver-ID
 * @param apiSecret Ver-ID API secret (if omitted the library will look in the app's plist (iOS) or manifest (Android))
 * @returns Promise whose resolve function's argument contains the loaded Ver-ID instance
 * @example
 * ```typescript
 * 
 * verid.load().then(instance => {
 *    // You can now call instance methods
 * }).catch(error => {
 *    // Load failed
 * });
 * ```
 */
export function load(apiSecret?: string): Promise<VerID> {
    return new Promise<VerID>((resolve, reject) => {
        var options = [];
        if (apiSecret != undefined) {
            options.push({"apiSecret": apiSecret});
        }
        cordova.exec(function(){
            var verid = new VerID();
            resolve(verid);
        }, reject, PLUGIN_NAME, "load", options);
    });
}

/**
 * Unload Ver-ID
 * @param veridInstance The Ver-ID instance to unload
 */
export function unload(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        cordova.exec(resolve, reject, PLUGIN_NAME, "unload", []);
    });
}
/**
 * Set testing mode
 * @param mode used to set the testing mode on or off
 */
export function setTestingMode(mode: boolean): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        if (typeof mode === "boolean") {
            cordova.exec(resolve, reject, PLUGIN_NAME, "setTestingMode", [mode]);
        } else {
            reject('Invalid Parameter');
        }
    });
}