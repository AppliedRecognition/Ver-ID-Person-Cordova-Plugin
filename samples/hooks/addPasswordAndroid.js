#!/usr/bin/env node

module.exports = function(context) {

    var fs = context.requireCordovaModule('fs'),
      path = context.requireCordovaModule('path');
  
    var platformRoot = path.join(context.opts.projectRoot, 'platforms/android');
  
  
    var manifestFile = path.join(platformRoot, 'app/src/main/AndroidManifest.xml');
    
    console.log('Running Android Hook to add Password to manifest', manifestFile);
    if (fs.existsSync(manifestFile)) {
  
      fs.readFile(manifestFile, 'utf8', function (err,data) {
        if (err) {
          throw new Error('Unable to find AndroidManifest.xml: ' + err);
        }
  
        var veridEntry = 'com.appliedrec.verid.password';
        if (data.indexOf(veridEntry) === -1) {
            console.log('Adding metadata to application context');
            const verIdPassword = '41475bf3-ca73-4579-b909-07228ed85b17',
            verIdMetaData = `<meta-data android:name="${veridEntry}" android:value="${verIdPassword}" />`;
            
            var result = data.replace('</application>', verIdMetaData + '\n\t</application>');
  
            fs.writeFile(manifestFile, result, 'utf8', function (err) {
                if (err) throw new Error('Unable to write into AndroidManifest.xml: ' + err);
            })
        }
      });
    }
  };