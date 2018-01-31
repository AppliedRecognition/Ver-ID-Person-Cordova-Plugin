#ifndef DETRECHELPER_H_
#define DETRECHELPER_H_

#import <Foundation/Foundation.h>
#import <Photos/Photos.h>

#import "FBFace.h"
#import "FaceAuthenticationResults.h"
#import "DetRecMessenger.h"

#ifdef __cplusplus
#define MY_EXTERN_C extern "C"
#else
#define MY_EXTERN_C extern
#endif

MY_EXTERN_C void initializeContextCPP( NSString *cachePath, NSString *modelsDir,
                              NSString *databaseRelPath, NSString *currentEncryptionKeyAlias,
                              int matrixTemplateVersion, int defaultSubjectSuggestionAccuracy,
                              int detectorVersion, float detectionSizeRange, float detectionSizeRangeCropped,
                              int eyeDetectionVariant, 
                              int detectionRollRangeLarge, int detectionRollRangeSmall,
                              int detectionYawRangeLarge, int detectionYawRangeSmall,
                              float detectionConfidenceThreshold, float qualityThreshold, float landmarkTrackingQualityThreshold,
                              bool loadGreyscale,
                              bool attemptMultiThreading, NSString *logsDir, NSString *logLevel, int logsFileMax,
                              bool normalizeFaceCoordinates,
                              int defaultSecurityLevel, bool performAuthenticationUsingSubjectTemplate,
                              NSArray *recognitionThresholds, NSArray *authenticationThresholds,
                              bool detectSmile, int yawPitchVariant, int lightingMatrix, int lightingCompensation,
                                      int poseCompensation,
                              float authenticationThresholdIDCard, float detectionSizeRangeIDCard,
                              float detectionConfidenceThresholdIDCard, float qualityThresholdIDCard,
                              int detectionRollRangeLargeIDCard, int detectionRollRangeSmallIDCard);
MY_EXTERN_C void destroyContextCPP();

MY_EXTERN_C bool pollBackgroundProcessingByFaceIdCPP( long faceId, NSMutableArray *outFaces);
MY_EXTERN_C int detectFacesWithDataCPP( CGImageRef image, int orientation, NSString *imageHash, InFace inFaces[], int inFacesCount, NSMutableArray *outFaces, int maxFacesToFind, bool antiSpoofing, bool trackFace, bool backgroundProcessing );
MY_EXTERN_C int detectFacesWithDataReducedCPP( CGImageRef image, int orientation, NSString *imageHash, InFace inFaces[], int inFacesCount, NSMutableArray *outFaces, int maxFacesToFind, int crop_x, int crop_y, int crop_w, int crop_h, int templateExtractionType, bool antiSpoofing);
MY_EXTERN_C void outputDebugImagesForFaceCPP(CGImageRef image, int orientation, FBFace *face, int faceWidth, NSString *path, NSString *baseName);
MY_EXTERN_C int detectFacesWithDataWithTrickleCPP( CGImageRef image, int orientation, NSString *imageHash, InFace inFaces[], int inFacesCount, DetRecMessenger messenger, bool antiSpoofing );
MY_EXTERN_C int detectFacesCPP( NSString *imageFile, NSString *imageHash, InFace inFaces[], int inFacesCount, NSMutableArray *outFaces, int rotateInMultiples90Degrees, bool antiSpoofing );
MY_EXTERN_C int detectFacesWithTrickleCPP( NSString *imageFile, NSString *imageHash, InFace inFaces[], int inFacesCount, int rotateInMultiples90Degrees, DetRecMessenger messenger, bool antiSpoofing );
MY_EXTERN_C void tagFaceCPP( long faceId, NSString *personName );
MY_EXTERN_C void tagFacesCPP( NSArray *faceIds, NSString *personName );
MY_EXTERN_C NSString * suggestSubjectCPP( long faceId );
MY_EXTERN_C NSDictionary * suggestSubjectForFacesCPP(NSArray *faceIds, NSArray *subjects, NSDictionary *blacklist);
MY_EXTERN_C int getAllSubjectNamesCPP( NSMutableArray *suggestions );
MY_EXTERN_C FBFace * loadFaceCPP( long faceId );
MY_EXTERN_C void deleteFaceCPP( long faceId );
MY_EXTERN_C void deleteFacesCPP( NSArray *faceIds );
MY_EXTERN_C void deleteSubjectCPP( NSString *personName );
MY_EXTERN_C CGSize suggestedScaledSizeCPP(int width, int height);
MY_EXTERN_C FaceAuthenticationResults * authenticateFaceToSubjectCPP( long faceId, NSString *personName, bool isComparisonToIDCard );
MY_EXTERN_C int getSubjectSuggestionAccuracyCPP();
MY_EXTERN_C int getSecurityLevelCPP();
MY_EXTERN_C void setSubjectSuggestionAccuracyCPP(int enum_id);
MY_EXTERN_C void setSecurityLevelCPP(int enum_id);
MY_EXTERN_C NSArray<NSNumber *> * extractFaceTemplateCPP(long faceId);
    
#endif
