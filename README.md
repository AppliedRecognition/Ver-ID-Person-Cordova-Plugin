# Ver-ID Person Plugin for Cordova

## Introduction

Ver-ID gives your users the ability to authenticate using their face.

## Adding Ver-ID Person Plugin to Your Cordova App

1. [Request an API secret](https://dev.ver-id.com/admin/register) for your app.
2. Let's assume the following local directory structure for the purpose of this guide.

	~~~
	/Users/me/Documents/CordovaProject/app
	/Users/me/Documents/CordovaProject/plugins
	~~~
2. Open Terminal and change the working directory to the plugins directory.

	~~~
	cd /Users/me/Documents/CordovaProject/plugins
	~~~
3. Check out the plugin from Github.

	~~~
	git clone https://github.com/AppliedRecognition/Ver-ID-Person-Cordova-Plugin.git
	~~~	
2. Go to your app directory.

	~~~
	cd ../app
	~~~
1. Install the plugin.

	~~~
	cordova plugin add ../plugins/Ver-ID-Person-Cordova-Plugin
	~~~ 
3. If your app includes iOS platform:
	- Open Cordova app's iOS project in Xcode.
	- Ensure the project's deployment target is iOS 11 or newer.
	- In build settings specify Swift version as 4.
	- Open your app's **Info.plist** file and and ensure it contains an entry for `NSCameraUsageDescription`.
	- Still in the **Info.plist** file add the following entry, substituting `[your API secret]` for the API secret obtained after registration in step 1:

		~~~xml
		<key>com.appliedrec.verid.apiSecret</key>
		<string>[your API secret]</string>
		~~~
	- Download [VerIDModels.zip](https://dev.ver-id.com/resources/ios/3.0.1/VerIDModels.zip) and unzip it into a folder called **VerIDModels**.
	- Select your app target in Xcode and navigate into the **Build Phases** tab.
	- Expand the **Copy Bundle Resources** phase and click the **+** button to add a new resource.
	- Click the **Add Other...** button on the bottom left, navigate to the **VerIDModels** folder and select it.
	- In the dialog that comes up select **Create folder references**. You can keep the **Copy items if needed** check box unchecked.
	- Click **Finish**.
4. If your app includes Android platform:
	- Ensure your app targets Android API level 18 or newer.
	- Open your app's **AndroidManifest.xml** file and add the following tag in `<application>` replacing `[your API secret]` with the API secret your received in step 1:

		~~~xml
		<meta-data 
		   android:name="com.appliedrec.verid.apiSecret" 
		   android:value="[your API secret]" />
		~~~
	- Your application must use **Theme.AppCompat** theme (or its descendant).
	- In your manifest's `<manifest>` element ensure that the `android:minSdkVersion` attribute of `<uses-sdk>` element is set to `"18"` or higher.
	- Download [VerIDModels.zip](https://dev.ver-id.com/resources/android/3.0.2/VerIDModels.zip) and unzip it into a folder called **VerIDModels**.
	- Move the folder into your Android app's **assets** folder. The **assets** folder path will be something like **app/src/main/assets**.

## Loading Ver-ID

Ver-ID is loaded implicitly with all API calls. The load operation may take up to a couple of seconds. You may wish to load Ver-ID before calling the API if you want to minimise the delay between issuing the API call and the Ver-ID Credentials user interface appearing.

You may also load Ver-ID using the `load` call if you are unable to specify your API secret in your app's plist or manifest file.

<script src="https://gist.github.com/jakubdolejs/065f28a0b1d81e8669f720b28532452e.js"></script>
	
## Register And Authenticate User From Javascript

The Ver-ID Person plugin will be available in your script as a global variable `verid`.

<script src="https://gist.github.com/jakubdolejs/940a84694b7eeae1c35f7fdeac6f8329.js"></script>

## Response Format

The callback of a successful session will contain an object that represents the result of the session.

<script src="https://gist.github.com/jakubdolejs/28700017ae9f694af6d78c2c196e7be8.js"></script>

## Liveness Detection

In a liveness detection session the user is asked to asume a series of random poses in front of the camera.

Liveness detection sessions follow he same format as registration and authentication.

<script src="https://gist.github.com/jakubdolejs/d023d9869b303fb2213914a5ea9e1721.js"></script>

## Comparing Faces

After collecting two templates as outlined in the Liveness Detection section above run:

<script src="https://gist.github.com/jakubdolejs/e473286ceeae9ed82555ccc0530597c7.js"></script>

The `score` variable will be a value between `0` and `1`:

 - `0` no similarity between the two face templates 
 - `1` templates are identical

## API Reference

 - [Ver-ID](docs/VERID.md)
 - [Ver-ID Utilities](docs/VERIDUTILS.md)