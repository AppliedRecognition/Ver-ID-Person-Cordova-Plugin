const USER_ID = 'TESTING_USER_ID';
/**
 * Auto tests will run automatically and will check that
 * all is working as expected
 */
exports.defineAutoTests = function () {
    describe('Ver Id plugin (window.verid)', function () {
        it('1. should exist', function () {
            expect(window.verid).toBeDefined();
        });

        it('2. window.verid should contain the following functions: load, unload, AuthenticationSessionSettings' +
        'DetectedFace, Error, Face, FaceComparisonResult, FaceTemplate, LivenessDetectionSessionSettings' + 
        'RegistrationSessionSettings, SessionResult, VerIDSessionSettings' , function () {
            expect(window.verid.load).toBeDefined();
            expect(typeof window.verid.load).toBe('function');
            expect(typeof window.verid.unload).toBe('function');
            expect(typeof window.verid.AuthenticationSessionSettings).toBe('function');
            expect(typeof window.verid.DetectedFace).toBe('function');
            expect(typeof window.verid.Error).toBe('function');
            expect(typeof window.verid.Face).toBe('function');
            expect(typeof window.verid.FaceComparisonResult).toBe('function');
            expect(typeof window.verid.FaceTemplate).toBe('function');
            expect(typeof window.verid.LivenessDetectionSessionSettings).toBe('function');
            expect(typeof window.verid.RegistrationSessionSettings).toBe('function');
            expect(typeof window.verid.SessionResult).toBe('function');
            expect(typeof window.verid.VerIDSessionSettings).toBe('function');
        });
    });
    describe('Ver Id plugin, testing of load and unload functions', function () {

        it('3. load then function should return an object with the following functions =' +
        'authenticate, captureLiveFace, compareFaces, deleteRegisteredUser, detectFaceInImage, getRegisteredUsers, register', function (done) {
            window.verid.load().then(instance => {
                expect(typeof instance).toBe('object');
                expect(typeof instance.authenticate).toBe('function');
                expect(typeof instance.captureLiveFace).toBe('function');
                expect(typeof instance.compareFaces).toBe('function');
                expect(typeof instance.deleteRegisteredUser).toBe('function');
                expect(typeof instance.detectFaceInImage).toBe('function');
                expect(typeof instance.getRegisteredUsers).toBe('function');
                expect(typeof instance.register).toBe('function');
            }).catch((error) => {
                //force test to fail
                console.error('Error on test #3:', error);
                expect('AUTHENTICATION FAILED OR ERROR FOUND').toBe(false);
            }).finally(() => {
                window.verid.unload()
                done();
            });
        });

        it('4. instance exist If unload not called', function (done) {
            window.verid.load().then(instance => {
                return verid.load()
            }).then(instance => {
                //instance should exist if unload was no called
                expect(typeof instance).toBe('object');
            }).catch((error) => {
                //force test to fail
                console.error('Error on test #4:', error);
                expect('AUTHENTICATION FAILED OR ERROR FOUND').toBe(false);
            }).finally(() => {
                window.verid.unload()
                done();
            });
        });


        it('5. unload should return a promise', function (done) {
            window.verid.load().then(instance => {
                return window.verid.unload()
            }).then(resp => {
                expect(resp).toBeDefined();
                expect(typeof resp).toBe('string');
            }).catch((error) => {
                //force test to fail
                console.error('Error on test #5:', error);
                expect('AUTHENTICATION FAILED OR ERROR FOUND').toBe(false);
            }).finally(() => {
                done();
            });
        });

    });
    describe('Ver Id plugin, testing of settings', function () {
        it('6. test LivenessDetectionSessionSettings', function () {
            var settings = new verid.LivenessDetectionSessionSettings();
            expect(typeof settings).toBe('object');
            expect(settings.bearings).toBeDefined();
            expect(Array.isArray(settings.bearings)).toBe(true);
            expect(settings.bearings.length).toBe(5);
            expect(settings.expiryTime).toBeDefined();
            expect(settings.expiryTime).toBe(30);
            expect(settings.numberOfResultsToCollect).toBeDefined();
            expect(settings.numberOfResultsToCollect).toBe(2);
            expect(settings.showResult).toBeDefined();
            expect(settings.showResult).toBe(false);
        });
        it('7. test AuthenticationSessionSettings', function () {
            var settings = new verid.AuthenticationSessionSettings(USER_ID);
            expect(typeof settings).toBe('object');
            expect(settings.bearings).toBeDefined();
            expect(Array.isArray(settings.bearings)).toBe(true);
            expect(settings.bearings.length).toBe(5);
            expect(settings.expiryTime).toBeDefined();
            expect(settings.expiryTime).toBe(30);
            expect(settings.numberOfResultsToCollect).toBeDefined();
            expect(settings.numberOfResultsToCollect).toBe(2);
            expect(settings.showResult).toBeDefined();
            expect(settings.showResult).toBe(false);
            expect(settings.userId).toBeDefined();
            expect(settings.userId).toBe(USER_ID);
        });
        it('8. test RegistrationSessionSettings', function () {
            var settings = new verid.RegistrationSessionSettings(USER_ID);
            expect(typeof settings).toBe('object');
            expect(settings.bearingsToRegister).toBeDefined();
            expect(Array.isArray(settings.bearingsToRegister)).toBe(true);
            expect(settings.bearingsToRegister.length).toBe(3);
            expect(settings.expiryTime).toBeDefined();
            expect(settings.expiryTime).toBe(30);
            expect(settings.numberOfResultsToCollect).toBeDefined();
            expect(settings.numberOfResultsToCollect).toBe(1);
            expect(settings.showResult).toBeDefined();
            expect(settings.showResult).toBe(false);
            expect(settings.userId).toBeDefined();
            expect(settings.userId).toBe(USER_ID);
        });

        it('9. test VerIDSessionSettings', function () {
            var settings = new verid.VerIDSessionSettings(USER_ID);
            expect(typeof settings).toBe('object');
            expect(settings.expiryTime).toBeDefined();
            expect(settings.expiryTime).toBe(30);
            expect(settings.numberOfResultsToCollect).toBeDefined();
            expect(settings.numberOfResultsToCollect).toBe(2);
            expect(settings.showResult).toBeDefined();
            expect(settings.showResult).toBe(false);
        });
    });
    describe('Ver Id plugin, testing of detectFaceInImage', function () {
        it('10. test detectFaceInImage with image that has a face', function (done) {
            var image = new Image();
            image.onload = function() {
                var canvas = document.createElement('canvas');
                canvas.width = image.width;
                canvas.height = image.height;
                var ctx = canvas.getContext('2d');
                ctx.drawImage(image, 0, 0);
                var dataUri = canvas.toDataURL('image/jpeg', 0.95);
                verid.load().then(verIDInstance => {
                    return verIDInstance.detectFaceInImage(dataUri);
                }).then(face => {
                    expect(face).toBeDefined();
                    expect(typeof face).toBe('object')
                    expect(typeof face.data).toBe('string')
                    expect(typeof face.faceTemplate).toBe('object')
                    expect(typeof face.height).toBe('number')
                    expect(Array.isArray(face.leftEye)).toBe(true)
                    expect(Array.isArray(face.rightEye)).toBe(true)
                    expect(typeof face.pitch).toBe('number')
                    expect(typeof face.roll).toBe('number')
                    expect(typeof face.width).toBe('number')
                    expect(typeof face.x).toBe('number')
                    expect(typeof face.y).toBe('number')
                    expect(typeof face.yaw).toBe('number')
                }).catch((error) => {
                    //force test to fail
                    console.error('Error on test #10:', error);
                    expect('AUTHENTICATION FAILED OR ERROR FOUND').toBe(false);
                }).finally(() => {
                    window.verid.unload()
                    done();
                })
            }
            image.src = '../plugins/cordova-plugin-ver-id/tests/assets/test-photo.jpg';
        });
        it('11. test detectFaceInImage with image that does not have a face', function (done) {
            var image = new Image();
            image.onload = function() {
                var canvas = document.createElement('canvas');
                canvas.width = image.width;
                canvas.height = image.height;
                var ctx = canvas.getContext('2d');
                ctx.drawImage(image, 0, 0);
                var dataUri = canvas.toDataURL('image/jpeg', 0.95);
                verid.load().then(verIDInstance => {
                    return verIDInstance.detectFaceInImage(dataUri);
                }).catch(error => {
                    //Not face detected or Error found
                    console.log('Error expected on test #11:', error);
                    expect(error).toBeDefined()
                }).finally(() => {
                    window.verid.unload()
                    done();
                })
            }
            image.src = '../plugins/cordova-plugin-ver-id/tests/assets/test-empty.jpg';
        });
    });
    describe('Ver Id plugin, testing of compareFaces', function () {
        it('12. test compareFaces with face from image and mockup', function (done) {
            var image = new Image();
            var instance = null;
            image.onload = function() {
                var canvas = document.createElement('canvas');
                canvas.width = image.width;
                canvas.height = image.height;
                var ctx = canvas.getContext('2d');
                ctx.drawImage(image, 0, 0);
                var dataUri = canvas.toDataURL('image/jpeg', 0.95);
                verid.load().then(verIDInstance => {
                    instance = verIDInstance;
                    return verIDInstance.detectFaceInImage(dataUri);
                }).then(face => {
                    return instance.compareFaces(face, JSON.parse(FACE_MOCK));
                }).then((result) => {
                    expect(result).toBeDefined();
                    expect(typeof result.score).toBe('number');
                    expect(typeof result.authenticationThreshold).toBe('number');
                    expect(typeof result.max).toBe('number');
                }).catch((error) => {
                    //force test to fail
                    console.error('Error on test #12:', error);
                    expect('AUTHENTICATION FAILED OR ERROR FOUND').toBe(false);
                }).finally(() => {
                    window.verid.unload()
                    done();
                })
            }
            image.src = '../plugins/cordova-plugin-ver-id/tests/assets/test-photo.jpg';
        });
    });
    describe('Ver Id plugin, testing of deleteRegisterUser', function () {
        it('13. test deleteRegisterUser without param value', function (done) {
            window.verid.load().then(instance => {
                return instance.deleteRegisteredUser()
            }).catch(error => {
                //deleteRegister fail case
                console.log('Error expected on test #13:', error);
                expect(error).toBeDefined();
                expect(typeof error).toBe('string');
            }).finally(() => {
                verid.unload();
                done();
            });
        });
        it('14. test deleteRegisterUser with null param value', function (done) {
            window.verid.load().then(instance => {
                return instance.deleteRegisteredUser(null)
            }).catch(error => {
                //deleteRegister fail case
                console.log('Error expected on test #14:', error);
                expect(error).toBeDefined();
                expect(typeof error).toBe('string');
            }).finally(() => {
                verid.unload();
                done();
            });
        });
        it('15. test deleteRegisterUser with some param value', function (done) {
            window.verid.load().then(instance => {
                return instance.deleteRegisteredUser('test')
            }).then(resp => {
                expect(typeof resp).toBe('string');
            }).catch((error) => {
                //force test to fail
                console.error('Error on test #15:', error);
                expect('AUTHENTICATION FAILED OR ERROR FOUND').toBe(false);
            }).finally(() => {
                verid.unload();
                done();
            });
        });
    });
    
    describe('Ver Id plugin, testing of register using mocks', function () {
        it('16. test register user', function (done) {
            var instance = null;
            window.verid.setTestingMode(true).then(() => {
                window.verid.load().then(verIDInstance => {
                    instance = verIDInstance;
                    return verIDInstance.register();
                }).then(response => {
                    expect(response).toBeDefined()
                    expect(Array.isArray(response.attachments)).toBe(true)
                    expect(response.attachments.length).toBe(1)
                    expect(typeof response.attachments[0].recognizableFace).toBe('object')
                    expect(typeof response.attachments[0].bearing).toBe('string')
                    expect(typeof response.attachments[0].image).toBe('string')
                }).catch((error) => {
                    //force test to fail
                    console.error('Error on test #16:', error);
                    expect('AUTHENTICATION FAILED OR ERROR FOUND').toBe(false);
                }).finally(() => {
                    window.verid.unload()
                    window.verid.setTestingMode(false)
                    done();
                })
            });
        });
    });
    describe('Ver Id plugin, testing of authenticate using mocks', function () {
        it('17. test authenticate user', function (done) {
            window.verid.setTestingMode(true).then(() => {
                window.verid.load().then(verIDInstance => {
                    instance = verIDInstance;
                    return verIDInstance.authenticate(new verid.AuthenticationSessionSettings(USER_ID));
                }).then(response => {
                    expect(response).toBeDefined()
                    expect(Array.isArray(response.attachments)).toBe(true)
                    expect(response.attachments.length).toBe(1)
                    expect(typeof response.attachments[0].recognizableFace).toBe('object')
                    expect(typeof response.attachments[0].bearing).toBe('string')
                    expect(typeof response.attachments[0].image).toBe('string')
                }).catch((error) => {
                    //force test to fail
                    console.error('Error on test #17:', error);
                    expect('AUTHENTICATION FAILED OR ERROR FOUND').toBe(false);
                }).finally(() => {
                    window.verid.unload()
                    window.verid.setTestingMode(false)
                    done();
                })
            });
        });
    });
    describe('Ver Id plugin, testing of captureLiveFace using mocks', function () {
        it('18. test captureLiveFace', function (done) {
            window.verid.setTestingMode(true).then(() => {
                window.verid.load().then(verIDInstance => {
                    instance = verIDInstance;
                    return verIDInstance.captureLiveFace(new verid.LivenessDetectionSessionSettings());
                }).then(response => {
                    expect(response).toBeDefined()
                    expect(Array.isArray(response.attachments)).toBe(true)
                    expect(response.attachments.length).toBe(1)
                    expect(typeof response.attachments[0].recognizableFace).toBe('object')
                    expect(typeof response.attachments[0].bearing).toBe('string')
                    expect(typeof response.attachments[0].image).toBe('string')
                }).catch((error) => {
                    //force test to fail
                    console.error('Error on test #18:', error);
                    expect('AUTHENTICATION FAILED OR ERROR FOUND').toBe(false);
                }).finally(() => {
                    window.verid.unload()
                    window.verid.setTestingMode(false)
                    done();
                })
            });
        });
    });
    describe('Ver Id plugin, testing of getRegisteredUsers', function () {
        it('19. test getRegisteredUsers without testing mode', function (done) {
            window.verid.load().then(instance => {
                return instance.getRegisteredUsers()
            }).then(users => {
                expect(users).toBeDefined();
                expect(Array.isArray(users)).toBe(true);
                expect(users.length).toBe(0);
            }).catch((error) => {
                //force test to fail
                console.error('Error on test #19:', error);
                expect('AUTHENTICATION FAILED OR ERROR FOUND').toBe(false);
            }).finally(() => {
                verid.unload();
                done();
            });
        });
        it('20. test getRegisteredUsers without testing mode on', function (done) {
            window.verid.setTestingMode(true).then(() => {
                return window.verid.load();
            }).then(instance => {
                return instance.getRegisteredUsers();
            }).then(users => {
                expect(Array.isArray(users)).toBe(true);
                expect(users.length).toBe(3);
            }).catch((error) => {
                //force test to fail
                console.error('Error on test #20:', error);
                expect('AUTHENTICATION FAILED OR ERROR FOUND').toBe(false);
            }).finally(() => {
                verid.setTestingMode(false)
                verid.unload();
                done();
            });
        });
    });
};
/**
 * Manual tests requires user interaction to work
 * This contains testing functions that require the camera
 */
