# Ver-ID Person Plugin for Cordova

## Introduction

Ver-ID gives your users the ability to authenticate using their face.

## Adding Ver-ID Person Plugin to Your Cordova App

1. [Request an API secret](https://dev.ver-id.com/admin/register) for your app.
1. Clone the plugin Git repo into your file system:

    ~~~bash
    git clone --recurse-submodules https://github.com/AppliedRecognition/Ver-ID-Person-Cordova-Plugin.git
    ~~~
1. Navigate to your Cordova project directory and install the plugin substituting `path/to/plugin` with the path of the plugin you checked out in the previous step:

	~~~bash
	cordova plugin add path/to/plugin
	~~~
1. If your app includes iOS platform:
    - Navigate to **platforms/ios** and open the **Podfile** in a text editor. Add `use_frameworks!` in the target that's using the Ver-ID pod.
    - Set the platform to iOS 11: `platform :ios, '11.0'`.
    - Run `pod install` to update the project.
    - Open Cordova app's iOS work space in Xcode.
    - Ensure the project's deployment target is iOS 11 or newer.
    - Open your app's **Info.plist** file and and ensure it contains an entry for `NSCameraUsageDescription`.
    - Still in the **Info.plist** file add the following entry, substituting `[your API secret]` for the API secret obtained after registration in step 1:

        ~~~xml
        <key>com.appliedrec.verid.apiSecret</key>
        <string>[your API secret]</string>
        ~~~
    - Select your app target and click on the **Build Settings** tab. Under **Build Options** ensure **Enable Bitcode** is set to **No**.
    - Under **Build Settings** set **Swift Language Version** to **4.2**.
4. If your app includes Android platform:
    - Ensure your app targets Android API level 14 or newer.
    - Open your app's **AndroidManifest.xml** file and add the following tag in `<application>` replacing `[your API secret]` with the API secret your received in step 1:

        ~~~xml
        <meta-data 
           android:name="com.appliedrec.verid.apiSecret" 
           android:value="[your API secret]" />
        ~~~
    - Your application must use **Theme.AppCompat** theme (or its descendant).
    - Open your application's **build.gradle** file and under **android/defaultConfig** add:
    	
        ~~~groovy
        renderscriptTargetApi 14
        renderscriptSupportModeEnabled true
        ~~~

## Loading Ver-ID

Ver-ID must be loaded before you can run face detection sessions or compare faces.

The load operation may take up to a few of seconds. Load Ver-ID using the `load` call:

~~~javascript
verid.load(function() {
    // Ver-ID loaded successfully
    // You can now run registration, authentication or liveness detection
}, function() {
    // Ver-ID failed to load
});
~~~
If you prefer, you can to specify the API secret in your code instead of your app's manifest or plist:

~~~javascript
var apiSecret = "..."; // Alternative way to set your Ver-ID API secret

verid.load(apiSecret, function(){
    // Ver-ID loaded successfully
    // You can now run registration, authentication or liveness detection
}, function(){
    // Ver-ID failed to load
});
~~~
    
## Register and Authenticate User From Javascript

The Ver-ID Person plugin module will be available in your script as a global variable `verid`.

~~~javascript
var userId = "myUserId"; // String with an identifier for the user

// Registration
function register() {
    var settings = new verid.RegistrationSessionSettings(userId);
    settings.showResult = true; // If you wish the plugin to show the result of the session to the user

    verid.register(settings, function(response) {
        if (response.outcome == verid.SessionOutcome.SUCCESS) {
            // User registered
            // Run an authentication session
            authenticate();
        }
    }, function() {
        // Handle the failure
    });
}

// Authentication
function authenticate() {
    var settings = new verid.AuthenticationSessionSettings(userId);
    settings.showResult = true; // If you wish the plugin to show the result of the session to the user
    
    verid.authenticate(settings, function(response) {
        if (response.outcome == verid.SessionOutcome.SUCCESS) {
            // User authenticated
        }
    }, function() {
            // Handle the failure
    });
}

// Load Ver-ID before running registration or authentication
verid.load(function(){
    // Ver-ID loaded successfully
    // Run a registration session
    register();  
}, function(){
    // Ver-ID failed to load
});
~~~

## Liveness Detection

In a liveness detection session the user is asked to asume a series of random poses in front of the camera.

Liveness detection sessions follow he same format as registration and authentication.

### Extracting face templates for face comparison
~~~javascript
// Load Ver-ID before running liveness detection
verid.load(function(){
    // Ver-ID loaded successfully  
    // Run a liveness detection session  
    var settings = verid.LivenessDetectionSessionSettings();
    settings.includeFaceTemplatesInResult = true;
    verid.captureLiveFace(settings, function(response) {
        // Session finished
        if (response.outcome == verid.SessionOutcome.SUCCESS) {            
            var faceTemplates = response.getFaceComparisonTemplates(verid.Bearing.STRAIGHT);
            // You can use the above templates to compare the detected face to faces from other sessions (see Comparing Faces section below)
        }
    }, function() {
        // Session failed
    });
}, function(){
    // Ver-ID failed to load  
});
~~~

### Face detection session without asking for poses
~~~javascript
// Load Ver-ID before running liveness detection
verid.load(function(){
    // Ver-ID loaded successfully  
    // Run a liveness detection session  
    var settings = verid.LivenessDetectionSessionSettings();
    // We only want to collect one result
    settings.numberOfResultsToCollect = 1;
    // Ask the user to assume only one bearing (straight)
    settings.bearings = [verid.Bearing.STRAIGHT];
    verid.captureLiveFace(settings, function(response) {
        // Session finished
    }, function() {
        // Session failed
    });
}, function(){
    // Ver-ID failed to load  
});
~~~

### Liveness detection session defining the bearings (poses) the user may be asked to assume
~~~javascript
// Load Ver-ID before running liveness detection
verid.load(function(){
    // Ver-ID loaded successfully  
    // Run a liveness detection session  
    var settings = verid.LivenessDetectionSessionSettings();
    // The user will be asked to look straight at the camera and then either left or right
    settings.bearings = [verid.Bearing.STRAIGHT, verid.Bearing.LEFT, verid.Bearing.RIGHT];
    verid.captureLiveFace(settings, function(response) {
        // Session finished
    }, function() {
        // Session failed
    });
}, function(){
    // Ver-ID failed to load  
});
~~~

## Session Response Format

The callback of a successful session will contain [an object](https://appliedrecognition.github.io/Ver-ID-Person-Cordova-Plugin/module-verid.SessionResult.html) that represents the result of the session.

## Comparing Faces

After collecting two templates as outlined in the Liveness Detection section above run:

~~~javascript
verid.compareFaceTemplates(template1, template2, function(response) {
	var score = response.score;
	// score is a value between 0.0 and 1.0.
	// 0.0 = the face templates are completely different
	// 1.0 = the face templates are very similar
}, function() {
	// Face comparison failed
});
~~~

## Detecting Faces In Images

As of version 4.1.0 the API lets your app detect a face in an image it supplies. The image must be supplied using [data URI scheme](https://en.wikipedia.org/wiki/Data_URI_scheme).

See the [`Face`](https://appliedrecognition.github.io/Ver-ID-Person-Cordova-Plugin/module-verid.html#~Face) type documentation for the properties of the returned face. You can pass the face's `faceTemplate` to the [`compareFaceTemplates `](https://appliedrecognition.github.io/Ver-ID-Person-Cordova-Plugin/module-verid.html#.compareFaceTemplates) function.

~~~javascript
// Create an image object
var image = new Image();
// Set load callback
image.onload = function() {
	// Create a canvas element
	var canvas = document.createElement("canvas");
	// Set the canvas width to match the width of the image
	canvas.width = image.width;
	// Set the height width to match the height of the image
	canvas.height = image.height;
	// Get the canvas 2D context
	var ctx = canvas.getContext("2d");
	// Draw the image on the canvas
	ctx.drawImage(image, 0, 0);
	// Get the image data URI as JPEG at 0.95 quality
	var uri = canvas.toDataURL("image/jpeg", 0.95);
	// Use Ver-ID to detect a face in the image
	verid.detectFaceInImage(uri, function(face) {
	    // Face detected
	}, function(error) {
	    // Face detection failed
});
}
// Set error callback
image.onerror = function() {
    console.log("Error loading image");
}
// Set the image source (change img/test.jpg to your image location)
image.src = "img/test.jpg";
~~~

## Module API Reference

 - [Ver-ID](https://appliedrecognition.github.io/Ver-ID-Person-Cordova-Plugin/module-verid.html)
 
