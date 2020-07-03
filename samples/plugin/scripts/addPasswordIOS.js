#!/usr/bin/env node

const regExpressions = {
  PASSWORD: new RegExp('--password=(.*)\\s--', 'gi'),
  CERTIFICATE: new RegExp('--certificate=(.*)\\b', 'gi'),
  RESOURCE: new RegExp('<platform name="ios">\\n\\s*<resource-file.*target="Ver-ID identity.p12" \/>', 'gi'),
  CONFIG: new RegExp('<veridConfig\\spassword="(.*)"\\/>', 'gi'),
  PROJECT_NAME: new RegExp('<name>(.*)</name>')
};

const PASSWORD_KEY = 'com.appliedrec.verid.password',
    IOS_LICENSE_PATH = 'Ver-ID identity.p12',
    LICENSE_COPY_PATH = '/plugins/cordova-plugin-ver-id/scripts/Ver-ID identity.p12';

module.exports = function(context) {

  var fs = require('fs'),
    path = require('path'),
    platformRoot = path.join(context.opts.projectRoot, 'platforms/ios'),
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
  updatePlist = (projectName, password) => {
    const plistFile = path.join(platformRoot, `${projectName}/${projectName}-Info.plist`);
    readFile(plistFile).then((plistData) => {
      if (plistData.indexOf(PASSWORD_KEY) === -1) {
        const verIdKeyData = `<key>${PASSWORD_KEY}</key>\n\t<string>${password}</string>`;
        var result = plistData.replace('<dict>', '<dict>\n\t' + verIdKeyData);

        writeFile(plistFile, result);
      }
    }).catch((error) => {
      throw new Error(error);
    })
  },
  updateConfiguration = (licensePath, password) => {
    readFile(configFile).then((configData) => {
      const existResourceFile = regExpressions.RESOURCE.exec(configData),
        existPasswordConfig = regExpressions.CONFIG.exec(configData),
        projectName = regExpressions.PROJECT_NAME.exec(configData);
      
      if (!existResourceFile && !existPasswordConfig) {
    
        fs.copyFile(licensePath, context.opts.projectRoot + LICENSE_COPY_PATH, function(err) {
          if (err) throw err;
          var resource = `\t<resource-file src="${LICENSE_COPY_PATH}" target="${IOS_LICENSE_PATH}" />`,
          
          result = configData.replace('<platform name="ios">', '<platform name="ios">\n\t' + resource);
          if (configData.indexOf('veridConfig') === -1) {
            result = result.replace('</widget>', `\t<veridConfig password="${password}"/>` + '\n</widget>');
          }
          
          writeFile(configFile, result).then(() => {
            updatePlist(projectName[1], password);
          });
        });
      } else if (existPasswordConfig && !existResourceFile) {
        var resource = `\t<resource-file src="${LICENSE_COPY_PATH}" target="${IOS_LICENSE_PATH}" />`,
          result = configData.replace('<platform name="ios">', '<platform name="ios">\n\t' + resource);
          
          writeFile(configFile, result).then(() => {
            updatePlist(projectName[1], password);
          });
      } else if (existPasswordConfig && existResourceFile) {
        updatePlist(projectName[1], password);
      }
    }).catch((error) => {
      throw new Error(error);
    })
  }
  
  

  console.log('Running IOS Hook');
  if (context.cmdLine) {
    const PasswordResult = regExpressions.PASSWORD.exec(context.cmdLine),
        CertificateResult = regExpressions.CERTIFICATE.exec(context.cmdLine);

    if (PasswordResult && PasswordResult.length >= 1 && CertificateResult && CertificateResult.length >= 1) {
      updateConfiguration(CertificateResult[1], PasswordResult[1]);
    } else {
      readFile(configFile).then((configData) => {
        if (configData) {
          result = regExpressions.CONFIG.exec(configData);

          if (result && result.length === 2) {
            const password = result[1],
              projectName = regExpressions.PROJECT_NAME.exec(configData);
            
            updatePlist(projectName[1], password);
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