//
//  FaceAuthentication.h
//  DetRecLib
//
//  Created by Tom Wysocki on 2015-06-10.
//  Copyright (c) 2015 Applied Recognition. All rights reserved.
//

#ifndef DetRecLib_FaceAuthentication_h
#define DetRecLib_FaceAuthentication_h

#import <Foundation/Foundation.h>
#import <Photos/Photos.h>
#import <CoreImage/CoreImage.h>

#import "DetRecLibHeader.h"
#import "DetRecMessenger.h"
#import "FBFace.h"
#import "FaceAuthenticationResults.h"
#import "DetRecLibErrors.h"

typedef NS_ENUM(NSInteger, FaceAuthenticationSecurityLevel) {
    FaceAuthenticationSecurityLevelLowest = 0,
    FaceAuthenticationSecurityLevelLow = 1,
    FaceAuthenticationSecurityLevelNormal = 2,
    FaceAuthenticationSecurityLevelHigh = 3,
    FaceAuthenticationSecurityLevelHighest = 4
};

@interface FaceAuthentication : DetRecLib

/**
 Initializes the DetRecLib library for Ver-ID by preparing the database and loading/configuring
 the context.

 @param apiSecret API secret for the consumer app
 @param modelPath Path to the models directory
 @param error Pointer to error that will be non-null if the call fails
 */
+ (void) initializeContextWithAPISecret:(NSString *)apiSecret
                              modelPath:(NSString *)modelPath
                                  error:(NSError **)error;

/**
 Initializes the DetRecLib library for Ver-ID by preparing the database and loading/configuring
 the context. If the clearDatabase parameter passed is true, then database is cleared; otherwise
 it remains untouched (or created if needed).

 @param apiSecret API secret for the consumer app
 @param modelPath Path to the models directory
 @param clearDatabase true to create a new database or false to keep one if it exists
 @param error Pointer to error that will be non-null if the call fails
 */
+ (void) initializeContextWithAPISecret:(NSString *)apiSecret
                              modelPath:(NSString *)modelPath
                          clearDatabase:(BOOL)clearDatabase
                                  error:(NSError **)error;

/**
 * Start enrollment process for a new or existing subject. All face
 * data is saved to DB, so it is persistent over many sessions.
 * If a subject already exists, all prior templates are cleared.
 *
 * @param subjectId
 *            unique identifier string for a subject. If the subject already
 *            exists, all templates are cleared to restart enrollment.
 *            If nil, a newly generated random string is returned.
 * @param error
 *             an address to NSError pointer. Will save error here
 *           ethod returns nil, unless error pointer is nil.
 * @return a unique identifier for a subject that can be used to add and
 *         authenticate faces. If an id was passed as a parameter
 *         then it is returned; otherwise, a randomly generated string is returned.
 *         If nil, error occured.
 */
+ (NSString *) startEnrollment:(NSString *)subjectId
                         error:(NSError **)error;

/**
 * Get an array of floats representing the recognition template/signature
 * for the face object. If the face does not exist or does not have a template
 * because it may be unsuitable for recognition, an error is returned.
 *
 * @param face
 *            FBFace object previously obtained from detection call.
 *            This object must not have been previously destroyed, otherwise
 *            exception will be thrown.
 *            Also, this face has to be suitable for recognition, otherwise
 *            exception will be thrown.
 * @param error
 *             an address to NSError pointer. Will save error here
 *             if method returns nil, unless error pointer is nil.
 * @return an array of floats representing the face template.
 *         If nil, error occured.
 */
+ (NSArray<NSNumber *> *) getTemplateForFace:(FBFace *)face
                                       error:(NSError **)error;

/**
 * Get a data object of bytes representing the serialized recognition template/signature
 * for the face object. If the face does not exist or does not have a template
 * because it may be unsuitable for recognition, an error is returned.
 *
 * @param face
 *            FBFace object previously obtained from detection call.
 *            This object must not have been previously destroyed, otherwise
 *            exception will be thrown.
 *            Also, this face has to be suitable for recognition, otherwise
 *            exception will be thrown.
 * @param error
 *             an address to NSError pointer. Will save error here
 *             if method returns nil, unless error pointer is nil.
 * @return data object of bytes representing the binary face template.
 *         If nil, error occured.
 */
+ (NSData *) getBinaryTemplateForFace:(FBFace *)face
                                       error:(NSError **)error;

/**
 * Create a new face object from the serialized recognition template/signature.
 * This always creates a new face, regardless if a duplicate template exists.
 * If you want to first check that face does not exist or fetch an existing
 * face, call getFBFacesFromBinaryTemplate.
 *
 * If the serialized template is incorrect or contains errors that cannot be
 * converted to a valid face object, an error is returned.
 *
 * @param binaryTemplate
 *            Binary template as NSData that was returned from a previous
 *            call to getBinaryTemplateForFace. It may have been
 *            forwarded to a server for template centralization, but
 *            must be converted exactly as the original data for it to
 *            be valid.
 *            If data object contains errors, an exception will be thrown.
 * @param error
 *             an address to NSError pointer. Will save error here
 *             if method returns nil, unless error pointer is nil.
 * @return an FBFace object representing the face template.
 *         If nil, error occured.
 */
+ (FBFace *) createFBFaceFromBinaryTemplate:(NSData *)binaryTemplate
                                      error:(NSError **)error;

/**
 * Fetches possible exising face objects matching the serialized recognition
 * template/signature. If no matching templates exist, returns an empty
 * array. Otherwise, one or more (since we don't enforce uniqueness) matching
 * faces are returned in array.
 *
 * If there are problems, most likely with database, an error is returned.
 *
 * @param binaryTemplate
 *            Binary template as NSData that was returned from a previous
 *            call to getBinaryTemplateForFace. It may have been
 *            forwarded to a server for template centralization. This
 *            call uses a hash for lookup and does not enforce integrity
 *            of the template - whether it's a valid template.
 * @param error
 *             an address to NSError pointer. Will save error here
 *             if method returns nil, unless error pointer is nil.
 * @return an array of FBFace objects matching the face template.
 *         If nil, error occured.
 */
