package com.appliedrec.plugin;

import android.app.Activity;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.util.Base64;
import android.util.Base64InputStream;

import androidx.exifinterface.media.ExifInterface;

import com.appliedrec.verid.core2.*;
import com.appliedrec.verid.core2.session.*;
import com.appliedrec.verid.ui2.IVerIDSession;
import com.appliedrec.verid.ui2.VerIDSession;
import com.appliedrec.verid.ui2.VerIDSessionDelegate;

import com.google.gson.Gson;
import com.google.gson.JsonObject;

import org.apache.cordova.CallbackContext;
import org.apache.cordova.CordovaPlugin;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.io.ByteArrayInputStream;
import java.util.Date;

public class VerIDPlugin extends CordovaPlugin {

    protected static boolean TESTING_MODE = false;
    protected CallbackContext mCallbackContext;
    protected VerID verID;

    @Override
    public boolean execute(String action, final JSONArray args, final CallbackContext callbackContext) throws JSONException {
        final Activity activity = cordova.getActivity();
        mCallbackContext = null;

        if (activity == null) {
            callbackContext.error("Activity is null");
            return false;
        }
        if ("setTestingMode".equals(action)) {
            if (args != null && args.length() > 0) {
                try {
                    TESTING_MODE = args.getBoolean(0);
                    callbackContext.success();
                } catch (final Exception e) {
                    e.printStackTrace();
                    callbackContext.error("Not valid argument provided");
                }

            } else {
                callbackContext.error("Not valid argument provided");
            }
            return true;
        } else if ("load".equals(action)) {
            loadVerIDAndRun(args, callbackContext, new Runnable() {
                @Override
                public void run() {
                    callbackContext.success();
                }
            });
            return true;
        } else if ("unload".equals(action)) {
            verID = null;
            callbackContext.success();
            return true;
        } else if ("registerUser".equals(action)) {
            final RegistrationSessionSettings settings;
            String jsonSettings = getArg(args, "settings", String.class);
            if (TESTING_MODE) {
                callbackContext.success(ATTACHMENT_MOCK);
            } else {
                if (jsonSettings != null) {
                    Gson gson = new Gson();
                    settings = gson.fromJson(jsonSettings, RegistrationSessionSettings.class);
                } else {
                    callbackContext.error("Unable to parse session settings");
                    return false;
                }
                loadVerIDAndStartSession(args, callbackContext, settings);
            }
            return true;
        } else if ("authenticate".equals(action)) {
            String jsonSettings = getArg(args, "settings", String.class);
            final AuthenticationSessionSettings settings;
            if (TESTING_MODE) {
                callbackContext.success(ATTACHMENT_MOCK);
            } else {
                if (jsonSettings != null) {
                    Gson gson = new Gson();
                    settings = gson.fromJson(jsonSettings, AuthenticationSessionSettings.class);
                } else {
                    callbackContext.error("Unable to parse session settings");
                    return false;
                }
                loadVerIDAndStartSession(args, callbackContext, settings);
            }
            return true;
        } else if ("captureLiveFace".equals(action)) {
            String jsonSettings = getArg(args, "settings", String.class);
            final LivenessDetectionSessionSettings settings;
            if (TESTING_MODE) {
                callbackContext.success(ATTACHMENT_MOCK);
            } else  {
                if (jsonSettings != null) {
                    Gson gson = new Gson();
                    settings = gson.fromJson(jsonSettings, LivenessDetectionSessionSettings.class);
                } else {
                    callbackContext.error("Unable to parse session settings");
                    return false;
                }
                loadVerIDAndStartSession(args, callbackContext, settings);
            }
            return true;
        } else if ("getRegisteredUsers".equals(action)) {
            loadVerIDAndRun(args, callbackContext, new Runnable() {
                @Override
                public void run() {
                    cordova.getThreadPool().execute(new Runnable() {
                        @Override
                        public void run() {
                            try {
                                String[] users = verID.getUserManagement().getUsers();
                                Gson gson = new Gson();
                                String usersFound = "";
                                if (TESTING_MODE) {
                                    usersFound = "[\"user1\", \"user2\", \"user3\"]";
                                } else {
                                    usersFound = gson.toJson(users, String[].class);
                                }
                                final String jsonUsers = usersFound;

                                cordova.getActivity().runOnUiThread(new Runnable() {
                                    @Override
                                    public void run() {
                                        callbackContext.success(jsonUsers);
                                    }
                                });
                            } catch (final Exception e) {
                                e.printStackTrace();
                                cordova.getActivity().runOnUiThread(new Runnable() {
                                    @Override
                                    public void run() {
                                        callbackContext.error(e.getLocalizedMessage());
                                    }
                                });
                            }
                        }
                    });
                }
            });
            return true;
        } else if ("deleteUser".equals(action)) {
            final String userId = getArg(args, "userId", String.class);
            if (userId != null) {
                loadVerIDAndRun(args, callbackContext, new Runnable() {
                    @Override
                    public void run() {
                        cordova.getThreadPool().execute(new Runnable() {
                            @Override
                            public void run() {
                                try {
                                    verID.getUserManagement().deleteUsers(new String[]{userId});
                                    cordova.getActivity().runOnUiThread(new Runnable() {
                                        @Override
                                        public void run() {
                                            callbackContext.success();
                                        }
                                    });
                                } catch (final Exception e) {
                                    e.printStackTrace();
                                    cordova.getActivity().runOnUiThread(new Runnable() {
                                        @Override
                                        public void run() {
                                            callbackContext.error(e.getLocalizedMessage());
                                        }
                                    });
                                }
                            }
                        });
                    }
                });
            } else {
                callbackContext.error("User id must not be null");
            }
            return true;
        } else if ("compareFaces".equals(action)) {
            final String t1 = getArg(args, "face1", String.class);
            final String t2 = getArg(args, "face2", String.class);
            loadVerIDAndRun(args, callbackContext, new Runnable() {
                @Override
                public void run() {
                    cordova.getThreadPool().execute(new Runnable() {
                        @Override
                        public void run() {
                            try {
                                Gson gson = new Gson();
                                RecognizableFace face1 = gson.fromJson(t1, RecognizableFace.class);
                                RecognizableFace face2 = gson.fromJson(t2, RecognizableFace.class);
                                final float score = verID.getFaceRecognition().compareSubjectFacesToFaces(new RecognizableFace[]{face1}, new RecognizableFace[]{face2});
                                final JsonObject response = new JsonObject();

                                response.addProperty("score", score);
                                response.addProperty("authenticationThreshold", verID.getFaceRecognition().getAuthenticationThreshold());
                                response.addProperty("max", verID.getFaceRecognition().getMaxAuthenticationScore());

                                final String jsonResponse = gson.toJson(response);
                                cordova.getActivity().runOnUiThread(new Runnable() {
                                    @Override
                                    public void run() {
                                        callbackContext.success(jsonResponse);
                                    }
                                });
                            } catch (final Exception e) {
                                e.printStackTrace();
                                cordova.getActivity().runOnUiThread(new Runnable() {
                                    @Override
                                    public void run() {
                                        callbackContext.error(e.getLocalizedMessage());
                                    }
                                });
                            }
                        }
                    });
                }
            });
            return true;
        } else if ("detectFaceInImage".equals(action)) {
            final String image = getArg(args, "image", String.class);
            loadVerIDAndRun(args, callbackContext, new Runnable() {
                @Override
                public void run() {
                    cordova.getThreadPool().execute(new Runnable() {
                        @Override
                        public void run() {
                            try {
                                if (image == null) {
                                    throw new Exception("Image argument is null");
                                }
                                if (!image.startsWith("data:image/")) {
                                    throw new Exception("Invalid image argument");
                                }
                                int dataIndex = image.indexOf("base64,");
                                if (dataIndex == -1) {
                                    throw new Exception("Invalid image argument");
                                }
                                dataIndex += 7;
                                if (dataIndex >= image.length()) {
                                    throw new Exception("Invalid image length");
                                }
                                ByteArrayInputStream inputStream = new ByteArrayInputStream(image.substring(dataIndex).getBytes("UTF-8"));
                                Base64InputStream base64InputStream = new Base64InputStream(inputStream, Base64.NO_WRAP);
                                Bitmap bitmap = BitmapFactory.decodeStream(base64InputStream);
                                if (bitmap == null) {
                                    throw new Exception("Bitmap decoding error");
                                }
                                VerIDImageBitmap verIDImage = new VerIDImageBitmap(bitmap,  ExifInterface.ORIENTATION_NORMAL);
                                Face[] faces = verID.getFaceDetection().detectFacesInImage(verIDImage.createFaceDetectionImage(), 1, 0);
                                if (faces.length == 0) {
                                    throw new Exception("Face not found");
                                }
                                RecognizableFace[] recognizableFaces = verID.getFaceRecognition().createRecognizableFacesFromFaces(faces, verIDImage);
                                Gson gson = new Gson();
                                final String encodedFace = gson.toJson(recognizableFaces[0]);
                                cordova.getActivity().runOnUiThread(new Runnable() {
                                    @Override
                                    public void run() {
                                        callbackContext.success(encodedFace);
                                    }
                                });
                            } catch (final Exception e) {
                                cordova.getActivity().runOnUiThread(new Runnable() {
                                    @Override
                                    public void run() {
                                        callbackContext.error(e.getLocalizedMessage());
                                    }
                                });
                            }
                        }
                    });
                }
            });
            return true;
        }
        return false;
    }

