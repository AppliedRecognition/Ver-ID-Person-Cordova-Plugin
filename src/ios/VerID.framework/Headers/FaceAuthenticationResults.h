//
//  FaceAuthenticationResults.h
//  DetRecLib
//
//  Created by Tom Wysocki on 2015-12-21.
//  Copyright © 2015 Applied Recognition. All rights reserved.
//

#ifndef FaceAuthenticationResults_h
#define FaceAuthenticationResults_h

#import "FBFace.h"

// Authentication results class

@interface FaceAuthenticationResults : NSObject <NSCopying>

@property BOOL authenticated;
@property CGFloat confidenceScore;
@property BOOL smileDetected;
@property CGFloat smileConfidenceScore;
@property NSString *subjectId;
@property FBFace *faceObj;

- (void) setWithObject:(FaceAuthenticationResults *)obj;
- (id) copyWithZone:(NSZone *)zone;

@end

#endif /* FaceAuthenticationResults_h */
