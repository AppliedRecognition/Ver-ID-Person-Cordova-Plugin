#!/usr/bin/env node

const regExpressions = {
    CERTIFICATE: new RegExp('--certificate=(.*)\\b', 'gi'),
    PROJECT_NAME: new RegExp('<name>(.*)</name>')
};
const ANDROID_LICENSE_PATH = 'app/src/main/assets/Ver-ID identity.p12',
    IOS_LICENSE_PATH = 'Ver-ID identity.p12';
    
module.exports = function(context) {

    var fs = context.requireCordovaModule('fs'),
      path = context.requireCordovaModule('path'),
      platformAndroidRoot = path.join(context.opts.projectRoot, 'platforms/android'),
      platformIOSRoot = path.join(context.opts.projectRoot, 'platforms/ios'),
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
      copyFile = (rootFilePath, newFilePath) => {
      if (fs.existsSync(rootFilePath) && !fs.existsSync(newFilePath)) {
        fs.copyFile(rootFilePath, newFilePath, (err) => {
          if (err) throw err;
        });
      }
    };

    const CertificateResult = regExpressions.CERTIFICATE.exec(context.cmdLine);

    if (CertificateResult && CertificateResult.length >= 1) {
      readFile(configFile).then((configData) => {
        projectName = regExpressions.PROJECT_NAME.exec(configData);

        copyFile(CertificateResult[1], path.join(platformIOSRoot,`${projectName[1]}/Resources/${IOS_LICENSE_PATH}`));
        copyFile(CertificateResult[1], path.join(platformAndroidRoot, ANDROID_LICENSE_PATH));
      })
    }
  };