+ (NSArray<FBFace *> *) getFBFacesFromBinaryTemplate:(NSData *)binaryTemplate
                                               error:(NSError **)error;

/**
 * Add a face to the enrollment templates for a given subject. Approximate
 * eye coordinates are needed to select face for extraction in a given image.
 *
 * @param subjectId
 *            unique identifier string for a subject, obtained from calling
 *            startEnrollment first.
 * @param image
 *            An image object of type CGImageRef, most likely taken by camera.
 * @param orientation
 *            An integer representing the orientation of the image in EXIF representation.
 * @param leftEye
 *            Absolute coordinates (in pixels) relative to the image as
 *            displayed (not necessarily as stored) of the left eye of the
 *            face selected for enrollment in image.
 * @param rightEye
 *            Absolute coordinates (in pixels) relative to the image as
 *            displayed (not necessarily as stored) of the right eye of the
 *            face selected for enrollment in image.
 * @param antiSpoofing
 *            If true, pose correction is NOT applied to face template extraction
 *            If false, pose correction IS applied, based on initialization config setting
 * @param error
 *             an address to NSError pointer. Will save error here
 *             if method returns nil, unless error pointer is nil.
 * @return a boolean (as NSNumber) indicating acceptance of face for
 *         enrollment. If true, face was accepted and enrolled, false otherwise.
 *         If nil, error occured.
 */
+ (NSNumber *) addFace:(NSString *)subjectId
               inImage:(CGImageRef )image
       withOrientation:(int)orientation
           withLeftEye:(CGPoint)leftEye
          withRightEye:(CGPoint)rightEye
       forAntiSpoofing:(BOOL)antiSpoofing
                 error:(NSError **)error;

/**
 * Add a face to the enrollment templates for a given subject. The largest
 * face in the image is selected (if any).
 *
 * @param subjectId
 *            unique identifier string for a subject, obtained from calling
 *            startEnrollment first.
 * @param image
 *            An image object of type CGImageRef, most likely taken by camera.
 * @param orientation
 *            An integer representing the orientation of the image in EXIF representation.
 * @param antiSpoofing
 *            If true, pose correction is NOT applied to face template extraction
 *            If false, pose correction IS applied, based on initialization config setting
 * @param error
 *             an address to NSError pointer. Will save error here
 *             if method returns nil, unless error pointer is nil.
 * @return a boolean (as NSNumber) indicating acceptance of face for
 *         enrollment. If true, face was accepted and enrolled, false otherwise.
 *         If nil, error occured.
 */
+ (NSNumber *) addFace:(NSString *)subjectId
               inImage:(CGImageRef )image
       withOrientation:(int)orientation
       forAntiSpoofing:(BOOL)antiSpoofing
                 error:(NSError **)error;

/**
 * Add a template face to the enrollment templates for a given subject.
 * The FBFace must be suitable for recognition to be successfully added.
 *
 * @param face
 *            FBFace object previously obtained from detection call.
 *            This object must not have been previously destroyed, otherwise
 *            exception will be thrown.
 * @param subjectId
 *            unique identifier string for a subject, obtained from calling
 *            startEnrollment first.
 * @param error
 *             an address to NSError pointer. Will save error here
 *             if method returns nil, unless error pointer is nil.
 * @return a boolean (as NSNumber) indicating acceptance of face for
 *         enrollment. If true, face was accepted and enrolled, false otherwise.
 *         If nil, error occured.
 */
+ (NSNumber *) addFace:(FBFace *)face
             toSubject:(NSString *)subjectId
                 error:(NSError **)error;

/**
 * Obtains current number of enrolled faces for a given subject.
 * Currently, this method is not implemented and will return nil.
 *
 * @param subjectId
 *            unique identifier string for a subject, obtained from calling
 *            startEnrollment first.
 * @param error
 *             an address to NSError pointer. Will save error here
 *             if method returns nil, unless error pointer is nil.
 * @return an integer (as NSNumber) indicating number of currently
 *         enrolled face templates for the given subject.
 *         If nil, error occured.
 */
+ (NSNumber *) numberOfEnrolledFaces:(NSString *)subjectId
                               error:(NSError **)error;

/**
 * Authenticate face against enrollment templates for a given subject. Approximate
 * eye coordinates are needed to select face for extraction in a given image.
 * Results indicate pass/fail decision and confidence measure of decision.
 *
 * @param subjectId
 *            unique identifier string for a subject, obtained from calling
 *            startEnrollment first.
 * @param image
 *            An image object of type CGImageRef, most likely taken by camera.
 * @param orientation
 *            An integer representing the orientation of the image in EXIF representation.
 * @param leftEye
 *            Absolute coordinates (in pixels) relative to the image as
 *            displayed (not necessarily as stored) of the left eye of the
 *            face selected for authentication in image.
 * @param rightEye
 *            Absolute coordinates (in pixels) relative to the image as
 *            displayed (not necessarily as stored) of the right eye of the
 *            face selected for authentication in image.
 * @param antiSpoofing
 *            If true, pose correction is NOT applied to face template extraction
 *            If false, pose correction IS applied, based on initialization config setting
 * @param error
 *             an address to NSError pointer. Will save error here
 *             if method returns nil, unless error pointer is nil.
 * @return
 *            If successful, returns results of authentication and other parameters.
 *            Confidence score has a range of 0.5 to 1.0 for either decision.
 *            A confidence score of 0.5 means that the decision was on the cusp.
 *            A confidence score of 1.0 or close to it means it is a strong
 *            decision.
 *            If nil, an error occured.
 */
