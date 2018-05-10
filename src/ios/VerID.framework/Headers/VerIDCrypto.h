//
//  VerIDCrypto.h
//  VerID
//
//  Created by Jakub Dolejs on 10/05/2018.
//  Copyright © 2018 Applied Recognition, Inc. All rights reserved.
//

#ifndef VerIDCrypto_h
#define VerIDCrypto_h

#import <Foundation/Foundation.h>

@interface VerIDCrypto : NSObject

+ (NSData *) hmacSha256:(NSData *) key
                   data:(NSData *) data;

+ (NSData *) sha256Hash:(NSData *) data;

@end

#endif /* VerIDCrypto_h */
