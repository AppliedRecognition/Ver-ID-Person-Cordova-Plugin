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
    - Navigate to **platforms/ios** and open the **Podfile** in a text editor. Set the platform to iOS 10: `platform :ios, '10.0'`. Close the file and run `pod install` to update the project. Alternatively, to automate this step copy the **[hooks/podfilesetup.js](https://github.com/AppliedRecognition/Ver-ID-Person-Cordova-Plugin/blob/master/hooks/podfilesetup.js)** script from the plugin to your Cordova project and add it as a `before_build` [hook](https://cordova.apache.org/docs/en/latest/guide/appdev/hooks/).
    - Open Cordova app's iOS work space in Xcode.
    - Ensure the project's deployment target is iOS 10 or newer. Alternatively, copy **[hooks/xcodeproject.js](https://github.com/AppliedRecognition/Ver-ID-Person-Cordova-Plugin/blob/master/hooks/xcodeproject.js)** and **[hooks/platformversion.js](https://github.com/AppliedRecognition/Ver-ID-Person-Cordova-Plugin/blob/master/hooks/platformversion.js)** from the plugin to your Cordova project and add **hooks/platformversion.js** as [hook](https://cordova.apache.org/docs/en/latest/guide/appdev/hooks/).
    - In your Xcode project's build settings ensure `SWIFT_VERSION` is set to **Swift 5**. You can automate this setting by copying **[hooks/xcodeproject.js](https://github.com/AppliedRecognition/Ver-ID-Person-Cordova-Plugin/blob/master/hooks/xcodeproject.js)** and **[hooks/swiftversion.js](https://github.com/AppliedRecognition/Ver-ID-Person-Cordova-Plugin/blob/master/hooks/swiftversion.js)** from the plugin to your Cordova project and add **swiftversion.js** as [hook](https://cordova.apache.org/docs/en/latest/guide/appdev/hooks/).
    - Open your app's **Info.plist** file and and ensure it contains an entry for `NSCameraUsageDescription`.
    - Still in the **Info.plist** file add the following entry, substituting `[your API secret]` for the API secret obtained after registration in step 1:

        ~~~xml
        <key>com.appliedrec.verid.apiSecret</key>
        <string>[your API secret]</string>
        ~~~
    - Select your app target and click on the **Build Settings** tab. Under **Build Options** ensure **Enable Bitcode** is set to **No**.
4. If your app includes Android platform:
    - Ensure your app targets Android API level 14 or newer.
    - Open your app's **AndroidManifest.xml** file and add the following tag in `<application>` replacing `[your API secret]` with the API secret your received in step 1:

        ~~~xml
        <meta-data 
           android:name="com.appliedrec.verid.apiSecret" 
           android:value="[your API secret]" />
        ~~~
    - Your application must use **Theme.AppCompat** theme (or its descendant).

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
If you prefer, you can to specify the API secret in your code instead of your app's manifest or plist:

~~~javascript
var apiSecret = "..."; // Alternative way to set your Ver-ID API secret

verid.load(apiSecret).then(verIDInstance => {
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
}).finally(() => {
	// Optionally unload the library to release its resources
	verid.unload();
});
~~~

## Liveness Detection

In a liveness detection session the user is asked to asume a series of random poses in front of the camera.

Liveness detection sessions follow he same format as registration and authentication.

### Extracting face templates for face comparison
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
	    var faceTemplates = response.attachments.filter(attachment => {
	    	return attachment.bearing == verid.Bearing.STRAIGHT && attachment.face.recognitionData;
	    }).map(face => {
	        return attachment.face.recognitionData;
	    });
	    // You can use the above templates to compare the detected face to faces from other sessions (see Comparing Faces section below)
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
    return instance.captureLiveFace(settings);
}).then(response => {
    // Session finished
}).catch(error => {
    // Handle the failure
});
~~~

## Session Response Format

The callback of a successful session will contain [an object](https://appliedrecognition.github.io/Ver-ID-Person-Cordova-Plugin/classes/_ver_id_.sessionresult.html) that represents the result of the session.

## Comparing Faces

After collecting two templates as outlined in the Liveness Detection section above run:

~~~javascript
verid.load().then(verIDInstance => {
    return verIDInstance.compareFaces(faceRecognitionData1, faceRecognitionData1);
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

See the [`Face`](https://appliedrecognition.github.io/Ver-ID-Person-Cordova-Plugin/classes/_ver_id_.face.html) type documentation for the properties of the returned face. You can pass the face's `recognitionData` to the [`compareFaces `](https://appliedrecognition.github.io/Ver-ID-Person-Cordova-Plugin/classes/_ver_id_.verid.html#comparefaces) function.

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
    verid.load().then(verIDInstance => {
        return verIDInstance.detectFaceInImage(uri);
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
 