+ (FaceAuthenticationResults *) authenticateFace:(NSString *)subjectId
                                         inImage:(CGImageRef )image
                                 withOrientation:(int)orientation
                                     withLeftEye:(CGPoint)leftEye
                                    withRightEye:(CGPoint)rightEye
                                 forAntiSpoofing:(BOOL)antiSpoofing
                                           error:(NSError **)error;

/**
 * Authenticate face against enrollment templates for a given subject. The
 * largest face in image is used (if any).
 * Results indicate pass/fail decision and confidence measure of decision.
 *
 * @param subjectId
 *            unique identifier string for a subject, obtained from calling
 *            startEnrollment first.
 * @param image
 *            An image object of type CGImageRef, most likely taken by camera.
 * @param orientation
 *            An integer representing the orientation of the image in EXIF representation.
 * @param antiSpoofing
 *            If true, pose correction is NOT applied to face template extraction
 *            If false, pose correction IS applied, based on initialization config setting
 * @param error
 *             an address to NSError pointer. Will save error here
 *             if method returns nil, unless error pointer is nil.
 * @return
 *            If successful, returns results of authentication and other parameters.
 *            Confidence score has a range of 0.5 to 1.0 for either decision.
 *            A confidence score of 0.5 means that the decision was on the cusp.
 *            A confidence score of 1.0 or close to it means it is a strong
 *            decision.
 *            If nil, an error occured.
 */
+ (FaceAuthenticationResults *) authenticateFace:(NSString *)subjectId
                                         inImage:(CGImageRef )image
                                 withOrientation:(int)orientation
                                 forAntiSpoofing:(BOOL)antiSpoofing
                                           error:(NSError **)error;

/**
 * Authenticate a face template against enrollment templates for a given subject.
 * Results indicate pass/fail decision and confidence measure of decision.
 *
 * @param face
 *            an FBFace object containing a face suitable for recognition obtained
 *            by calling detection. *** This object must be discarded manually after use.
 * @param subjectId
 *            unique identifier string for a subject, obtained from calling
 *            startEnrollment first.
 * @param error
 *             an address to NSError pointer. Will save error here
 *             if method returns nil, unless error pointer is nil.
 * @return
 *            If successful, returns results of authentication and other parameters.
 *            Confidence score has a range of 0.5 to 1.0 for either decision.
 *            A confidence score of 0.5 means that the decision was on the cusp.
 *            A confidence score of 1.0 or close to it means it is a strong
 *            decision.
 *            If nil, an error occured.
 */
+ (FaceAuthenticationResults *) authenticateFace:(FBFace *)face
                                       toSubject:(NSString *)subjectId
                                           error:(NSError **)error;

/**
 * Authenticate a face template taken from an ID card against enrollment templates for
 * a given subject. Comparison to ID cards has different settings than standard images.
 * Results indicate pass/fail decision and confidence measure of decision.
 *
 * @param face
 *            an FBFace object containing a face suitable for recognition obtained
 *            by calling detection. *** This object must be discarded manually after use.
 * @param subjectId
 *            unique identifier string for a subject, obtained from calling
 *            startEnrollment first.
 * @param error
 *             an address to NSError pointer. Will save error here
 *             if method returns nil, unless error pointer is nil.
 * @return
 *            If successful, returns results of authentication and other parameters.
 *            Confidence score has a range of 0.5 to 1.0 for either decision.
 *            A confidence score of 0.5 means that the decision was on the cusp.
 *            A confidence score of 1.0 or close to it means it is a strong
 *            decision.
 *            If nil, an error occured.
 */
+ (FaceAuthenticationResults *) authenticateFaceInIDCard:(FBFace *)face
                                               toSubject:(NSString *)subjectId
                                                   error:(NSError **)error;

/**
 * Authenticate face against enrollment templates for a list of given subjects.
 * Approximate eye coordinates are needed to select face for extraction in a given image.
 * Results indicate pass/fail decision and confidence measure of decision.
 * Optionally, if smile detection is enabled, results contain a smile decision
 * with confidence.
 *
 * The returned list of results is always the size of the subject list;
 * however, results are sorted by
 *   1) authenticated subjects first
 *   2) confidence value - highest first
 *
 * @param subjectIds
 *            an array of unique identifier strings for subjects, obtained from calling
 *            startEnrollment first.
 * @param image
 *            An image object of type CGImageRef, most likely taken by camera.
 * @param orientation
 *            An integer representing the orientation of the image in EXIF representation.
 * @param leftEye
 *            Absolute coordinates (in pixels) relative to the image as
 *            displayed (not necessarily as stored) of the left eye of the
 *            face selected for authentication in image.
 * @param rightEye
 *            Absolute coordinates (in pixels) relative to the image as
 *            displayed (not necessarily as stored) of the right eye of the
 *            face selected for authentication in image.
 * @param antiSpoofing
 *            If true, pose correction is NOT applied to face template extraction
 *            If false, pose correction IS applied, based on initialization config setting
 * @param error
 *             an address to NSError pointer. Will save error here
 *             if method returns nil, unless error pointer is nil.
 * @return
 *            If successful, returns an array of results of authentication and
 *            other parameters, corresponding to the subjectIds array.
 *            Confidence score has a range of 0.5 to 1.0 for either decision.
 *            A confidence score of 0.5 means that the decision was on the cusp.
 *            A confidence score of 1.0 or close to it means it is a strong
 *            decision.
 *            The array is sorted by authentication results (pass first) and
 *            confidence values.
 *            If array is empty, then no suitable face was found.
 *            If nil, an error occured.
 */
+ (NSArray<FaceAuthenticationResults *> *) authenticateFaceToSubjects:(NSArray<NSString *> *)subjectIds
                                                              inImage:(CGImageRef )image
                                                      withOrientation:(int)orientation
                                                          withLeftEye:(CGPoint)leftEye
                                                         withRightEye:(CGPoint)rightEye
                                                      forAntiSpoofing:(BOOL)antiSpoofing
                                                                error:(NSError **)error;

