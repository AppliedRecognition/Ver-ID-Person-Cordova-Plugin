![GitHub package.json version](https://img.shields.io/github/package-json/v/AppliedRecognition/Ver-ID-Person-Cordova-Plugin.svg)

# Ver-ID Person Plugin for Cordova

## Introduction

The following instructions to run a sample will work for each of the
samples provided.

## Steps to run a Cordova sample

1. Clone the **samples** branch of the plugin Git repo into your file system:

    ```bash
    git clone -b samples https://github.com/AppliedRecognition/Ver-ID-Person-Cordova-Plugin.git
    ```

1. Run npm install inside the project directory

    ```bash
    npm install
    ```

1. Check the Cordova version you are performing development with on your system:

    ```bash
    cordova --version
    ```

1. Navigate to the sample project that you want to test within the recently cloned repository, based off of the installed major version of Cordova you have installed. These are located in the samples/cordova[VERSION]\_sample directory (there are samples for major versions 7, 8, 9, and 10). For example:

    ```bash
    cd samples/cordova7.0.0_sample
    ```

1. From the selected sample project directory, run the following command to add iOS and Android platforms (these platform versions are the ones tested and supported in the current repository. The supported Cordova and Cordova platform combinations can be found [here](README.md) under the Compatibility section:

    ```bash
    cordova platform add android@9.0.0 ios@6.0.0
    ```

1. From the selected sample project directory, install the Ver-ID plugin using the following command (note: the certificate is inside samples/assets directory):

    ```bash
    cordova plugin add  ../../../Ver-ID-Person-Cordova-Plugin --password=41475bf3-ca73-4579-b909-07228ed85b17 --certificate="../assets/Ver-ID identity.p12" --link
    ```

1. Install Cordova testing framework using the next command:

    ```bash
    cordova plugin add cordova-plugin-test-framework
    ```

1. For iOS platform:

    - Make sure the Apple Developer account you are using XCode with, has a registered wildcard bundle ID of: com.appliedrec.\*
    - Navigate to **platforms/ios** and open the **Podfile** in a text editor.
      Add `use_frameworks!` after `platform :ios, '11'` (In case the minimum version of ios required is 10.3 change `platform: ios, '10,3'`). Add the follow code after `pod 'Ver-ID', '~> 2.0.1'`

        ```ruby
        post_install do |installer|
            installer.pods_project.build_configurations.each do |config|
                config.build_settings['BUILD_LIBRARY_FOR_DISTRIBUTION'] = 'YES'
            end
            installer.pods_project.targets.each do |target|
                target.build_configurations.each do |config|
                    config.build_settings.delete 'BUILD_LIBRARY_FOR_DISTRIBUTION'
                end
            end
        end
        ```

        Close the file and run `pod install` to update the project.

    - Open Cordova app's iOS work space in Xcode.
    - For Codova iOS 6.X.X
        - The minium version of iOS required is **11**, [Read this for more information](https://cordova.apache.org/announcements/2020/06/01/cordova-ios-release-6.0.0.html)
        - Open platforms/ios/testingSample/CDVLaunchScreen.storyboard file with Xcode and change all the colors to default colors
        - Only the cordova10.0.0_sample support Cordova iOS 6
    - Ensure the project's deployment target is iOS 11 or newer.
    - In your Xcode project's build settings ensure `SWIFT_VERSION` is set to **Swift 5**.
    - Open your app's **Info.plist** file and and ensure it contains an entry for `NSCameraUsageDescription`.
    - Select the **testingSample** app target and under **Signing & Capabilities**. Clear the **Automatically manage signing** checkbox. Select your team and set the provisioning profile to a wildcard development profile you created on the [Apple Developer website](https://developer.apple.com/account/).

1. For the Android platform, this has been tested to work on Android Studio (AS) version 4.0 (with a workaround for Gradle), and with version 3.5.3. If working on version 4.0, follow these steps:

    - Open the folder for your project, allowing AS to perform the first attempt at a compilation run. This process will fail but our main purpose is to have the IDE generate the **platforms/android/gradle** directory and supporting gradle wrapper files. Once the directory has been created, please proceed to open up the file **platforms/android/gradle/gradle-wrapper.properties**. Look for the line that starts with **distributionUrl** and modify the gradle version to 4.10.3, so that it looks like:

    `distributionUrl=https\://services.gradle.org/distributions/gradle-4.10.3-all.zip`

    - Save the file, let the Gradle wrapper dependencies update, and your project should compile now.

1. If you are working on AS 3.5.3:

    - Open **platforms/android** with Android Studio version 3.5.3. Look for the [Android Studio 3.5.3 installer](https://developer.android.com/studio/archive) (if you don't have it installed yet), or the zip file for your platform if you already have a different version installed.

    - If an alert shows up requiring to sync gradle tap on the **OK** button.

        ![graddle sync](documentation/graddle_sync.png)

    - After that you may see the following error `ERROR: The minSdk version should not be declared in the android manifest file. You can move the version from the manifest to the defaultConfig in the build.gradle file.`,
    - **Solution:**

        - **Step 1:** Remove `<uses-sdk android:minSdkVersion="21" />` in android's root directory->app->src->main->AndroidManifest.xml.
        - **Step 2:** Remove `<uses-sdk android:minSdkVersion="19" />` in your android's root directory->CordovaLib->AndroidManifest.xml.

    - After removing those lines, go to the File menu of Android Studio and tap
      **Sync Project with Gradle Files**, once the process ends the app should
      be ready to run.

1. If you are working with AS 4.1.0 or superiors:

    - Edit your project's root directory->platform->android->build.gradle:

        - Under `project.ext {}`, change the `defaultBuildToolsVersion` to `30.0.1`, `defaultMinSdkVersion` to `30`, `defaultTargetSdkVersion` and `defaultCompileSdkVersion` to `30`. You can also try replacing these values with the latest version of the SDK. Mentioned values have been tested by us.

    - Open platforms/android with Android Studio 4.X.X and edit the autogenered file gradle/wrapper/gradle-wrapper.properties and entry following code:

    ```properties
    android.useAndroidX=true
    android.enableJetifier=true
    ```
