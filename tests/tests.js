const API_KEY = 'INSERT_API_KEY_HERE'
const USER_ID = 'TESTING_USER_ID';
exports.defineAutoTests = function () {
    describe('Ver Id plugin (window.verid)', function () {
        it('should exist', function () {
            expect(window.verid).toBeDefined();
        });

        it('window.verid should contain the following functions: load, unload, AuthenticationSessionSettings' +
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
        it('load function with invalid API parameter should fail', function (done) {
            expect(window.verid.load).toBeDefined();
            window.verid.load('undefined').catch(err => {
                expect(typeof err).toBe('string');
                expect(err).toBe('java.lang.Exception: Authentication failed');
                done();
            });
        });

        it('load function with NULL parameter should fail', function (done) {
            expect(window.verid.load).toBeDefined();
            window.verid.load(null).catch(err => {
                expect(typeof err).toBe('string');
                expect(err).toBe('java.lang.Exception: Invalid API secret');
                done();
            });
        });

        it('load function without API parameter should fail', function (done) {
            expect(window.verid.load).toBeDefined();
            window.verid.load().catch(err => {
                expect(typeof err).toBe('string');
                expect(err).toBe('java.lang.Exception: Invalid API secret');
                done();
            });
        });

        it('load then function with correct API should return an object with the following functions =' +
        'authenticate, captureLiveFace, compareFaces, deleteRegisteredUser, detectFaceInImage, getRegisteredUsers, register', function (done) {
            expect(window.verid.load).toBeDefined();
            window.verid.load(API_KEY).then(instance => {
                expect(typeof instance).toBe('object');
                expect(typeof instance.authenticate).toBe('function');
                expect(typeof instance.captureLiveFace).toBe('function');
                expect(typeof instance.compareFaces).toBe('function');
                expect(typeof instance.deleteRegisteredUser).toBe('function');
                expect(typeof instance.detectFaceInImage).toBe('function');
                expect(typeof instance.getRegisteredUsers).toBe('function');
                expect(typeof instance.register).toBe('function');
            }).finally(() => {
                window.verid.unload()
                done();
            });
        });

        it('instance exist after calling load without API', function (done) {
            expect(window.verid.load).toBeDefined();
            window.verid.load(API_KEY).then(instance => {
                expect(typeof instance).toBe('object');
                return verid.load()
            }).then(instance => {
                //instance should exist if unload was no called
                expect(typeof instance).toBe('object');
            }).finally(() => {
                window.verid.unload()
                done();
            });
        });

        it('instance should not exist after calling unload', function (done) {
            expect(window.verid.load).toBeDefined();
            window.verid.load(API_KEY).then(instance => {
                expect(typeof instance).toBe('object');
                window.verid.unload()
                return verid.load()
            }).catch(err => {
                expect(err).toBe('java.lang.Exception: Invalid API secret');
            }).finally(() => {
                done();
            });
        });
    });
    describe('Ver Id plugin, testing of settings', function () {
        it('test LivenessDetectionSessionSettings', function () {
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
        it('test AuthenticationSessionSettings', function () {
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
        it('test RegistrationSessionSettings', function () {
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

        it('test VerIDSessionSettings', function () {
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
        it('test detectFaceInImage with image that has a face', function (done) {
            var image = new Image();
            image.onload = function() {
                var canvas = document.createElement('canvas');
                canvas.width = image.width;
                canvas.height = image.height;
                var ctx = canvas.getContext('2d');
                ctx.drawImage(image, 0, 0);
                var dataUri = canvas.toDataURL('image/jpeg', 0.95);
                verid.load(API_KEY).then(verIDInstance => {
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
                    done();
                })
            }
            image.src = '../plugins/com-appliedrec-plugins-verid/tests/assets/test-photo.jpg';
        });
        it('test detectFaceInImage with image that does not have faces', function (done) {
            var image = new Image();
            image.onload = function() {
                var canvas = document.createElement('canvas');
                canvas.width = image.width;
                canvas.height = image.height;
                var ctx = canvas.getContext('2d');
                ctx.drawImage(image, 0, 0);
                var dataUri = canvas.toDataURL('image/jpeg', 0.95);
                verid.load(API_KEY).then(verIDInstance => {
                    return verIDInstance.detectFaceInImage(dataUri);
                }).catch(error => {
                    //Not face detected
                    expect(error).toBeDefined()
                }).finally(() => {
                    done();
                })
            }
            image.src = '../plugins/com-appliedrec-plugins-verid/tests/assets/test-empty.jpg';
        });
    });
    describe('Ver Id plugin, testing of compareFaces', function () {
        it('test compareFaces with face from image and mockup', function (done) {
            var image = new Image();
            var instance = null;
            image.onload = function() {
                var canvas = document.createElement('canvas');
                canvas.width = image.width;
                canvas.height = image.height;
                var ctx = canvas.getContext('2d');
                ctx.drawImage(image, 0, 0);
                var dataUri = canvas.toDataURL('image/jpeg', 0.95);
                verid.load(API_KEY).then(verIDInstance => {
                    instance = verIDInstance;
                    return verIDInstance.detectFaceInImage(dataUri);
                }).then(face => {
                    expect(face).toBeDefined();
                    return instance.compareFaces(face, JSON.parse(FACE_MOCK));
                }).then((result) => {
                    expect(result).toBeDefined();
                    expect(typeof result.score).toBe('number');
                    expect(typeof result.authenticationThreshold).toBe('number');
                    expect(typeof result.max).toBe('number');
                }).finally(()=> {
                    done();
                })
            }
            image.src = '../plugins/com-appliedrec-plugins-verid/tests/assets/test-photo.jpg';
        });
    });
}

//mocks
const FACE_MOCK = `{"x":-8.384888,"y":143.6514,"width":331.54974,"height":414.43723,"yaw":-0.07131743,
"pitch":-6.6307373,"roll":-2.5829313,"quality":9.658932,
"data":"eJw9k9tSE0EQhlnzbyAcFFA5BLVUToKAlJIEDYEgEgQRSizwRtBCQITlBhGqUNDt3ofycXwUZ3q72Zv/29me7p7pf3Nh0NgUZL6E1b46ecLdKBcGYfXDv/S1+v2vrh/L+sG4re+nEB3l4lzgvuE+aMlrH+jQ6zC4xesz8KjXCviN1xXwV6874EuvcR2SJoFeJLIjXkBSL7ANPhM4A296oCy4KtAKfiBwG1wn0AFKYzpBUx5GQINei6CbXt+CJO0+KNTK1CwwCkpbqIEyAp8NTkHSFGVAD2WlC/RYoBs0I5AHrRnsebjUnuJmcJqmB5wVGALLdcUl0IWHJe12AzThdRf01OsPUFnfpco6SE4el0ElgWXQmMBHA3eyoq2ULeaFhwgseqHTiG+AB6yzIYEBcL92xiM6B34uUATPWcyCnpRfC1zXFZf4lddT2+MKFATuGAwaTFtMP3jC0hUsXSFzkm3Zib5tFyeDxsB5rffdpz/Oa9fkNsLqySOxHiTe3cps1iw4DFpUFQuOqQWLeuhZ8LJa8CC1YCLT+YXklmS7i6RLYMZWtpCE6gOOxAf14FWBdvATgW4tQ/dABwY1D27GWph6dIZtXo9UY2eqtOC4S6N3Tq3qfYVzjaEG0IjZrGSwalbcMxBX/Qa3mQM7bM55AfdjdgpMgts9rIJkus40Fa+H6sifoJf6Pq/fF3R+NCuwYjbbNIjs05ZegY+R3cfgRf3rOP1tWs0GrrUpc8iV4aYF5s1nBfCaWXDdPLNhntmwzO89nNsmV6FmHqxZhRQqFjNg3s6rg71z5xquLPgfqNHOQQ==","leftEye":[101,322.5],"rightEye":[213,321],"faceTemplate":{"data":"CgsBC3Byb3RvDIIZEAAQAYAAAADbVnE4MyxI5lzywn/QXvhlzw8uyEk5t9DV6rm/FHAn3QqwReZYPOTIRwXHyEvntT4ZESlP0bLo15RKJaUj6zQNvbC1vTzeuTUNMFYD5FZNZdAYzTbSSsrRIOU64dPmW8ry1NbFSttOZxSiGMsv4Uo2QUdHwEDHRDwk5Lh44DQ/I7sVhRAJdXVpZAwhzzrlPEqHJyE9fy6LEDdTsQE=","version":1}}`;
