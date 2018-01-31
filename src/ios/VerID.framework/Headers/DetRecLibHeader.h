#ifndef DETRECLIBHEADER_H_
#define DETRECLIBHEADER_H_

#import <Foundation/Foundation.h>

// external global variables accessible by derived classes
extern BOOL detect_smile;
extern float smile_detection_threshold;
extern BOOL use_opencv_smile_detection;
extern float face_quality_threshold;
extern float image_crop_area_multiplier;

// external helper method
extern void initialize_helper(NSString *configFileName, BOOL clear_database);

@interface DetRecLib : NSObject

/**
 * Call to see if context has been initialized.
 *
 * @return true if initialized, false otherwise
 */
+ (BOOL) isInitialized;

/**
 * Set initialized flag to status
 */
+ (void) setInitialized:(BOOL)status;

/**
 * Initializes the DetRecLib library by preparing the database and loading/configuring
 * the context.
 * @throws FileNotFoundException
 *             if the resource files cannot be found
 * @throws IOException
 *             if the resource files cannot be read or there are stream issues
 * @throws SQLiteException
 *             if there are problems with the JNI sqlite database
 * @throws OutOfMemoryError
 *             if cannot allocate memory
 * @throws Exception
 *             all other issues
 * @throws Error
 *             all other un-checked issues
 */
+ (void) initializeContext;

/**
 * Initializes the DetRecLib library by preparing the database and loading/configuring
 * the context. If parameter passed is true, then database is cleared; otherwise
 * it remains untouched (or created if needed).
 *
 * @param clear_database
 *            if true, then database is cleared; otherwise it remains untouched
 *            (or created if needed)
 * @throws FileNotFoundException
 *             if the resource files cannot be found
 * @throws IOException
 *             if the resource files cannot be read or there are stream issues
 * @throws SQLiteException
 *             if there are problems with the JNI sqlite database
 * @throws OutOfMemoryError
 *             if cannot allocate memory
 * @throws Exception
 *             all other issues
 * @throws Error
 *             all other un-checked issues
 */
+ (void) initializeContextWithClearDatabase:(BOOL)clear_database;



/**
 * Call to destroy resources, specifically the native libraries.
 * After the resources are destroyed successfully, another call to initialize()
 * must be made to use the library.
 *
 * @throws FileNotFoundException
 *             if the resource files cannot be found
 * @throws IOException
 *             if the resource files cannot be read or there are stream issues
 * @throws SQLiteException
 *             if there are problems with the JNI sqlite database
 * @throws OutOfMemoryError
 *             if cannot allocate memory
 * @throws Exception
 *             all other issues
 * @throws Error
 *             all other un-checked issues
 */
+ (void) destroy;

/**
 * Call to get the absolute file path to the native logs. There are usually
 * several most recent log files in there. Must call initialize() before this call.
 *
 * @return a string representing absolute path to logs directory
 * @throws Exception
 *             if initialize() was not called first and all other issues.
 * @throws Error
 *             all other un-checked issues
 */
+ (NSString *) getLogFilesDir;

@end

#endif

