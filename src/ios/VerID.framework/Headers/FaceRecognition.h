#ifndef FACERECOGNITION_H_
#define FACERECOGNITION_H_

#import <Foundation/Foundation.h>
#import "DetRecLibHeader.h"
#import "DetRecLibErrors.h"

typedef NS_ENUM(NSInteger, FaceRecognitionSubjectSuggestionAccuracy) {
    FaceRecognitionSubjectSuggestionAccuracyLowest = 0,
    FaceRecognitionSubjectSuggestionAccuracyLow = 1,
    FaceRecognitionSubjectSuggestionAccuracyNormal = 2,
    FaceRecognitionSubjectSuggestionAccuracyHigh = 3,
    FaceRecognitionSubjectSuggestionAccuracyHighest = 4
};

@interface FaceRecognition : DetRecLib

/**
 * Get suggestions for the given face, without providing a blacklist option.
 * Face is compared to all possible subjects in the database.
 *
 * @param faceId
 *            the id of the face for which to find suggestions
 * @param error
 *             an address to NSError pointer. Will save error here
 *             if method returns nil, unless error pointer is nil.
 * @return the string id of the suggested subject or empty if no match
 *         found, or nil if error.
 */
+ (NSString *) suggestSubject:(long)faceId
                        error:(NSError **)error;

/**
 * Get suggestions for the given face, with optional blacklist.
 * Face is compared to all possible subjects in the database.
 * If a suggestion is on the blacklist, the next lower scoring
 * suggestion will be returned, if any. If no suggestions that
 * meet the recognition threshold are available, empty string will
 * be returned.
 *
 * @param faceId
 *            the id of the face for which to find suggestions
 * @param blacklist
 *             an array of NSString objects containing the subjects
 *             that are blacklisted and should be ignored from
 *             suggestions. If nil, blacklist is ignored.
 * @param error
 *             an address to NSError pointer. Will save error here
 *             if method returns nil, unless error pointer is nil.
 * @return the string id of the suggested subject or empty if no match
 *         found, or nil if error.
 */
+ (NSString *) suggestSubject:(long)faceId
            blacklistSubjects:(NSArray *)blacklist
                        error:(NSError **)error;

/**
 * Get suggestions for the given faces, checked only against subjects
 * provided and ignoring the subjects on the blacklist.
 *
 * @param faceIds
 *            an array of ids of faces for which to find suggestions.
 *            Each entry should be of type NSNumber and contain integers
 *            of type long.
 * @param subjects
 *            an array of subject ids to search against. Only the subjects
 *            within this array will be compared against. To search through
 *            all available subjects, set this parameter to nil.
 *            Each entry in the array should be of type NSString.
 * @param blacklist
 *             map of subjects which are blacklisted. Keys are some or all
 *             faces ids passed of type NSNumber containing long types.
 *             Each value is an NSArray of NSString objects containing the subjects
 *             that are blacklisted for the corresponding face.
 *             If a suggestion for the given face is on the blacklist, the next
 *             lower scoring suggestion will be assigned, if any.
 *             If nil, blacklist is ignored.
 * @param error
 *             an address to NSError pointer. Will save error here
 *             if method returns nil, unless error pointer is nil.
 * @return the map of face suggestions, keys being all face ids passed of type
 *             NSNumber containing long types, and the values
 *             being possible suggestions of type NSString. If a face
 *             has no suggestion from the available set of subjects ignoring the
 *             blacklisted subjects, it will be an empty string.
 *             Return nil if error.
 */
+ (NSDictionary *) suggestSubjectForFaces:(NSArray *)faceIds
                             fromSubjects:(NSArray *)subjects
                        blacklistSubjects:(NSDictionary *)blacklist
                                    error:(NSError **)error;

/**
 * Tag or untag the given face.
 *
 * @param faceId
 *            the face id of the face to tag or untag.
 * @param subjectId
 *            the id of the subject to tag or nil or empty string to untag.
 *            If the face was previously tagged with a different subject, it will
 *            first be untagged and then retagged with the new subject.
 *            If a face was never tagged and request is to untag, it will be ignored.
 *            If subject id has never been used, a new subject template will be created.
 * @param error
 *             an address to NSError pointer. Will save error here
 *             if method returns nil, unless error pointer is nil.
 * @return FALSE if error, TRUE if successful
 */
+ (BOOL) tagFace:(long)faceId
     withSubject:(NSString *)subjectId
           error:(NSError **)error;

/**
 * Tag or untag the given array of faces in one call.
 *
 * @param faceIds
 *            the array of face ids to be tagged or untagged.
 *            Each entry should be of type NSNumber and contain integers
 *            of type long.
 * @param subjectId
 *            the id of the subject to tag or nil or empty string to untag.
 *            If any face was previously tagged with a different subject, it will
 *            first be untagged and then retagged with the new subject.
 *            If any face was never tagged and request is to untag, it will be ignored.
 *            If subject id has never been used, a new subject template will be created.
 * @param error
 *             an address to NSError pointer. Will save error here
 *             if method returns nil, unless error pointer is nil.
 * @return FALSE if error, TRUE if successful
 */
+ (BOOL) tagFaces:(NSArray *)faceIds
      withSubject:(NSString *)subjectId
            error:(NSError **)error;

/**
 * Signal to the recognition service that a subject has been deleted.
 *
 * @param subjectId
 *            the id of the deleted subject
 * @param error
 *             an address to NSError pointer. Will save error here
 *             if method returns nil, unless error pointer is nil.
 * @return FALSE if error, TRUE if successful
 */
+ (BOOL) deleteSubject:(NSString *)subjectId
                 error:(NSError **)error;

/**
 * Get all the subject names/ids stored in recognition database
 *
 * @param error
 *             an address to NSError pointer. Will save error here
 *             if method returns nil, unless error pointer is nil.
 * @return string array of all subject ids, or nil if error
 */
+ (NSArray *) getAllSubjectIds:(NSError **)error;

/**
 * Set the subject suggestion accuracy as an integer enum, and save to DB. 
 * The default value is FaceRecognitionSubjectSuggestionAccuracyNormal.
 *
 * The higher the accuracy, the more difficult it is to get suggestions for
 * a face, but also it is less likely to get incorrect suggestions.
 *
 * @param subjectSuggestionAccuracy
 *            An integer enum representing the suggestion accuracy.
 * @param error
 *             an address to NSError pointer. Will save error here
 *             if method returns false, unless error pointer is nil.
 * @return If false, error occured; true otherwise.
 */
+ (BOOL) setSubjectSuggestionAccuracy:(FaceRecognitionSubjectSuggestionAccuracy)subjectSuggestionAccuracy
                                error:(NSError **)error;

/**
 * Get the saved subject suggestion accuracy as an integer enum.
 * The default starting value, unless changed, is FaceRecognitionSubjectSuggestionAccuracyNormal.
 *
 * @param subjectSuggestionAccuracy
 *            A pointer to an integer enum, which will be set with
 *            a result value representing the suggestion accuracy.
 * @param error
 *             an address to NSError pointer. Will save error here
 *             if method returns false, unless error pointer is nil.
 * @return If false, error occured; true otherwise.
 */
+ (BOOL) getSubjectSuggestionAccuracy:(FaceRecognitionSubjectSuggestionAccuracy *)subjectSuggestionAccuracy
                                error:(NSError **)error;

@end

#endif
