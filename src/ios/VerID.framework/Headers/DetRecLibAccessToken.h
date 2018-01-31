//
//  DetRecLibAccessToken.h
//  DetRecLib
//
//  Created by Jakub Dolejs on 18/04/2016.
//  Copyright © 2016 Applied Recognition. All rights reserved.
//

#ifndef DetRecLibAccessToken_h
#define DetRecLibAccessToken_h

@interface DetRecLibAccessToken : NSObject

@property NSString *token;
@property NSDate *expiryDate;

+ (DetRecLibAccessToken *)withAccessToken:(NSString *)token
                               expiryDate:(NSDate *)date;

@end


#endif /* DetRecLibAccessToken_h */
