#!/usr/bin/env node

const regExpressions = {
  CERTIFICATE: new RegExp('--certificate=(.*)\\b', 'gi'),
  PROJECT_NAME: new RegExp('<name>(.*)</name>')
};
const ANDROID_LICENSE_PATH = 'app/src/main/assets',
  FILE_NAME = 'Ver-ID identity.p12';
  
module.exports = function(context) {

  var fs = require('fs'),
    path = require('path'),
    platformAndroidRoot = path.join(context.opts.projectRoot, 'platforms/android'),
    platformIOSRoot = path.join(context.opts.projectRoot, 'platforms/ios'),
    configFile = path.join(context.opts.projectRoot, 'config.xml');
    
  const DEFAULT_PATH = path.join(context.opts.projectRoot, 'plugins/cordova-plugin-ver-id/scripts'),
      readFile = (file) => {
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
      copyFile = (rootPath, newPath) => {
          var rootfilePath = rootPath,
              newFilePath = path.join(newPath, FILE_NAME);
          console.log('Starting copy operation');
          if (fs.existsSync(rootfilePath) && !fs.existsSync(newFilePath)) {
            if (!fs.existsSync(newPath)) {
              console.log('Creating path before copying: ' + newPath);
              fs.mkdirSync(newPath);
              if (fs.existsSync(newPath)) {
                fs.copyFile(rootfilePath, newFilePath, (err) => {
                  if (err) {
                    console.error(err);
                  } else {
                    console.log('Copy operation successful.');
                  }
                });
              }
            } else {
              console.log('Path exists, copying file.');
              fs.copyFile(rootfilePath, newFilePath, (err) => {
                  if (err) {
                    console.error(err);
                  } else {
                    console.log('Copy operation successful.');
                  }              
              });
            }
          }
    },
    startCopyOfLicenseFile = (CertificatePath) => {
      readFile(configFile).then((configData) => {
        projectName = regExpressions.PROJECT_NAME.exec(configData);
        setTimeout(function() {
          if (fs.existsSync(platformIOSRoot)) {
            console.log('Copying certificate to ios platform.');
            copyFile(CertificatePath, path.join(platformIOSRoot,`${projectName[1]}/Resources`));
          }
          if (fs.existsSync(platformAndroidRoot)) {
            console.log('Copying certificate to android platform');
            copyFile(CertificatePath, path.join(platformAndroidRoot, ANDROID_LICENSE_PATH));
          }
        }, 1000);
      })
    }

  const CertificateResult = regExpressions.CERTIFICATE.exec(context.cmdLine);
  console.log('Start copying files');
  if (CertificateResult && CertificateResult.length >= 1) {
    startCopyOfLicenseFile(CertificateResult[1]);
  } else {
    startCopyOfLicenseFile(path.join(DEFAULT_PATH, FILE_NAME));
  }
};