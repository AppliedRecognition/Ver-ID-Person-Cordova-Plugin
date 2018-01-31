#ifndef FBFACE_H_
#define FBFACE_H_

#import <Foundation/Foundation.h>
#import <CoreGraphics/CoreGraphics.h>

/**
 * Structure specifying the rotation/orientation of the face
 *
 */
struct Rotation {
    float yaw;
    float pitch;
    float roll;
};
typedef struct Rotation Rotation;

/**
 * Structure specifying input face
 *
 */
struct InFace {
    float eye_distance;
    CGPoint center_eye;
    long face_id;
};
typedef struct InFace InFace;

/**
 * OLD DEFINE
 * Structure specifying authentication status of face
 *
struct FaceAuthenticationResults {
    BOOL authenticated;
    CGFloat confidenceScore;
};
typedef struct FaceAuthenticationResults FaceAuthenticationResults;
 */

@interface FBFace : NSObject

/**
 * Get possible suggestion for face. If null, then face does not have a suggestion.
 *
 * @return suggestion for face, null if no suggestion
 */
- (NSString *) getSuggestion;

/**
 * Get face id. If -1, then face does not have an id, as it is not stored in the recognition DB.
 * Such a face would not be suitable for recognition, and cannot be reloaded.
 *
 * @return face id of the face, or -1 if no id
 */
- (long) getId;

/**
 * Get external global face id. This is another id that corresponds to this face, most likely assigned
 * for candidate faces passed in.
 *
 * @return external face id, or -1 if no id
 */
- (long) getExternalId;

/**
 * Get candidate face id. This is the index in the array of candidate faces passed (from 1st step
 * of detection). If -1, then face does not have a candidate id set, as there may not have
 * been candidates passed.
 *
 * @return array index of the candidate face, or -1 if no id
 */
- (long) getCandidateId;

/**
 * Indicates whether this face has accurate eye coordinates. It may not. You can
 * get the location of the tag by getCenterOfFace().
 *
 * @return true if face has eyes
 */
- (BOOL) hasEyes;

/**
 * Indicates whether this face has nose coordinates.
 *
 * @return true if face has nose
 */
- (BOOL) hasNose;

/**
 * Indicates whether this face has mouth coordinates.
 *
 * @return true if face has mouth
 */
- (BOOL) hasMouth;

/**
 * Indicates whether this face has eyes gaze coordinates.
 *
 * @return true if face has eyes gaze
 */
- (BOOL) hasEyesGaze;

/**
 * Get eye coordinates of the face. The coordinates are expressed as
 * fractions of the width and height of the image. The image should be
 * rotated to its view orientation before calculating the coordinates. For
 * example, the resulting eye coordinate x 350 and y 200 on a 800x600 pixel
 * image will be <code>new PointF(350f/800f,200f/600f)</code>.
 *
 * @return an array of 2 point objects corresponding to the left and right
 *         eye of the face, at index 0 and 1, respectively. Can be null if eyes cannot be located.
 */
- (CGPoint *) getEyeCoordinates;


/**
 * Get coordinates of the center of the face. The coordinates are expressed as
 * fractions of the width and height of the image.
 *
 * @return a point object corresponding to the center of face.
 */
- (CGPoint) getCenterOfFace;

/**
 * Get coordinates of the bounding box of the face. The coordinates are expressed as
 * fractions of the width and height of the image. This bounding box can have a rotation.
 *
 * @return a rectangle object corresponding to the bounding box of face.
 */
- (CGSize) getBoundingBox;

/**
 * Get rotation of the bounding box of the face, in degrees.
 *
 * @return an angle, in degrees, of the rotation of the bounding box of face.
 */
- (Rotation) getRotation;

/**
 * Specifies whether the given face is suitable for recognition. If yes, it will
 * be stored in the native database. Otherwise it will not be stored, and should
 * not be passed to FaceRecognition.tagFace().
 *
 * @return true if face has a template and can be used for recognition; false otherwise.
 */
- (BOOL) isSuitableForRecognition;

/**
 * Specifies whether the given face is trackable for purposes of anti-spoofing. If yes, it will
 * contain various landmark, such as nose, yaw, pitch, etc. A trackable face is not necessarily
 * stored (unless it is also suitable for recognition), and, therefore, should not be an indicator
 * to whether to pass to FaceRecognition.tagFace().
 *
 * @return true if face is trackable for anti-spoofing; false otherwise.
 */
- (BOOL) isTrackable;

/**
 * Specifies whether the given face is being processed in the background for template extraction.
 * If yes, it can be accessed using FaceAuthentication.pollBackgroundProcessingByFaceId to determine if
 * template extraction is finished.
 *
 * @return true if face is being processed in the background; false otherwise.
 */
- (BOOL) isBackgroundProcessing;

/**
 * Specifies the confidence of the detected face. The higher, the more likely the face
 * is proper.
 *
 * @return float representing confidence measure
 */
- (float) getConfidence;

/**
 * Specifies the confidence of the smile detected (if enabled). The higher, the more pronounced
 * the smile.
 *
 * @return float representing smile confidence measure
 */
- (float) getSmileConfidence;

/**
 * Specifies the quality of the face detected. The higher, the more symmetrical the face is.
 * Ranges from 0 to 20.
 *
 * @return float representing face quality measure
 */
- (float) getFaceQuality;

/**
 * Specifies degree of mouth being open. The higher, the more open - showing more teeth.
 * Ranges from TBD.
 *
 * @return float representing how open mouth is.
 */
- (float) getDegreeMouthOpen;

/**
 * Specifies how much mouth curves upwards to make a smile. The higher, the more curved.
 * Can be used to better detect smile (without needing mouth to be open).
 * Ranges from TBD.
 *
 * @return float representing how much mouth curves upwards.
 */
- (float) getDegreeMouthCurve;

/**
 * Specifies degree of eyes being open. The higher, the more open.
 * Ranges from TBD.
 *
 * @return float representing how open eyes are.
 */
- (float) getDegreeEyesOpen;

/**
 * Specifies x and y coordinates of the nose.
 *
 * @return CGPoint representing coordinates of nose.
 */
- (CGPoint) getNoseCoordinates;

/**
 * Specifies x and y coordinates of the mouth.
 *
 * @return CGPoint representing coordinates of mouth.
 */
- (CGPoint) getMouthCoordinates;

/**
 * Specifies x and y coordinates of the eyes gaze. This is the left and right eye average
 * of the pupils in relation to the eyes.
 *
 * @return CGPoint representing coordinates of the eye gaze.
 */
- (CGPoint) getEyesGaze;

/**
 * Constructor taking initialization values for all internal members, except eye coordinates, and suggestion
 *
 */

- (NSMutableArray *) getLandmarks;

- (id) initWithInternalId:(long)internal_id
              external_id:(long)external_id
             candidate_id:(int)candidate_id
                   center:(CGPoint)center
                dimension:(CGSize)dimension
                 rotation:(Rotation)rotation
               confidence:(float)confidence
         smile_confidence:(float)smile_confidence
                  quality:(float)quality
               mouth_open:(float)mouth_open
              mouth_curve:(float)mouth_curve
                eyes_open:(float)eyes_open
             has_template:(BOOL)has_template;

- (void) setSuggestion:(NSString *)suggestion;

- (void) setEyesLeft:(CGPoint)left_eye
           right_eye:(CGPoint)right_eye;

- (void) setCenterOfFace:(CGPoint)center;

- (void) setNose:(CGPoint)nose_coordinates;

- (void) setMouth:(CGPoint)mouth_coordinates;

- (void) setEyesGaze:(CGPoint)eyes_gaze;

@end

#endif
