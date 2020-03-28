const API_KEY = 'INSERT_API_KEY_HERE'
const USER_ID = "TESTING_USER_ID";
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
                window.verid.unload()
            }).finally(() => {
                done();
            });
        });
    });
}