exports.defineManualTests = function(contentEl, createActionButton) {

    registerUser = (instance, showResult) => {
        var settings = new verid.RegistrationSessionSettings(USER_ID);
        settings.showResult = showResult ? showResult : false;
        return instance.register(settings).then(response => {
            if (!response) {
                alert('Registration Canceled');
                return;
            }
            if (!response.error) {
                 alert('Registration Completed!');
            } else {
                console.error('Error on registration', response);
                return response;
            }
        }).catch(error => {
            alert('Error Encountered!');
            console.error('General Error:', error);
        });
    }

    captureLiveFace = (verIDInstance, singlePose) => {
        var settings = new verid.LivenessDetectionSessionSettings();

        if (singlePose) {
            settings.numberOfResultsToCollect = 1;
            settings.bearings = [verid.Bearing.STRAIGHT];
        }

        return verIDInstance.captureLiveFace(settings)
            .then(response => {
                if (!response) {
                    alert('session canceled!');
                } else if (!response.error) {
                    if (response.attachments.length > 0) {
                        let faces = response.attachments.filter(attachment => {
                            return attachment.bearing == verid.Bearing.STRAIGHT && attachment.recognizableFace.faceTemplate;
                        }).map(attachment => {
                            return attachment.recognizableFace;
                        });

                        return faces;
                        
                    } else {
                        alert('Error retrieving the faces!')
                        return;
                    }
                } else {
                    alert('session Failed!');
                }
            }).catch(error => {
                alert('Error Encountered!');
                console.error('General Error:', error);
            });
    }

    compareFaces = (verIDInstance, face1, face2) => {
        return verIDInstance.compareFaces(face1, face2)
        .then(result => {
            if (!result) {
                alert('session canceled!');
                return
            }
            alert('result Obtained!');
            console.log(result);
            return result;
        }).catch(error => {
            alert('Error Encountered!');
            console.error('General Error:', error);
        });
    }

    detectFaceInImage = (verIDInstance) => {
        return new Promise((resolve, reject) => {
            var image = new Image();
            image.onload = function() {
                var canvas = document.createElement('canvas');
                canvas.width = image.width;
                canvas.height = image.height;
                var ctx = canvas.getContext('2d');
                ctx.drawImage(image, 0, 0);
                var dataUri = canvas.toDataURL('image/jpeg', 0.95);
                return verIDInstance.detectFaceInImage(dataUri)
                    .then(face => {
                        if (!face) {
                            alert('Error Retrieving face!')
                            resolve();
                            return;
                        }
                        resolve(face)
                    }).catch(error => {
                        reject(error);
                    })
            }
            image.src = '../plugins/cordova-plugin-ver-id/tests/assets/test-photo.jpg';
        });
        
    }

    createActionButton('Register user', function() {
        let verIDInstance = null;
        verid.load().then(instance => {
            verIDInstance = instance;
            return registerUser(instance);
        }).then(() => {
            verIDInstance.deleteRegisteredUser(USER_ID);
        })
        
    });
    
    createActionButton('Register user Show result', function() {
        let verIDInstance = null;
        verid.load().then(instance => {
            verIDInstance = instance;
            return registerUser(instance, true);
        }).then(() => {
            verIDInstance.deleteRegisteredUser(USER_ID);
        })
    });

    createActionButton('Register user and Authenticate', function() {
        let verIDInstance = null;

        verid.load().then(instance => {
            verIDInstance = instance;
            return registerUser(instance);
        }).then(() => {
            if (confirm('Registration completed, continue with authentication?')) {
                var settings = new verid.AuthenticationSessionSettings(USER_ID);
                return verIDInstance.authenticate(settings);
            } else {
                return;
            }
        }).then((response) => {
            verIDInstance.deleteRegisteredUser(USER_ID);
            if (!response) {
                alert('session canceled!');
                return;
            } else if (!response.error) {
                alert('authenticated!');
            } else {
                alert('session failed!', response);
            }
        }).catch(error => {
            alert('Error Encountered!');
            console.error('General Error:', error);
        });
    });

    createActionButton('Capture Live Face and compare', function() {
        let verIDInstance = null;
        let faces = null;
        verid.load().then(instance => {
            verIDInstance = instance;
            return captureLiveFace(instance);
        }).then(facesResult => {
            if (!facesResult) {
                alert('session canceled!');
                return;
            }

            faces = facesResult
            if (confirm('Faces captured!, continue with single pose face capturing? ')) {
                return captureLiveFace(verIDInstance, true);
            }
        }).then(facesResult => {
            if (!facesResult) {
                alert('session canceled!');
                return
            }
        
            if (confirm('Faces captured!, continue with faces comparison? ')) {
                let face1 = faces[0];
                let face2 = facesResult[0];
                return compareFaces(verIDInstance, face1, face2);
            }
        }).catch(error => {
            alert('Error Encountered!');
            console.error('General Error:', error);
        });
    });

    createActionButton('Detect Face in Sample Image and compare', function() {
        let verIDInstance = null;
        let faces = null;
        verid.load().then(instance => {
            verIDInstance = instance;
            return captureLiveFace(instance);
        }).then(facesResult => {
            if (!facesResult) {
                alert('session canceled!');
                return;
            }

            faces = facesResult
            if (confirm('Faces captured!, continue comparing with face in Image? ')) {
                return detectFaceInImage(verIDInstance);
            }
        }).then(facesResult => {
            if (!facesResult) {
                alert('session canceled!');
                return
            }
        
            if (confirm('Faces captured!, continue with faces comparison? ')) {
                let face1 = faces[0];
                let face2 = facesResult;
                return compareFaces(verIDInstance, face1, face2);
            }
        }).catch(error => {
            alert('Error Encountered!');
            console.error('General Error:', error);
        });
    });
};