/**
 * Authenticate face against enrollment templates for a list of given subjects.
 * The largest face in image (if any) will be selected.
 * Results indicate pass/fail decision and confidence measure of decision.
 * Optionally, if smile detection is enabled, results contain a smile decision
 * with confidence.
 *
 * The returned list of results is always the size of the subject list;
 * however, results are sorted by
 *   1) authenticated subjects first
 *   2) confidence value - highest first
 *
 * @param subjectIds
 *            an array of unique identifier strings for subjects, obtained from calling
 *            startEnrollment first.
 * @param image
 *            An image object of type CGImageRef, most likely taken by camera.
 * @param orientation
 *            An integer representing the orientation of the image in EXIF representation.
 * @param antiSpoofing
 *            If true, pose correction is NOT applied to face template extraction
 *            If false, pose correction IS applied, based on initialization config setting
 * @param error
 *             an address to NSError pointer. Will save error here
 *             if method returns nil, unless error pointer is nil.
 * @return
 *            If successful, returns an array of results of authentication and
 *            other parameters, corresponding to the subjectIds array.
 *            Confidence score has a range of 0.5 to 1.0 for either decision.
 *            A confidence score of 0.5 means that the decision was on the cusp.
 *            A confidence score of 1.0 or close to it means it is a strong
 *            decision.
 *            The array is sorted by authentication results (pass first) and
 *            confidence values.
 *            If array is empty, then no suitable face was found.
 *            If nil, an error occured.
 */
+ (NSArray<FaceAuthenticationResults *> *) authenticateFaceToSubjects:(NSArray<NSString *> *)subjectIds
                                                              inImage:(CGImageRef )image
                                                      withOrientation:(int)orientation
                                                      forAntiSpoofing:(BOOL)antiSpoofing
                                                                error:(NSError **)error;

/**
 * Authenticate face template against enrollment templates for a list of given subjects.
 * Results indicate pass/fail decision and confidence measure of decision.
 * Optionally, if smile detection is enabled, results contain a smile decision
 * with confidence.
 *
 * The returned list of results is always the size of the subject list;
 * however, results are sorted by
 *   1) authenticated subjects first
 *   2) confidence value - highest first
 *
 * @param face
 *            an FBFace object containing a face suitable for recognition obtained
 *            by calling detection. *** This object must be discarded manually after use.
 * @param subjectIds
 *            an array of unique identifier strings for subjects, obtained from calling
 *            startEnrollment first.
 * @param error
 *             an address to NSError pointer. Will save error here
 *             if method returns nil, unless error pointer is nil.
 * @return
 *            If successful, returns an array of results of authentication and
 *            other parameters, corresponding to the subjectIds array.
 *            Confidence score has a range of 0.5 to 1.0 for either decision.
 *            A confidence score of 0.5 means that the decision was on the cusp.
 *            A confidence score of 1.0 or close to it means it is a strong
 *            decision.
 *            The array is sorted by authentication results (pass first) and
 *            confidence values.
 *            If array is empty, then no suitable face was found.
 *            If nil, an error occured.
 */
+ (NSArray<FaceAuthenticationResults *> *) authenticateFace:(FBFace *)face
                                                 toSubjects:(NSArray<NSString *> *)subjectIds
                                                      error:(NSError **)error;

/**
 * Authenticate face template taken from an ID card against enrollment templates for
 * a list of given subjects. Comparison to ID cards has different settings than standard images.
 * Results indicate pass/fail decision and confidence measure of decision.
 * Optionally, if smile detection is enabled, results contain a smile decision
 * with confidence.
 *
 * The returned list of results is always the size of the subject list;
 * however, results are sorted by
 *   1) authenticated subjects first
 *   2) confidence value - highest first
 *
 * @param face
 *            an FBFace object containing a face suitable for recognition obtained
 *            by calling detection. *** This object must be discarded manually after use.
 * @param subjectIds
 *            an array of unique identifier strings for subjects, obtained from calling
 *            startEnrollment first.
 * @param error
 *             an address to NSError pointer. Will save error here
 *             if method returns nil, unless error pointer is nil.
 * @return
 *            If successful, returns an array of results of authentication and
 *            other parameters, corresponding to the subjectIds array.
 *            Confidence score has a range of 0.5 to 1.0 for either decision.
 *            A confidence score of 0.5 means that the decision was on the cusp.
 *            A confidence score of 1.0 or close to it means it is a strong
 *            decision.
 *            The array is sorted by authentication results (pass first) and
 *            confidence values.
 *            If array is empty, then no suitable face was found.
 *            If nil, an error occured.
 */
+ (NSArray<FaceAuthenticationResults *> *) authenticateFaceInIDCard:(FBFace *)face
                                                         toSubjects:(NSArray<NSString *> *)subjectIds
                                                              error:(NSError **)error;

/**
 * Return face suitable for recognition (if found).
 * Approximate eye coordinates are needed to select face for extraction in a given image.
 *
 * You must discard the returned face manually, unless it is to be added to subject templates.
 *
 * @param image
 *            An image object of type CGImageRef, most likely taken by camera.
 * @param orientation
 *            An integer representing the orientation of the image in EXIF representation.
 * @param leftEye
 *            Absolute coordinates (in pixels) relative to the image as
 *            displayed (not necessarily as stored) of the left eye of the
 *            face selected for authentication in image.
 * @param rightEye
 *            Absolute coordinates (in pixels) relative to the image as
 *            displayed (not necessarily as stored) of the right eye of the
 *            face selected for authentication in image.
 * @param antiSpoofing
 *            If true, pose correction is NOT applied to face template extraction
 *            If false, pose correction IS applied, based on initialization config setting
 * @param rejectedFaces
 *            an array to load rejected faces - will not contain the returned face.
 *            pass null if not needed
 * @param error
 *             an address to NSError pointer. Will save error here
 *             if method returns false, unless error pointer is nil.
 * @return
 *        an array containing one FBFace object representing the largest face suitable
 *        for recognition, if one is found; otherwise, an empty array.
 *        If error, null is returned.
 */