    protected void loadVerIDAndStartSession(JSONArray args, final CallbackContext callbackContext, VerIDSessionSettings settings) {
        cordova.setActivityResultCallback(this);
        loadVerIDAndRun(args, callbackContext, new Runnable() {
            @Override
            public void run() {
                Activity activity = cordova.getActivity();
                if (activity == null) {
                    callbackContext.error("Cordova activity is null");
                    return;
                }
                if (activity.isDestroyed()) {
                    callbackContext.error("Activity is destroyed");
                    return;
                }
                mCallbackContext = callbackContext;
                VerIDSession session = new VerIDSession(verID, settings);
                session.setDelegate(new SessionDelegate());
                session.start();
            }
        });
    }

    protected void loadVerIDAndRun(final JSONArray args, final CallbackContext callbackContext, final Runnable runnable) {
        final Activity activity = cordova.getActivity();
        if (activity == null) {
            callbackContext.error("Cordova activity is null");
            return;
        }
        if (activity.isDestroyed()) {
            callbackContext.error("Activity is destroyed");
            return;
        }
        if (verID != null) {
            runnable.run();
        } else {
            String password = getArg(args, "password", String.class);
            VerIDFactory verIDFactory = new VerIDFactory(activity, new VerIDFactoryDelegate() {
                @Override
                public void onVerIDCreated(VerIDFactory verIDFactory, VerID verID) {
                    com.appliedrec.plugin.VerIDPlugin.this.verID = verID;
                    runnable.run();
                }

                @Override
                public void onVerIDCreationFailed(VerIDFactory verIDFactory, Exception e) {
                    callbackContext.error(e.getLocalizedMessage());
                }

            });
            if (password != null) {
                verIDFactory.setVeridPassword(password);
            }
            verIDFactory.createVerID();
        }
    }

