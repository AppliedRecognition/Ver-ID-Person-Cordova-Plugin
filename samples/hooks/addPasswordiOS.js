#!/usr/bin/env node

module.exports = function(context) {

    var fs = context.requireCordovaModule('fs'),
      path = context.requireCordovaModule('path');
  
    var platformRoot = path.join(context.opts.projectRoot, 'platforms/ios');
  
  
    var plistFile = path.join(platformRoot, 'testingSample/testingSample-Info.plist');
    
    console.log('Running iOS Hook to add Password to plist', plistFile);
    if (fs.existsSync(plistFile)) {
  
      fs.readFile(plistFile, 'utf8', function (err,data) {
        if (err) {
          throw new Error('Unable to find testingSample-Info.plist: ' + err);
        }
  
        var veridEntry = 'com.appliedrec.verid.password';
        if (data.indexOf(veridEntry) === -1) {
           
            const verIdPassword = '41475bf3-ca73-4579-b909-07228ed85b17',
            verIdMetaData = `<key>${veridEntry}</key>\n\t<string>${verIdPassword}</string>`;
            var result = data.replace('<dict>', '<dict>\n\t' + verIdMetaData);
  
            fs.writeFile(plistFile, result, 'utf8', function (err) {
                if (err) throw new Error('Unable to write into testingSample-Info.plist: ' + err);
            })
        }
      });
    }
  };