+ (NSArray<FBFace *> *) detectFaceInImage:(CGImageRef )image
                          withOrientation:(int)orientation
                              withLeftEye:(CGPoint)leftEye
                             withRightEye:(CGPoint)rightEye
                          forAntiSpoofing:(BOOL)antiSpoofing
                        withRejectedFaces:(NSMutableArray<FBFace *> *)rejectedFaces
                                    error:(NSError **)error;

/**
 * Return face that is being processed in the backround for template extraction (if found).
 * Approximate eye coordinates are needed to select face for extraction in a given image.
 *
 * You must discard the returned face manually, unless it is to be added to subject templates.
 *
 * @param image
 *            An image object of type CGImageRef, most likely taken by camera.
 * @param orientation
 *            An integer representing the orientation of the image in EXIF representation.
 * @param leftEye
 *            Absolute coordinates (in pixels) relative to the image as
 *            displayed (not necessarily as stored) of the left eye of the
 *            face selected for authentication in image.
 * @param rightEye
 *            Absolute coordinates (in pixels) relative to the image as
 *            displayed (not necessarily as stored) of the right eye of the
 *            face selected for authentication in image.
 * @param antiSpoofing
 *            If true, pose correction is NOT applied to face template extraction
 *            If false, pose correction IS applied, based on initialization config setting
 * @param rejectedFaces
 *            an array to load rejected faces - will not contain the returned face.
 *            pass null if not needed
 * @param error
 *             an address to NSError pointer. Will save error here
 *             if method returns false, unless error pointer is nil.
 * @return
 *        an array containing one FBFace object representing the largest face being processed
 *        in the backround, if one is found; otherwise, an empty array.
 *        If error, null is returned.
 */
+ (NSArray<FBFace *> *) detectFaceInImageUsingBackgroundProcessing:(CGImageRef )image
                                                   withOrientation:(int)orientation
                                                       withLeftEye:(CGPoint)leftEye
                                                      withRightEye:(CGPoint)rightEye
                                                   forAntiSpoofing:(BOOL)antiSpoofing                                                                                                                            withRejectedFaces:(NSMutableArray<FBFace *> *)rejectedFaces
                                                             error:(NSError **)error;

+ (NSArray<FBFace *> *) detectFaceInImageBufferUsingBackgroundProcessing:(unsigned char *)buffer
                                                               withWidth:(int)width
                                                                  height:(int)height
                                                         forAntiSpoofing:(BOOL)antiSpoofing
                                                       withRejectedFaces:(NSMutableArray<FBFace *> *)rejectedFaces
                                                                   error:(NSError **)error;


/**
 * Detect faces in an image and return the largest that is being processed in the backround
 * for template extraction (if found). All
 * other faces which are rejected are returned in the rejectedFaces array.
 * All faces (except the one returned) are automatically discarded.
 *
 * You must discard the returned face manually, unless it is to be added to subject templates.
 *
 * @param image
 *            An image object of type CGImageRef, most likely taken by camera.
 * @param orientation
 *            An integer representing the orientation of the image in EXIF representation.
 * @param antiSpoofing
 *            If true, pose correction is NOT applied to face template extraction
 *            If false, pose correction IS applied, based on initialization config setting
 * @param rejectedFaces
 *            an array to load rejected faces - will not contain the returned face.
 *            pass null if not needed
 * @param error
 *             an address to NSError pointer. Will save error here
 *             if method returns false, unless error pointer is nil.
 * @return
 *        an array containing one FBFace object representing the largest face being processed
 *        in the backround, if one is found; otherwise, an empty array.
 *        If error, null is returned.
 */
+ (NSArray<FBFace *> *) detectFaceInImageUsingBackgroundProcessing:(CGImageRef )image
                                                   withOrientation:(int)orientation
                                                   forAntiSpoofing:(BOOL)antiSpoofing                                                                                                                            withRejectedFaces:(NSMutableArray<FBFace *> *)rejectedFaces
                                                             error:(NSError **)error;


/**
 * Poll whether face id is still processing. If finished, an FBFace object will be returned.
 * This object should contain a template, but it may be the case that template extraction
 * did not succeed, in which case the face will not be suitable for face recognition.
 *
 * If not finished, then empty array will be returned.
 * If face id is invalid or cannot be found (perhaps because it was already converted by
 * a previous polling call), then an error will be returned.
 *
 * You must discard the returned face manually, unless it is to be added to subject templates.
 *
 * @param faceId
 *             An id to the face in background processing. Valid number must be less than -1.
 * @param error
 *             an address to NSError pointer. Will save error here
 *             if method returns false, unless error pointer is nil.
 * @return
 *         an array containing one FBFace object containing the processed face, very likely suitable for recognition;
 *         otherwise, empty array is returned if still waiting.
 *         If error, null is returned.
 */
+ (NSArray<FBFace *> *) pollBackgroundProcessingByFaceId:(long)faceId
                                                   error:(NSError **)error;

/**
 * Detect faces in an image in an expedited fashion, by tracking the face. This means that face detection
 * is only executed at the beginning and when face is lost from tracking. Otherwise, only landmark detection
 * is executed to reposition the face in the next frame. 
 *
 * Face locations are stored internally and don't need to be passed into function.
 *
 * This method tracks all faces in image, but returns the largest face only. All other faces
 * are stored in the rejectedFaces parameter - if selected.
 *
 * You must discard the returned face manually, unless it is to be added to subject templates.
 *
 * @param image
 *            An image object of type CGImageRef, most likely taken by camera.
 * @param orientation
 *            An integer representing the orientation of the image in EXIF representation.
 * @param rejectedFaces
 *            an array to load rejected faces - will not contain the returned face.
 *            pass null if not needed
 * @param error
 *             an address to NSError pointer. Will save error here
 *             if method returns false, unless error pointer is nil.
 * @return
 *        an array containing one FBFace object representing the largest face that is trackable,
 *        if one is found; otherwise, an empty array.
 *        If error, null is returned.
 */