    protected  <T> T getArg(JSONArray args, String key, Class<T> type) {
        for (int i=0; args != null && i<args.length(); i++) {
            JSONObject arg = null;
            try {
                arg = args.getJSONObject(i);
            } catch (JSONException e) {
                e.printStackTrace();
            }
            if (arg != null && arg.has(key)) {
                try {
                    return (T)arg.get(key);
                } catch (Exception e) {
                    e.printStackTrace();
                }
            }
        }
        return null;
    }

    private final String FACE_MOCK = "{\"x\":-8.384888,\"y\":143.6514,\"width\":331.54974,\"height\":414.43723,\"yaw\":-0.07131743," +
            "\"pitch\":-6.6307373,\"roll\":-2.5829313,\"quality\":9.658932," +
            "\"leftEye\":[101,322.5],\"rightEye\":[213,321]," +
            "\"data\":\"TESTING_DATA\"," +
            "\"faceTemplate\":{\"data\":\"FACE_TEMPLATE_TEST_DATA\",\"version\":1}}";
    private final String ATTACHMENT_MOCK = "{\"attachments\": ["+
            "{\"recognizableFace\": " + FACE_MOCK + ", \"image\": \"TESTING_IMAGE\", \"bearing\": \"STRAIGHT\"}" +
            "]}";

    class SessionDelegate implements VerIDSessionDelegate {

        @Override
        public void onSessionFinished(IVerIDSession<?> session, VerIDSessionResult result) {
            if (!result.getError().isPresent() && mCallbackContext != null) {
                cordova.getThreadPool().execute(new Runnable() {
                    @Override
                    public void run() {
                        Gson gson = new Gson();
                        VerIDSessionResult sessionResult = result;
                        if (result == null) {
                            Date date = new Date();
                            sessionResult = new VerIDSessionResult(new VerIDSessionException(new Exception("Unknown failure")), date.getTime(), date.getTime(), null);
                        }
                        final String response = gson.toJson(result, VerIDSessionResult.class);
                        cordova.getActivity().runOnUiThread(new Runnable() {
                            @Override
                            public void run() {
                                if (mCallbackContext == null) {
                                    return;
                                }
                                final Activity activity = cordova.getActivity();
                                if (activity == null) {
                                    mCallbackContext.error("Cordova activity is null");
                                    return;
                                }
                                if (activity.isDestroyed()) {
                                    mCallbackContext.error("Activity is destroyed");
                                    return;
                                }
                                mCallbackContext.success(response);
                                mCallbackContext = null;
                            }
                        });
                    }
                });
            }
        }
    }

}
