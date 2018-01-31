#ifndef FACEDETECTION_H_
#define FACEDETECTION_H_

#import <Foundation/Foundation.h>
#import <Photos/Photos.h>

#import "DetRecLibHeader.h"
#import "DetRecMessenger.h"
#import "FBFace.h"
#import "DetRecLibErrors.h"

@interface FaceDetection : DetRecLib

/**
 * Find faces in an image.
 *
 * @param filePath
 *            the path to the file to detect
 * @param fileHash
 *            the hash of file for consistent indexing purposes
 * @param error
 *             an address to NSError pointer. Will save error here
 *             if method returns nil, unless error pointer is nil.
 * @return an array of FBFace objects found in the image. May be an empty array.
 *         Face coordinates are in relative form (between 0 and 1) unless otherwise
 *         specified in configuration. They are in reference to the upright image,
 *         after EXIF orientation is applied.
 *         If nil, error occured.
 */
+ (NSArray *) findFacesInFile:(NSString *)filePath
                     withHash:(NSString *)fileHash
                        error:(NSError **)error;

#ifdef TARGET_OS_OSX
#else
/**
 * Find faces in an image, by passing asset instead of filename.
 *
 * @param asset
 *            the PHAsset of the image to detect
 * @param fileHash
 *            the hash of file for consistent indexing purposes
 * @param error
 *             an address to NSError pointer. Will save error here
 *             if method returns nil, unless error pointer is nil.
 * @return an array of FBFace objects found in the image. May be an empty array.
 *         Face coordinates are in relative form (between 0 and 1) unless otherwise
 *         specified in configuration. They are in reference to the upright image,
 *         after EXIF orientation is applied.
 *         If nil, error occured.
 */
+ (NSArray *) findFacesInAsset:(PHAsset *)asset
                      withHash:(NSString *)fileHash
                         error:(NSError **)error;
#endif
/**
 * Find faces in an image taking into account the faces already found by
 * iOS native face detector.
 *
 * @param filePath
 *            the path to the file to detect
 * @param fileHash
 *            the hash of file for consistent indexing purposes
 * @param faces
 *            an array of InFace types detected by the native face detector
 * @param facesCount
 *            the size of faces array
 * @param sampleSize
 *            a scale factor at which the face coordinates are given relative
 *            to the full size image
 * @param error
 *             an address to NSError pointer. Will save error here
 *             if method returns nil, unless error pointer is nil.
 * @return an array of FBFace objects found in the image. May be an empty array.
 *         Face coordinates are in relative form (between 0 and 1) unless otherwise
 *         specified in configuration. They are in reference to the upright image,
 *         after EXIF orientation is applied.
 *         If nil, error occured.
 */
+ (NSArray *) findFacesInFile:(NSString *)filePath
                     withHash:(NSString *)fileHash
                    withFaces:(InFace[])faces
               withFacesCount:(int)facesCount
               withSampleSize:(int)sampleSize
                        error:(NSError **)error;

#ifdef TARGET_OS_OSX
#else
/**
 * Find faces in an image taking into account the faces already found by
 * iOS native face detector, by passing asset instead of filename.
 *
 * @param asset
 *            the PHAsset of the image to detect
 * @param fileHash
 *            the hash of file for consistent indexing purposes
 * @param faces
 *            an array of InFace types detected by the native face detector
 * @param facesCount
 *            the size of faces array
 * @param sampleSize
 *            a scale factor at which the face coordinates are given relative
 *            to the full size image
 * @param error
 *             an address to NSError pointer. Will save error here
 *             if method returns nil, unless error pointer is nil.
 * @return an array of FBFace objects found in the image. May be an empty array.
 *         Face coordinates are in relative form (between 0 and 1) unless otherwise
 *         specified in configuration. They are in reference to the upright image,
 *         after EXIF orientation is applied.
 *         If nil, error occured.
 */
+ (NSArray *) findFacesInAsset:(PHAsset *)asset
                      withHash:(NSString *)fileHash
                     withFaces:(InFace[])faces
                withFacesCount:(int)facesCount
                withSampleSize:(int)sampleSize
                         error:(NSError **)error;
#endif

/**
 * Find faces in an image.
 *
 * @param filePath
 *            the path to the file to detect
 * @param fileHash
 *            the hash of file for consistent indexing purposes
 * @param error
 *             an address to NSError pointer. Will save error here
 *             if method returns nil, unless error pointer is nil.
 * @param messenger
 *            a custom messenger block function which will be called
 *            with the resulting trickle of faces.
 *            Face coordinates are in relative form (between 0 and 1) unless otherwise
 *            specified in configuration. They are in reference to the upright image,
 *            after EXIF orientation is applied.
 * @return FALSE if error, TRUE if successful
 */
+ (BOOL) findFacesInFile:(NSString *)filePath
                withHash:(NSString *)fileHash
                   error:(NSError **)error
           withMessenger:(DetRecMessenger)messenger;