+ (NSArray<FBFace *> *) trackFaceInImage:(CGImageRef)image
                         withOrientation:(int) orientation
                       withRejectedFaces:(NSMutableArray<FBFace *> *)rejectedFaces
                                   error:(NSError **)error;

+ (NSArray<FBFace *> *) trackFaceUsingImageBuffer:(unsigned char *)buffer
                                         withWidth:(int)width
                                            height:(int)height
                                 withRejectedFaces:(NSMutableArray<FBFace *> *)rejectedFaces
                                             error:(NSError **)error;
/**
 * Detect faces in an image and return the largest face suitable for recognition (if found). All
 * other faces which are rejected are returned in the rejectedFaces array.
 * All faces (except the one returned) are automatically discarded.
 *
 * You must discard the returned face manually, unless it is to be added to subject templates.
 *
 * @param image
 *            An image object of type CGImageRef, most likely taken by camera.
 * @param orientation
 *            An integer representing the orientation of the image in EXIF representation.
 * @param antiSpoofing
 *            If true, pose correction is NOT applied to face template extraction
 *            If false, pose correction IS applied, based on initialization config setting
 * @param rejectedFaces
 *            an array to load rejected faces - will not contain the returned face.
 *            pass null if not needed
 * @param error
 *             an address to NSError pointer. Will save error here
 *             if method returns false, unless error pointer is nil.
 * @return
 *        an array containing one FBFace object representing the largest face suitable
 *        for recognition, if one is found; otherwise, an empty array.
 *        If error, null is returned.
 */
+ (NSArray<FBFace *> *) detectFaceInImage:(CGImageRef )image
                          withOrientation:(int)orientation
                          forAntiSpoofing:(BOOL)antiSpoofing
                        withRejectedFaces:(NSMutableArray<FBFace *> *)rejectedFaces
                                    error:(NSError **)error;

+ (NSArray<FBFace *> *) detectFaceUsingImageBuffer:(unsigned char *)buffer
                                         withWidth:(int)width
                                            height:(int)height
                                   forAntiSpoofing:(BOOL)antiSpoofing
                                 withRejectedFaces:(NSMutableArray<FBFace *> *)rejectedFaces
                                             error:(NSError **)error;
/**
 * Detect faces in an image in a reduced fashion to speed up detection for anti-spoofing purposes.
 * If a face is found that is at least trackable (has the landmark coordinates and pose estimates),
 * then it is returned. All other faces which are rejected are returned in the rejectedFaces array.
 * All faces (except the one returned) are automatically discarded.
 *
 * You must discard the returned face manually if the templateExtractionType is set to full template
 * extraction, unless it is to be added to subject templates.
 *
 * @param image
 *            An image object of type CGImageRef, most likely taken by camera.
 * @param orientation
 *            An integer representing the orientation of the image in EXIF representation.
 * @param lastFace
 *           A face that was returned in a previous session to highlight the possible whereabouts
 *           of the next face. If not null, the image will be first cropped and, only if detection
 *           fails, the entire image will then be scanned. If null, the entire image will be scanned.
 * @param templateExtractionType
 *           an integer to indicate whether to skip extensive eye detection (using haar)
 *           and/or template extraction.
 *           Valid types are:
 *           0 - perform full haar eye detection & full template extraction
 *           1 - skip haar & full template extraction
 *           2 - perform full haar eye detection & skip template extraction
 *           3 - skip haar & skip template extraction
 *           If template extraction is excluded, returned faces
 *           cannot be added to subject templates or used for authentication. Choose this
 *           setting only if interested in anti-spoofing.
 * @param antiSpoofing
 *            If true, pose correction is NOT applied to face template extraction
 *            If false, pose correction IS applied, based on initialization config setting
 * @param rejectedFaces
 *            an array to load rejected faces - will not contain the returned face.
 *            pass null if not needed
 * @param error
 *             an address to NSError pointer. Will save error here
 *             if method returns false, unless error pointer is nil.
 * @return
 *        an array containing one FBFace object representing the largest face that is at least
 *        trackable, if one is found; otherwise, an empty array.
 *        If error, null is returned.
 */
+ (NSArray<FBFace *> *) detectFastFaceInImage:(CGImageRef )image
                              withOrientation:(int)orientation
                                 withLastFace:(FBFace *)lastFace
                   withTemplateExtractionType:(int)templateExtractionType
                              forAntiSpoofing:(BOOL)antiSpoofing
                            withRejectedFaces:(NSMutableArray<FBFace *> *)rejectedFaces
                                        error:(NSError **)error;

