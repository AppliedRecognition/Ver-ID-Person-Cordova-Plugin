#!/usr/bin/env node

const ANDROID_LICENSE_PATH = 'app/src/main/assets/Ver-ID identity.p12',
    IOS_LICENSE_PATH = 'Ver-ID identity.p12',
    PASSWORD_KEY = 'com.appliedrec.verid.password';

const regExpressions = {
    PASSWORD: new RegExp('--password=(.*)\\s--', 'gi'),
    CERTIFICATE: new RegExp('--certificate=(.*)\\b', 'gi'),
    RESOURCE: new RegExp('<resource-file.* target="(.*Ver-ID identity.p12)" \/>' , 'gi'),
    CONFIG: new RegExp('<veridConfig\\spassword="(.*)"\\/>', 'gi'),
    PROJECT_NAME: new RegExp('<name>(.*)</name>'),
    IOS_PLIST: new RegExp('<key>.*(verid).*\\n\\s*<string>(.*)<\\/string>', 'gi'),
    ANDROID_MANIFEST: new RegExp(`<meta-data android:name="${PASSWORD_KEY}" android:value="(.*)" \/>`, 'gi'),
    EMPTY_SPACES: new RegExp('^\\s*\\n', 'gm')
};



module.exports = function(context) {

    var fs = require('fs'),
      path = require('path'),
      platformAndroidRoot = path.join(context.opts.projectRoot, 'platforms/android'),
      platformIOSRoot = path.join(context.opts.projectRoot, 'platforms/ios'),
      manifestFile = path.join(platformAndroidRoot, 'app/src/main/AndroidManifest.xml'),
      configFile = path.join(context.opts.projectRoot, 'config.xml')
      
    const readFile = (file) => {
      return new Promise((resolve, reject) => {
        if (fs.existsSync(file)) {
  
          fs.readFile(file, 'utf8', function (err, data) {
            if (err) {
              reject('Error reading file: ', file);
            }
            resolve(data);
          });
        } else {
          reject('Error, file not found!, file:', file);
        }
      });
    },
    writeFile = (file, newData) => {
      return new Promise((resolve, reject) => {
        fs.writeFile(file, newData, 'utf8', function (err) {
          if (err)
            throw new Error('Error writing file on disk, file:', file);
          resolve();
        })
      });
    },
    updateManifest = () => {
      readFile(manifestFile).then((manifestData) => {
        var veridEntry = 'com.appliedrec.verid.password';
        if (manifestData.indexOf(veridEntry) !== -1) {
          result = manifestData.replace(regExpressions.ANDROID_MANIFEST, '');
          result = result.replace(regExpressions.EMPTY_SPACES, '');
          writeFile(manifestFile, result);
        }
      }).catch((error) => {
        console.error(error);
      })
    },
    updatePlist = (projectName) => {
      var plistFile = path.join(platformIOSRoot, `${projectName}/${projectName}-Info.plist`);
      readFile(plistFile).then((plistData) => {
        var veridEntry = 'com.appliedrec.verid.password';
        if (plistData.indexOf(veridEntry) !== -1) {
          result = plistData.replace(regExpressions.IOS_PLIST, '');
          result = result.replace(regExpressions.EMPTY_SPACES, '');
          writeFile(plistFile, result);
        }
      }).catch((error) => {
        console.error(error);
      })
    },
    removeFile = (file) => {
      if (fs.existsSync(file)) {
        fs.unlink(file, (err) => {
          if (err) throw err;
        });
      }
    },
    updateConfiguration = () => {
      readFile(configFile).then((configData) => {
        const projectName = regExpressions.PROJECT_NAME.exec(configData);
        
        var result = configData.replace(regExpressions.RESOURCE, '');
        result = result.replace(regExpressions.CONFIG, '');
        result = result.replace(regExpressions.EMPTY_SPACES, '');

        writeFile(configFile, result).then(() => {
              if (fs.existsSync(platformAndroidRoot)) {
                updateManifest();
              }

              if (fs.existsSync(platformIOSRoot)) {
                updatePlist(projectName[1]);
              }
        });
        removeFile(path.join(platformIOSRoot,`${projectName[1]}/Resources/${IOS_LICENSE_PATH}`));
        removeFile(path.join(platformAndroidRoot, ANDROID_LICENSE_PATH));
      
      }).catch((error) => {
        throw new Error(error);
      })
    };
    console.log('Removing verid plugin configurations')
    updateConfiguration();
  };