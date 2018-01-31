//
//  DetRecLibErrors.h
//  DetRecLib
//
//  Created by Tom Wysocki on 2015-03-03.
//  Copyright (c) 2015 Applied Recognition. All rights reserved.
//

#ifndef DetRecLib_DetRecLibErrors_h
#define DetRecLib_DetRecLibErrors_h

#import <Foundation/Foundation.h>

#ifdef __cplusplus
#define MY_EXTERN_C extern "C"
#else
#define MY_EXTERN_C extern
#endif

typedef NS_ENUM (NSInteger, DetRecLibErrorCode) {
    FileNotFoundException=1000,
    SQLiteException,
    IOException,
    OutOfMemoryError,
    NetworkError,
    ClientAuthenticationError,
    Exception,
    Error
};

MY_EXTERN_C NSString *DetRecLibErrorDomain;

MY_EXTERN_C NSString * getErrorDescription(DetRecLibErrorCode code);
MY_EXTERN_C DetRecLibErrorCode getErrorCode(NSString *str);
MY_EXTERN_C void convertNSExceptionToNSError(NSException *exc, NSError **error);

#endif