/**
 * Return face suitable for recognition (if found).
 * Approximate eye coordinates are needed to select face for extraction in a given image.
 * If a face is found that is at least trackable (has the landmark coordinates and pose estimates),
 * then it is returned.
 *
 * You must discard the returned face manually if the templateExtractionType is set to full template
 * extraction, unless it is to be added to subject templates.
 *
 * @param image
 *            An image object of type CGImageRef, most likely taken by camera.
 * @param orientation
 *            An integer representing the orientation of the image in EXIF representation.
 * @param leftEye
 *            Absolute coordinates (in pixels) relative to the image as
 *            displayed (not necessarily as stored) of the left eye of the
 *            face selected for authentication in image.
 * @param rightEye
 *            Absolute coordinates (in pixels) relative to the image as
 *            displayed (not necessarily as stored) of the right eye of the
 *            face selected for authentication in image.
 * @param templateExtractionType
 *           an integer to indicate whether to skip extensive eye detection (using haar)
 *           and/or template extraction.
 *           Valid types are:
 *           0 - perform full haar eye detection & full template extraction
 *           1 - skip haar & full template extraction
 *           2 - perform full haar eye detection & skip template extraction
 *           3 - skip haar & skip template extraction
 *           If template extraction is excluded, returned faces
 *           cannot be added to subject templates or used for authentication. Choose this
 *           setting only if interested in anti-spoofing.
 * @param antiSpoofing
 *            If true, pose correction is NOT applied to face template extraction
 *            If false, pose correction IS applied, based on initialization config setting
 * @param rejectedFaces
 *            an array to load rejected faces - will not contain the returned face.
 *            pass null if not needed
 * @param error
 *             an address to NSError pointer. Will save error here
 *             if method returns false, unless error pointer is nil.
 * @return
 *        an array containing one FBFace object representing the largest face that is at least
 *        trackable, if one is found; otherwise, an empty array.
 *        If error, null is returned.
 */
+ (NSArray<FBFace *> *) detectFastFaceInImage:(CGImageRef )image
                              withOrientation:(int)orientation
                                  withLeftEye:(CGPoint)leftEye
                                 withRightEye:(CGPoint)rightEye
                   withTemplateExtractionType:(int)templateExtractionType
                              forAntiSpoofing:(BOOL)antiSpoofing
                            withRejectedFaces:(NSMutableArray<FBFace *> *)rejectedFaces
                                        error:(NSError **)error;

/**
 * Detect faces in an image and return all faces found, regardless if suitable.
 *
 * All faces must be explicitly discarded, unless some are to be added to subject templates.
 *
 * @param image
 *            An image object of type CGImageRef, most likely taken by camera.
 * @param orientation
 *            An integer representing the orientation of the image in EXIF representation.
 * @param antiSpoofing
 *            If true, pose correction is NOT applied to face template extraction
 *            If false, pose correction IS applied, based on initialization config setting
 * @param error
 *             an address to NSError pointer. Will save error here
 *             if method returns false, unless error pointer is nil.
 * @return
 *        an array of all detected faces, sorted by size from largest to smallest.
 *        Returns an empty array if no faces are found.
 *        If error, null is returned.
 */
+ (NSArray<FBFace *> *) detectFacesInImage:(CGImageRef )image
                           withOrientation:(int)orientation
                           forAntiSpoofing:(BOOL)antiSpoofing
                                     error:(NSError **)error;

/**
 * Detect faces in an image of an ID card and return all faces found, regardless if suitable.
 * This call is optimized to detect faces in IDs.
 *
 * All faces must be explicitly discarded, unless some are to be added to subject templates.
 *
 * @param image
 *            An image object of type CGImageRef, most likely taken by camera.
 * @param orientation
 *            An integer representing the orientation of the image in EXIF representation.
 * @param error
 *             an address to NSError pointer. Will save error here
 *             if method returns false, unless error pointer is nil.
 * @return
 *        an array of all detected faces, sorted by size from largest to smallest.
 *        Returns an empty array if no faces are found.
 *        If error, null is returned.
 */
+ (NSArray<FBFace *> *) detectFacesInIDCard:(CGImageRef )image
                            withOrientation:(int)orientation
                                      error:(NSError **)error;

+ (NSArray<FBFace *> *) detectFacesInIDCardUsingBackgroundProcessing:(CGImageRef )image
                                                     withOrientation:(int)orientation
                                                               error:(NSError **)error;

+ (NSArray<FBFace *> *) detectFacesInIDCardInImageBuffer:(unsigned char *)buffer
                                                  withWidth:(int)width
                                                     height:(int)height
                                                      error:(NSError **)error;

+ (NSArray<FBFace *> *) detectFacesInIDCardUsingBackgroundProcessingInImageBuffer:(unsigned char *)buffer
                                                                          withWidth:(int)width
                                                                             height:(int)height
                                                                              error:(NSError **)error;

/**
 * Discard a face obtained from detection. *** All valid faces returned from detection must
 * either be added to subject (and not discarded), or discarded, regardless if they are
 * used for authentication.
 *
 * The same face may be discarded multiple times - it will log warning but will not
 * crash or throw exception.
 *
 * Passing null face or face without valid id is accepted - might log warning.
 *
 * @param face
 *             FBFace object, previously returned using detection
 * @param error
 *             an address to NSError pointer. Will save error here
 *             if method returns false, unless error pointer is nil.
 * @return a boolean indicating success of function.
 *         If false, error occured; true otherwise.
 */
+ (BOOL) discardFace:(FBFace *)face
               error:(NSError **)error;

/**
 * Discard face array obtained from detection. *** All valid faces returned from detection must
 * either be added to subject (and not discarded), or discarded, regardless if they are
 * used for authentication.
 *
 * The same face may be discarded multiple times - it will log warning but will not
 * crash or throw exception.
 *
 * Passing null faces or faces without valid id is accepted - might log warning.
 *
 * @param faces
 *             an array of FBFace objects, previously returned using detection
 * @param error
 *             an address to NSError pointer. Will save error here
 *             if method returns false, unless error pointer is nil.
 * @return a boolean indicating success of function.
 *         If false, error occured; true otherwise.
 */
+ (BOOL) discardFaces:(NSArray<FBFace *> *)faces
                error:(NSError **)error;

/**
 * Returns array of all subject ids currently registered in the DB.
 *
 * @param error
 *             an address to NSError pointer. Will save error here
 *             if method returns false, unless error pointer is nil.
 * @return an array of strings for each recorded user in DB.
 *         If nil, an error occured.
 */
+ (NSArray<NSString *> *) getEnrolledSubjects:(NSError **)error;