//mocks
const FACE_MOCK = `{"x":-8.384888,"y":143.6514,"width":331.54974,"height":414.43723,"yaw":-0.07131743,
"pitch":-6.6307373,"roll":-2.5829313,"quality":9.658932,
"data":"eJw9k9tSE0EQhlnzbyAcFFA5BLVUToKAlJIEDYEgEgQRSizwRtBCQITlBhGqUNDt3ofycXwUZ3q72Zv/29me7p7pf3Nh0NgUZL6E1b46ecLdKBcGYfXDv/S1+v2vrh/L+sG4re+nEB3l4lzgvuE+aMlrH+jQ6zC4xesz8KjXCviN1xXwV6874EuvcR2SJoFeJLIjXkBSL7ANPhM4A296oCy4KtAKfiBwG1wn0AFKYzpBUx5GQINei6CbXt+CJO0+KNTK1CwwCkpbqIEyAp8NTkHSFGVAD2WlC/RYoBs0I5AHrRnsebjUnuJmcJqmB5wVGALLdcUl0IWHJe12AzThdRf01OsPUFnfpco6SE4el0ElgWXQmMBHA3eyoq2ULeaFhwgseqHTiG+AB6yzIYEBcL92xiM6B34uUATPWcyCnpRfC1zXFZf4lddT2+MKFATuGAwaTFtMP3jC0hUsXSFzkm3Zib5tFyeDxsB5rffdpz/Oa9fkNsLqySOxHiTe3cps1iw4DFpUFQuOqQWLeuhZ8LJa8CC1YCLT+YXklmS7i6RLYMZWtpCE6gOOxAf14FWBdvATgW4tQ/dABwY1D27GWph6dIZtXo9UY2eqtOC4S6N3Tq3qfYVzjaEG0IjZrGSwalbcMxBX/Qa3mQM7bM55AfdjdgpMgts9rIJkus40Fa+H6sifoJf6Pq/fF3R+NCuwYjbbNIjs05ZegY+R3cfgRf3rOP1tWs0GrrUpc8iV4aYF5s1nBfCaWXDdPLNhntmwzO89nNsmV6FmHqxZhRQqFjNg3s6rg71z5xquLPgfqNHOQQ==",
"leftEye":[101,322.5],"rightEye":[213,321],
"faceTemplate":{"data":"CgsBC3Byb3RvDIIZEAAQAYAAAADbVnE4MyxI5lzywn/QXvhlzw8uyEk5t9DV6rm/FHAn3QqwReZYPOTIRwXHyEvntT4ZESlP0bLo15RKJaUj6zQNvbC1vTzeuTUNMFYD5FZNZdAYzTbSSsrRIOU64dPmW8ry1NbFSttOZxSiGMsv4Uo2QUdHwEDHRDwk5Lh44DQ/I7sVhRAJdXVpZAwhzzrlPEqHJyE9fy6LEDdTsQE=","version":1}}`;
