![GitHub package.json version](https://img.shields.io/github/package-json/v/AppliedRecognition/Ver-ID-Person-Cordova-Plugin.svg)

# Ver-ID Person Plugin for Cordova

## Introduction

The following instructions to run a sample will work for each of the
samples provided.

## Steps to run a cordova sample

1. Clone the plugin Git repo into your file system:

    ```
    git clone --recurse-submodules https://github.com/AppliedRecognition/Ver-ID-Person-Cordova-Plugin.git
    ```
1. Navigate to the plugin directory and change to the samples branch:

	```
	git checkout samples
	```
1. Navigate to the sample project that you want to test:

	```
	Example: cd samples/cordova7.0.0_sample
	```

1. From root sample directory, run the following command to add iOS and Android platforms:
    
    ```
    cordova platform add android@8.0.0 ios@5.0.0
	  ```

1. Now install verid plugin using the next command, note: the certificate is inside samples/assets directory:

	```
	cordova plugin add  ../plugin --password=41475bf3-ca73-4579-b909-07228ed85b17 --certificate="path/to/certificate"
	```

1. Install cordova testing framework using the next command:

    ```
	  cordova plugin add  cordova-plugin-test-framework
	  ```

1. For iOS platform:
   - Navigate to **platforms/ios** and open the **Podfile** in a text editor.
     Add `use_frameworks!` after `platform :ios, '10.3'`. Close the file and run
     `pod install`
     to update the project.

    - Open Cordova app's iOS work space in Xcode.
    - Ensure the project's deployment target is iOS 10 or newer.
    - In your Xcode project's build settings ensure `SWIFT_VERSION` is set to **Swift 5**.
    - Open your app's **Info.plist** file and and ensure it contains an entry for `NSCameraUsageDescription`.
    - Select your app target and click on the **Build Settings** tab. Under
      **Build Options** ensure **Enable Bitcode** is set to **No**.

1. For Android platform:
   - Open **platforms/android** with Android Studio.
   - If an alert shows up requiring to sync gradle tap on the **Okay** button.

        ![graddle sync](documentation/graddle_sync.png)
   - After that you may see the following error `ERROR: The minSdk version should not be declared in the android manifest file. You can move the version from the manifest to the defaultConfig in the build.gradle file.`,
   - **Solution:**	
		- **Step 1:** Remove `<uses-sdk android:minSdkVersion="21" />` in android's root directory->app->src->main->AndroidManifest.xml.		
		- **Step 2:** Remove `<uses-sdk android:minSdkVersion="19" />` in your android's root directory->CordovaLib->AndroidManifest.xml.

    - After removing those lines, go to the File menu of Android Studio and tap
      **Sync Project with Gradle Files**, once the process ends the app should
      be ready to run.
 