/**
 * Returns array of all face registered for a given subject.
 *
 * @param subjectId
 *            a unique identifier string for subject.
 * @param error
 *             an address to NSError pointer. Will save error here
 *             if method returns false, unless error pointer is nil.
 * @return an array of FBFace objects for each registered face for subject id in DB.
 *         If nil, an error occured.
 */
+ (NSArray<FBFace *> *) getRegisteredFacesForSubject:(NSString *)subjectId
                                               error:(NSError **)error;

/**
 * Delete all subject ids passed in the array.
 * If subject id is not found, an error will be thrown.
 *
 * @param subjectIds
 *            an array of unique identifier strings for each subject to be deleted.
 * @param error
 *             an address to NSError pointer. Will save error here
 *             if method returns false, unless error pointer is nil.
 * @return a boolean indicating success of function.
 *         If false, error occured; true otherwise.
 */
+ (BOOL) deleteSubjects:(NSArray<NSString *> *)subjectIds
                  error:(NSError **)error;

/**
 * Set the security level as an integer enum, and save to DB. The security level
 * is global across all enrolled subjects and is persistent across sessions, with
 * a default value of FaceAuthenticationSecurityLevelNormal.
 *
 * The higher the security, the more difficult it is to authenticate the
 * enrolled user, but also it is less likely to let in an imposter.
 *
 * @param securityLevel
 *            An integer enum representing the security level.
 * @param error
 *             an address to NSError pointer. Will save error here
 *             if method returns false, unless error pointer is nil.
 * @return If false, error occured; true otherwise.
 */
+ (BOOL) setSecurityLevel:(FaceAuthenticationSecurityLevel)securityLevel
                    error:(NSError **)error;

/**
 * Get the saved security level as an integer enum, which is global across
 * all enrolled subjects. The default starting value, unless changed,
 * is FaceAuthenticationSecurityLevelNormal.
 *
 * @param securityLevel
 *            A pointer to an integer enum, which will be set with
 *            a result value representing the security level.
 * @param error
 *             an address to NSError pointer. Will save error here
 *             if method returns false, unless error pointer is nil.
 * @return If false, error occured; true otherwise.
 */
+ (BOOL) getSecurityLevel:(FaceAuthenticationSecurityLevel *)securityLevel
                    error:(NSError **)error;

//TODO: add error object
/**
 *  Detect rectangles with specified aspect ratio in an image.
 *
 *  @param widthHeightRatio The width/height ratio of the detected rectangle. This is a hint to the detector. The returned rectangles may not match the ratio precisely.
 *  @param image            The image to scan.
 *  @param exifOrientation  The exif orientation of the scanned image.
 *
 *  @return Array of the detected rectangles. Will be empty if no rectangles were found.
 */
+ (NSArray<CIRectangleFeature*>*) detectRectanglesWithAspectRatio:(float)widthHeightRatio
                                  inImage:(CIImage *)image
                          withOrientation:(int)exifOrientation;

//TODO: add error object
/**
 *  Detect a rectangle in the specified bounds and return an image with its perspective straightened.
 *
 *  @param image           The image to scan.
 *  @param exifOrientation The exif orientation of the scanned image.
 *  @param bounds          The bounds of the detected rectangle
 *  @param outerTolerance  The rectangle must fit the bounds extended by this value.
 *  @param innerTolerance  The rectangle must envelope the bounds inset by this value.
 *
 *  @return Straightened image or NULL if a matching rectangle is not detected.
 */
+ (CIImage *)   straightenImage:(CIImage *)image
                withOrientation:(int)exifOrientation
                       inBounds:(CGRect)bounds
                 outerTolerance:(CGFloat)outerTolerance
                 innerTolerance:(CGFloat)innerTolerance;

/**
 * Output a series of debug images for a given face, including the original cropped face,
 * face with a mesh of landmark points, face after post-processing (light & pose compensation
 * included), and a reconstructed face from the recognition template in 2 formats: faithful (as close
 * to real face as possible), and features (highlighting the eigenvector features).
 *
 * The face images will be saved as jpegs under a given directory, with a prefix basename provided and
 * specific generated suffixes depending on the debug type.
 * 
 * @param face              The FBFace object obtained from detection. It must be suitable for recognition
 *                          otherwise error will be thrown.
 * @param faceWidth         The width of the resized cropped face in pixels. Must be between 10 and 200.
 * @param image             The exact same image that face was detected on.
 * @param orientation       An integer representing the orientation of the image in EXIF representation.
 * @param path              The full absolute path of the directory where to store images
 * @param baseName          A string for the prefix name of each debug image. Specific suffixes
 *                          will be added depending on debug type. The prefix should be unique
 *                          and could contain the face ID, in order not to overwrite previous images.
 * @param error             an address to NSError pointer. Will save error here
 *                          if method returns false, unless error pointer is nil.
 * @return                  a boolean indicating success of function.
 *                          If false, error occured; true otherwise.
 */

+ (BOOL) outputDebugImagesForFace:(FBFace *)face
                    withFaceWidth:(int)faceWidth
                          inImage:(CGImageRef )image
                  withOrientation:(int)orientation
                      withDirPath:(NSString *)path
                     withBaseName:(NSString *)baseName
                            error:(NSError **)error;

/**
 *  Indicates whether the client app has authenticated for the use of the Ver-ID API.
 *
 *  @return YES if the client has authenticated.
 */
//+ (BOOL) isClientAuthenticated;

/**
 *  Indicates whether the client app has to authenticate to use the Ver-ID API.
 *
 *  @return YES if the client is required to authenticate.
 */
//+ (BOOL) isClientRequiredToAuthenticate;

/**
 *  Authenticate the client to use the Ver-ID API.
 *
 *  @param apiKey API key to use for authentication.
 *  @param secret API secret to use for authentication.
 *  @param block  Callback block to execute when the authentication finishes.
 */
//+ (void) authenticateClientWithAPISecret:(NSString *)secret
//                             callback:(void (^)(NSError *error))block;

@end

#endif