#ifdef TARGET_OS_OSX
#else
/**
 * Find faces in an image, by passing asset instead of filename.
 *
 * @param asset
 *            the PHAsset of the image to detect
 * @param fileHash
 *            the hash of file for consistent indexing purposes
 * @param error
 *             an address to NSError pointer. Will save error here
 *             if method returns nil, unless error pointer is nil.
 * @param messenger
 *            a custom messenger block function which will be called
 *            with the resulting trickle of faces.
 *            Face coordinates are in relative form (between 0 and 1) unless otherwise
 *            specified in configuration. They are in reference to the upright image,
 *            after EXIF orientation is applied.
 * @return FALSE if error, TRUE if successful
 */
+ (BOOL) findFacesInAsset:(PHAsset *)asset
                 withHash:(NSString *)fileHash
                    error:(NSError **)error
            withMessenger:(DetRecMessenger)messenger;
#endif

/**
 * Find faces in an image taking into account the faces already found by
 * iOS native face detector.
 *
 * @param filePath
 *            the path to the file to detect
 * @param fileHash
 *            the hash of file for consistent indexing purposes
 * @param faces
 *            an array of InFace types detected by the native face detector
 * @param facesCount
 *            the size of faces array
 * @param sampleSize
 *            a scale factor at which the face coordinates are given relative
 *            to the full size image
 * @param error
 *             an address to NSError pointer. Will save error here
 *             if method returns nil, unless error pointer is nil.
 * @param messenger
 *            a custom messenger block function which will be called
 *            with the resulting trickle of faces.
 *            Face coordinates are in relative form (between 0 and 1) unless otherwise
 *            specified in configuration. They are in reference to the upright image,
 *            after EXIF orientation is applied.
 * @return FALSE if error, TRUE if successful
 */
+ (BOOL) findFacesInFile:(NSString *)filePath
                withHash:(NSString *)fileHash
               withFaces:(InFace[])faces
          withFacesCount:(int)facesCount
          withSampleSize:(int)sampleSize
                   error:(NSError **)error
           withMessenger:(DetRecMessenger)messenger;

#ifdef TARGET_OS_OSX
#else
/**
 * Find faces in an image taking into account the faces already found by
 * iOS native face detector, by passing asset instead of filename.
 *
 * @param asset
 *            the PHAsset of the image to detect
 * @param fileHash
 *            the hash of file for consistent indexing purposes
 * @param faces
 *            an array of InFace types detected by the native face detector
 * @param facesCount
 *            the size of faces array
 * @param sampleSize
 *            a scale factor at which the face coordinates are given relative
 *            to the full size image
 * @param error
 *             an address to NSError pointer. Will save error here
 *             if method returns nil, unless error pointer is nil.
 * @param messenger
 *            a custom messenger block function which will be called
 *            with the resulting trickle of faces.
 *            Face coordinates are in relative form (between 0 and 1) unless otherwise
 *            specified in configuration. They are in reference to the upright image,
 *            after EXIF orientation is applied.
 * @return FALSE if error, TRUE if successful
 */
+ (BOOL) findFacesInAsset:(PHAsset *)asset
                 withHash:(NSString *)fileHash
                withFaces:(InFace[])faces
           withFacesCount:(int)facesCount
           withSampleSize:(int)sampleSize
                    error:(NSError **)error
            withMessenger:(DetRecMessenger)messenger;
#endif

/**
 * Signal to the detection service that a face has been deleted. If the face
 * was previously tagged for a subject, it will be first untagged and then
 * deleted.
 *
 * @param faceId
 *            the id of the face to be deleted
 * @param error
 *             an address to NSError pointer. Will save error here
 *             if method returns nil, unless error pointer is nil.
 * @return FALSE if error, TRUE if successful
 */
+ (BOOL) deleteFace:(long)faceId
              error:(NSError **)error;

/**
 * Signal to the detection service that a group of faces have been deleted. If a face
 * was previously tagged for a subject, it will be first untagged and then
 * deleted.
 *
 * @param faceIds
 *            an array of ids of faces to be deleted
 *            Each entry should be of type NSNumber and contain integers
 *            of type long.
 * @param error
 *             an address to NSError pointer. Will save error here
 *             if method returns nil, unless error pointer is nil.
 * @return FALSE if error, TRUE if successful
 */
+ (BOOL) deleteFaces:(NSArray *)faceIds
               error:(NSError **)error;

/**
 * Loads a face from the native database, as if it was returned by the
 * findFaces() call. The face corresponding to the faceId must have been
 * suitable for recognition. See <code>FBFace.isSuitableForRecognition()</code>
 * Faces which were not suitable cannot be recovered from the database.
 *
 * @param faceId
 *            the id of the face to be loaded. Must be an id previously
 *            returned by findFaces() and must have been suitable for recognition.
 * @param error
 *             an address to NSError pointer. Will save error here
 *             if method returns nil, unless error pointer is nil.
 * @return FBFace object with all fields filled in, or nil if error
 */
+ (FBFace *) loadFace:(long)faceId
                error:(NSError **)error;

@end

#endif
