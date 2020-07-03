#!/usr/bin/env node

const regExpressions = {
  PASSWORD: new RegExp('--password=(.*)\\s--', 'gi'),
  CERTIFICATE: new RegExp('--certificate=(.*)\\b', 'gi'),
  RESOURCE: new RegExp('<resource-file.*target="(.*assets..*)" \/>', 'gi'),
  CONFIG: new RegExp('<veridConfig\\spassword="(.*)"\\/>', 'gi'),
  PROJECT_NAME: new RegExp('<name>(.*)</name>')
};

const PASSWORD_KEY = 'com.appliedrec.verid.password',
    ANDROID_LICENSE_PATH = 'app/src/main/assets/Ver-ID identity.p12',
    LICENSE_COPY_PATH = '/plugins/cordova-plugin-ver-id/scripts/Ver-ID identity.p12';

module.exports = function(context) {

    var fs = require('fs'),
      path = require('path'),
      platformRoot = path.join(context.opts.projectRoot, 'platforms/android'),
      manifestFile = path.join(platformRoot, 'app/src/main/AndroidManifest.xml'),
      configFile = path.join(context.opts.projectRoot, 'config.xml');
      
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
    updateManifest = (password) => {
      readFile(manifestFile).then((manifestData) => {
       
        if (manifestData.indexOf(PASSWORD_KEY) === -1) {
          
          var verIdMetaData = `<meta-data android:name="${PASSWORD_KEY}" android:value="${password}" />`,
          result = manifestData.replace('</application>', verIdMetaData + '\n\t</application>');
          writeFile(manifestFile, result);
        }
      }).catch((error) => {
        throw new Error(error);
      })
    },
    updateConfiguration = (licensePath, password) => {
      readFile(configFile).then((configData) => {
        const existResourceFile = regExpressions.RESOURCE.exec(configData),
          existPasswordConfig = regExpressions.CONFIG.exec(configData);
        
        if (!existResourceFile && !existPasswordConfig) {
          
          fs.copyFile(licensePath, context.opts.projectRoot + LICENSE_COPY_PATH, function(err) {
            if (err) throw err;
            var resource = `\t<resource-file src="${LICENSE_COPY_PATH}" target="${ANDROID_LICENSE_PATH}" />`,
            
            result = configData.replace('<platform name="android">', '<platform name="android">\n\t' + resource);
            if (configData.indexOf('veridConfig') === -1) {
              result = result.replace('</widget>', `\t<veridConfig password="${password}"/>` + '\n</widget>');
            }
            writeFile(configFile, result).then(() => {
              updateManifest(password);
            });
          });
        } else if (existPasswordConfig && !existResourceFile) {
          var resource = `\t<resource-file src="${LICENSE_COPY_PATH}" target="${ANDROID_LICENSE_PATH}" />`,
            result = configData.replace('<platform name="android">', '<platform name="android">\n\t' + resource);
            
            writeFile(configFile, result).then(() => {
              updateManifest(password);
            });
        } else if (existPasswordConfig && existResourceFile) {
          updateManifest(password);
        }
      }).catch((error) => {
        throw new Error(error);
      })
    }
    
    

    console.log('Running Android Hook');
    if (context.cmdLine) {
      const PasswordResult = regExpressions.PASSWORD.exec(context.cmdLine),
      CertificateResult = regExpressions.CERTIFICATE.exec(context.cmdLine);

      if (PasswordResult && PasswordResult.length >= 1 && CertificateResult && CertificateResult.length >= 1) {
        updateConfiguration(CertificateResult[1], PasswordResult[1]);
      } else {
        readFile(configFile).then((configData) => {
          if (configData) {
            const result = regExpressions.CONFIG.exec(configData);
            if (result && result.length === 2) {
              const password = result[1];
              updateManifest(password);
            } else {
              throw new Error('config.xml File doesn\'t have verid plugin configuration options');
            }
          }
        }).catch((error) => {
          throw new Error(error);
        }) 
      }
    }
  };