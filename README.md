![GitHub package.json version](https://img.shields.io/github/package-json/v/AppliedRecognition/Ver-ID-Person-Cordova-Plugin.svg)

[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)

[![Build Status](https://travis-ci.com/vsecades/Ver-ID-Person-Cordova-Plugin.svg?branch=unit-testing)](https://travis-ci.com/github/vsecades/Ver-ID-Person-Cordova-Plugin)

# Ver-ID Person Plugin for Cordova

## Introduction

Ver-ID gives your users the ability to authenticate using their face.

## Compatibility 

The Ver-ID plugin has been tested to work with Cordova against the following compatibility matrix for iOS and Android:

| Cordova Version   | iOS       | Android   |
|-----------------  |-------    |---------  |
| 7.0               | 5.0.0     | 8.0.0     |
| 8.0               | 5.0.0     | 8.0.0     |
| 9.0               | 5.0.0     | 8.0.0     |

Other combinations may work, but your mileage may vary.  Be sure to run the unit test suite against your Cordova and mobile OS platform combination to make sure all functionality works before proceeding.

## Adding Ver-ID Person Plugin to Your Cordova App

1. [Request a License File and password](https://dev.ver-id.com/admin/register) for your app.
1. Clone the plugin Git repo into your file system:

    ~~~bash
    git clone --recurse-submodules https://github.com/AppliedRecognition/Ver-ID-Person-Cordova-Plugin.git
    ~~~
1. Navigate to your Cordova project directory and install the plugin substituting `path/to/plugin` with the path of the plugin you checked out in the previous step:

	~~~bash
	cordova plugin add path/to/plugin --password=PROVIDED_PASSWORD --certificate="path/to/certificate"
	~~~
1. If your app includes iOS platform:
    - Navigate to **platforms/ios** and open the **Podfile** in a text editor. Set the platform to iOS 10.3: `platform :ios, '10.3'`. Close the file and run `pod install` to update the project. Alternatively, to automate this step copy the **[hooks/podfilesetup.js](https://github.com/AppliedRecognition/Ver-ID-Person-Cordova-Plugin/blob/master/hooks/podfilesetup.js)** script from the plugin to your Cordova project and add it as a `before_build` [hook](https://cordova.apache.org/docs/en/latest/guide/appdev/hooks/).
    - Open Cordova app's iOS work space in Xcode.
    - Ensure the project's deployment target is iOS 10 or newer. Alternatively, copy **[hooks/xcodeproject.js](https://github.com/AppliedRecognition/Ver-ID-Person-Cordova-Plugin/blob/master/hooks/xcodeproject.js)** and **[hooks/platformversion.js](https://github.com/AppliedRecognition/Ver-ID-Person-Cordova-Plugin/blob/master/hooks/platformversion.js)** from the plugin to your Cordova project and add **hooks/platformversion.js** as [hook](https://cordova.apache.org/docs/en/latest/guide/appdev/hooks/).
    - In your Xcode project's build settings ensure `SWIFT_VERSION` is set to **Swift 5**. You can automate this setting by copying **[hooks/xcodeproject.js](https://github.com/AppliedRecognition/Ver-ID-Person-Cordova-Plugin/blob/master/hooks/xcodeproject.js)** and **[hooks/swiftversion.js](https://github.com/AppliedRecognition/Ver-ID-Person-Cordova-Plugin/blob/master/hooks/swiftversion.js)** from the plugin to your Cordova project and add **swiftversion.js** as [hook](https://cordova.apache.org/docs/en/latest/guide/appdev/hooks/).
    - Open your app's **Info.plist** file and and ensure it contains an entry for `NSCameraUsageDescription`.
    - Still in the **Info.plist** file add the following entry if not present, substituting `[your password]` for the API password obtained after registration in step 1:

        ~~~xml
        <key>com.appliedrec.verid.password</key>
        <string>[your password]</string>
        ~~~
    - Select your app target and click on the **Build Settings** tab. Under **Build Options** ensure **Enable Bitcode** is set to **No**.
4. If your app includes Android platform:
    - Ensure your app targets Android API level 21 or newer. Open your Cordova project's **config.xml** file and add the following entry:
        
        ~~~xml
        <widget>
            <platform name="android">
                <preference name="android-minSdkVersion" value="21" />
            </platform>
        </widget>
        ~~~
	
    - Open your app's **AndroidManifest.xml** file and add the following tag if
      not present in `<application>` replacing `[your password]` with the API password you
      received in step 1:

        ~~~xml
        <meta-data 
           android:name="com.appliedrec.verid.password" 
           android:value="[your password]" />
        ~~~
    - Your application must use **Theme.AppCompat** theme (or its descendant).
    
 6. Build errors that may occur on Android:
 	- **Error:** `ERROR: Could not find method leftShift() for arguments [build_2jwxldxc1vfcnoswux9rruw5k$_run_closure6@606af351] on task ':app:cdvPrintProps' of type org.gradle.api.DefaultTask.`
	
	- **Solution:** Project's root directory->platform->android->app->build.gradle: Left shift() argument error to remove from `task cdvPrintProps <<{}`. Remove `<<` and build the project.
	
	- **Error:** `ERROR: Manifest merger failed: uses-sdk:minSdkVersion 19 cannot be smaller than version 21 declared in library [com.appliedrec.verid:ui:1.14.2] /home/bee/.gradle/caches/transforms-2/files-2.1/7c738ca6a43c7d105c66313e7380c1d8/AndroidManifest.xml as the library might be using APIs not available in 19. Suggestion: use a compatible library with a minSdk of at most 19, or increase this project's minSdk version to at least 21, or use tools:overrideLibrary="com.appliedrec.verid.ui" to force usage (may lead to runtime failures)`
	
	- **Solution:**	
		- **Step 1:** Remove `<uses-sdk android:minSdkVersion="21" />` in your project's root directory->platform->android->app->src->main->AndroidManifest.xml. In you case, `minSdkVersion` might be different.		
		- **Step 2:** Remove `<uses-sdk android:minSdkVersion="19" />` in your project's root directory->platform->android->CordovaLib->AndroidManifest.xml. In you case, `minSdkVersion` might be different.		
		- **Step 3:** Edit your project's root directory->platform->android->build.gradle:
			1. In `dependencies {}`, make sure the classpath of tools gradle is as that of the Android Studio version. Currently, it's 3.5.2 hence the classpath looks like: `classpath 'com.android.tools.build:gradle:3.5.2'`
			2. Under `project.ext {}`, change the `defaultBuildToolsVersion` to `28.0.0`, `defaultMinSdkVersion` to `21`, `defaultTargetSdkVersion` and `defaultCompileSdkVersion` to `28`. You can also try replacing these values with the latest version of the SDK. Mentioned values have been tested by us.
   
## Loading Ver-ID

Ver-ID must be loaded before you can run face detection sessions or compare faces.

The load operation may take up to a few of seconds. Load Ver-ID using the `load` call:

~~~javascript
verid.load().then(verIDInstance => {
    // Ver-ID loaded successfully
    // You can now run registration, authentication or liveness detection on verIDInstance
}).catch(error => {
    // Ver-ID failed to load
});
~~~
If you prefer, you can to specify the API password in your code instead of your app's manifest or plist:

~~~javascript
var apiPassword = "..."; // Alternative way to set your Ver-ID API Password

verid.load(apiPassword).then(verIDInstance => {
    // Ver-ID loaded successfully
    // You can now run registration, authentication or liveness detection
}).catch(error => {
    // Ver-ID failed to load
});
~~~
    
## Register and Authenticate User From Javascript

The Ver-ID Person plugin module will be available in your script as a global variable `verid`.

~~~javascript
var userId = "myUserId"; // String with an identifier for the user
var verIDInstance;

// Load Ver-ID before running registration or authentication
verid.load().then(instance => {
    // Ver-ID loaded successfully
    verIDInstance = instance;
    // Run a registration session
    var settings = new verid.RegistrationSessionSettings(userId);
    settings.showResult = true; // If you wish the plugin to show the result of the session to the user
    return verIDInstance.register(settings);
}).then(response => {
    if (!response) {
	// User cancelled the registration
	return;
    }
    if (!response.error) {
        // User registered
        // Run an authentication session
        var settings = new verid.AuthenticationSessionSettings(userId);
        settings.showResult = true; // If you wish the plugin to show the result of the session to the user    
        return verIDInstance.authenticate(settings);
    } else {
        return response;
    }
}).then(response => {
    if (!response) {
        // User cancelled the registration
    } else if (!response.error) {
        // User authenticated
    } else {
        // Session failed
    }
}).catch(error => {
    // Handle the failure
});
~~~

## Liveness Detection

In a liveness detection session the user is asked to asume a series of random poses in front of the camera.

Liveness detection sessions follow he same format as registration and authentication.

### Extracting faces for face comparison
~~~javascript
// Load Ver-ID before running liveness detection
verid.load().then(verIDInstance => {
    // Ver-ID loaded successfully  
    // Run a liveness detection session  
    var settings = verid.LivenessDetectionSessionSettings();
    return verIDInstance.captureLiveFace(settings);
}).then(response => {
    if (!response) {
	// Session was cancelled
    } else if (!response.error) {
        // Session finished
        var faces = response.attachments.filter(attachment => {
	    // Only get faces that are looking straight at the camera and have recognition data
	    return attachment.bearing == verid.Bearing.STRAIGHT && attachment.face.faceTemplate;
        }).map(face => {
            return attachment.face;
        });
        // You can use the above faces to compare the detected face to faces from other sessions (see Comparing Faces section below)
    } else {
    	// Session failed
    }
}).catch(error => {
    // Handle the failure
});
~~~

### Face detection session without asking for poses
~~~javascript
// Load Ver-ID before running liveness detection
verid.load().then(verIDInstance => {
    // Ver-ID loaded successfully  
    // Run a liveness detection session  
    var settings = verid.LivenessDetectionSessionSettings();
    // We only want to collect one result
    settings.numberOfResultsToCollect = 1;
    // Ask the user to assume only one bearing (straight)
    settings.bearings = [verid.Bearing.STRAIGHT];
    return verIDInstance.captureLiveFace(settings);
}).then(response => {
    // Session finished
}).catch(error => {
    // Handle the failure
});
~~~

### Liveness detection session defining the bearings (poses) the user may be asked to assume
~~~javascript
// Load Ver-ID before running liveness detection
verid.load().then(verIDInstance => {
    // Ver-ID loaded successfully  
    // Run a liveness detection session  
    var settings = verid.LivenessDetectionSessionSettings();
    // The user will be asked to look straight at the camera and then either left or right
    settings.bearings = [verid.Bearing.STRAIGHT, verid.Bearing.LEFT, verid.Bearing.RIGHT];
    return verIDInstance.captureLiveFace(settings);
}).then(response => {
    // Session finished
}).catch(error => {
    // Handle the failure
});
~~~

## Session Response Format

The callback of a successful session will contain [an object](https://appliedrecognition.github.io/Ver-ID-Person-Cordova-Plugin/classes/_ver_id_.sessionresult.html) that represents the result of the session.

## Comparing Faces

After collecting two faces as outlined in the Liveness Detection section above run:

~~~javascript
verid.load().then(verIDInstance => {
    return verIDInstance.compareFaces(face1, face2);
}).then(result => {
    // result.score = Similarity score between the two faces
    // result.authenticationThreshold = Threshold beyond which faces may be considered similar enough for the user to be authenticated
    // result.max = Maximum possible score
}).catch(error => {
    // Handle the failure
});
~~~

## Detecting Faces In Images

As of version 4.1.0 the API lets your app detect a face in an image it supplies. The image must be supplied using [data URI scheme](https://en.wikipedia.org/wiki/Data_URI_scheme).

See the [`Face`](https://appliedrecognition.github.io/Ver-ID-Person-Cordova-Plugin/classes/_ver_id_.face.html) type documentation for the properties of the returned face. You can pass the faces to the [`compareFaces `](https://appliedrecognition.github.io/Ver-ID-Person-Cordova-Plugin/classes/_ver_id_.verid.html#comparefaces) function.

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
    var dataUri = canvas.toDataURL("image/jpeg", 0.95);
    verid.load().then(verIDInstance => {
        return verIDInstance.detectFaceInImage(dataUri);
    }).then(face => {
        // Face detected
    }).catch(error => {
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

 - [Ver-ID](https://appliedrecognition.github.io/Ver-ID-Person-Cordova-Plugin/modules/_ver_id_.html)
 
