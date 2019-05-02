package com.appliedrec.plugin;

import android.app.Activity;
import android.content.Intent;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.os.Bundle;
import android.util.Base64;
import android.util.Base64InputStream;

import com.appliedrec.verid.core.AuthenticationSessionSettings;
import com.appliedrec.verid.core.Face;
import com.appliedrec.verid.core.FaceDetectionRecognitionFactory;
import com.appliedrec.verid.core.LivenessDetectionSessionSettings;
import com.appliedrec.verid.core.RecognizableFace;
import com.appliedrec.verid.core.RegistrationSessionSettings;
import com.appliedrec.verid.core.VerID;
import com.appliedrec.verid.core.VerIDFactory;
import com.appliedrec.verid.core.VerIDFactoryDelegate;
import com.appliedrec.verid.core.VerIDImage;
import com.appliedrec.verid.core.VerIDSessionResult;
import com.appliedrec.verid.core.VerIDSessionSettings;
import com.appliedrec.verid.ui.VerIDSessionActivity;
import com.appliedrec.verid.ui.VerIDSessionIntent;
import com.google.gson.Gson;

import org.apache.cordova.CallbackContext;
import org.apache.cordova.CordovaPlugin;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.io.ByteArrayInputStream;

public class VerIDPlugin extends CordovaPlugin {

    protected static final int REQUEST_CODE_REGISTER = 1;
    protected static final int REQUEST_CODE_AUTHENTICATE = 2;
    protected static final int REQUEST_CODE_DETECT_LIVENESS = 3;
    protected CallbackContext mCallbackContext;
    private VerID verID;

    @Override
    public boolean execute(String action, final JSONArray args, final CallbackContext callbackContext) throws JSONException {
        final Activity activity = cordova.getActivity();
        if (mCallbackContext != null) {
            mCallbackContext.error("Execute called before finishing previous command");
        }
        mCallbackContext = null;

        if (activity == null) {
            callbackContext.error("Activity is null");
            return false;
        }
        if ("load".equals(action)) {
            loadVerIDAndRun(args, callbackContext, new VerIDFactoryDelegate() {
                @Override
                public void veridFactoryDidCreateEnvironment(VerIDFactory verIDFactory, VerID verID) {
                    callbackContext.success();
                }

                @Override
                public void veridFactoryDidFailWithException(VerIDFactory verIDFactory, Exception e) {
                    callbackContext.error(e.getLocalizedMessage());
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
            if (jsonSettings != null) {
                Gson gson = new Gson();
                settings = gson.fromJson(jsonSettings, RegistrationSessionSettings.class);
            } else {
                callbackContext.error("Unable to parse session settings");
                return false;
            }
            loadVerIDAndStartSession(args, callbackContext, settings, REQUEST_CODE_REGISTER);
            return true;
        } else if ("authenticate".equals(action)) {
            String jsonSettings = getArg(args, "settings", String.class);
            final AuthenticationSessionSettings settings;
            if (jsonSettings != null) {
                Gson gson = new Gson();
                settings = gson.fromJson(jsonSettings, AuthenticationSessionSettings.class);
            } else {
                callbackContext.error("Unable to parse session settings");
                return false;
            }
            loadVerIDAndStartSession(args, callbackContext, settings, REQUEST_CODE_AUTHENTICATE);
            return true;
        } else if ("captureLiveFace".equals(action)) {
            String jsonSettings = getArg(args, "settings", String.class);
            final LivenessDetectionSessionSettings settings;
            if (jsonSettings != null) {
                Gson gson = new Gson();
                settings = gson.fromJson(jsonSettings, LivenessDetectionSessionSettings.class);
            } else {
                callbackContext.error("Unable to parse session settings");
                return false;
            }
            loadVerIDAndStartSession(args, callbackContext, settings, REQUEST_CODE_DETECT_LIVENESS);
            return true;
        } else if ("getRegisteredUsers".equals(action)) {
            loadVerIDAndRun(args, callbackContext, new VerIDFactoryDelegate() {
                @Override
                public void veridFactoryDidCreateEnvironment(VerIDFactory verIDFactory, final VerID verID) {
                    cordova.getThreadPool().execute(new Runnable() {
                        @Override
                        public void run() {
                            try {
                                String[] users = verID.getUserManagement().getUsers();
                                Gson gson = new Gson();
                                final String jsonUsers = gson.toJson(users, String[].class);
                                cordova.getActivity().runOnUiThread(new Runnable() {
                                    @Override
                                    public void run() {
                                        callbackContext.success(jsonUsers);
                                    }
                                });
                            } catch (Exception e) {
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

                @Override
                public void veridFactoryDidFailWithException(VerIDFactory verIDFactory, Exception e) {
                    callbackContext.error(e.getLocalizedMessage());
                }
            });
            return true;
        } else if ("deleteUser".equals(action)) {
            final String userId = getArg(args, "userId", String.class);
            if (userId != null) {
                loadVerIDAndRun(args, callbackContext, new VerIDFactoryDelegate() {
                    @Override
                    public void veridFactoryDidCreateEnvironment(VerIDFactory verIDFactory, final VerID verID) {
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

                    @Override
                    public void veridFactoryDidFailWithException(VerIDFactory verIDFactory, Exception e) {
                        callbackContext.error(e.getLocalizedMessage());
                    }
                });
            } else {
                callbackContext.error("User id must not be null");
            }
            return true;
        } else if ("compareFaces".equals(action)) {
            final String t1 = getArg(args, "face1", String.class);
            final String t2 = getArg(args, "face2", String.class);
            loadVerIDAndRun(args, callbackContext, new VerIDFactoryDelegate() {
                @Override
                public void veridFactoryDidCreateEnvironment(VerIDFactory verIDFactory, final VerID verID) {
                    cordova.getThreadPool().execute(new Runnable() {
                        @Override
                        public void run() {
                            try {
                                Gson gson = new Gson();
                                RecognizableFace faceTemplate1 = gson.fromJson(t1, RecognizableFace.class);
                                RecognizableFace faceTemplate2 = gson.fromJson(t2, RecognizableFace.class);
                                final float score = verID.getFaceRecognition().compareSubjectFacesToFaces(new RecognizableFace[]{faceTemplate1}, new RecognizableFace[]{faceTemplate2});
                                final float threshold = verID.getFaceRecognition().getAuthenticationThreshold();
                                final float max = verID.getFaceRecognition().getMaxAuthenticationScore();
                                final JSONObject response = new JSONObject();
                                response.put("score", score);
                                response.put("threshold", threshold);
                                response.put("max", max);
                                cordova.getActivity().runOnUiThread(new Runnable() {
                                    @Override
                                    public void run() {
                                        callbackContext.success(response);
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

                @Override
                public void veridFactoryDidFailWithException(VerIDFactory verIDFactory, Exception e) {
                    callbackContext.error(e.getLocalizedMessage());
                }
            });
            return true;
        } else if ("detectFaceInImage".equals(action)) {
            final String image = getArg(args, "image", String.class);
            loadVerIDAndRun(args, callbackContext, new VerIDFactoryDelegate() {
                @Override
                public void veridFactoryDidCreateEnvironment(VerIDFactory verIDFactory, final VerID verID) {
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
                                VerIDImage verIDImage = new VerIDImage(bitmap);
                                Face[] faces = verID.getFaceDetection().detectFacesInImage(verIDImage, 1, 0);
                                if (faces.length == 0) {
                                    throw new Exception("No face found");
                                }
                                Gson gson = new Gson();
                                final String encodedFace = gson.toJson(faces[0]);
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

                @Override
                public void veridFactoryDidFailWithException(VerIDFactory verIDFactory, Exception e) {
                    callbackContext.error(e.getLocalizedMessage());
                }
            });
            return true;
        }
        return false;
    }

    @Override
    public void onActivityResult(int requestCode, final int resultCode, final Intent intent) {
        super.onActivityResult(requestCode, resultCode, intent);
        if (mCallbackContext != null && (requestCode == REQUEST_CODE_REGISTER || requestCode == REQUEST_CODE_AUTHENTICATE || requestCode == REQUEST_CODE_DETECT_LIVENESS)) {
            if (resultCode == Activity.RESULT_CANCELED) {
                mCallbackContext.success();
                mCallbackContext = null;
                return;
            }
            final VerIDSessionResult result;
            if (resultCode == Activity.RESULT_OK && intent != null) {
                result = intent.getParcelableExtra(VerIDSessionActivity.EXTRA_RESULT);
            } else {
                mCallbackContext.error("Internal Ver-ID error");
                mCallbackContext = null;
                return;
            }
            cordova.getThreadPool().execute(new Runnable() {
                @Override
                public void run() {
                    Gson gson = new Gson();
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
                                mCallbackContext = null;
                                return;
                            }
                            if (activity.isDestroyed()) {
                                mCallbackContext.error("Activity is destroyed");
                                mCallbackContext = null;
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

    @Override
    public void onRestoreStateForActivityResult(Bundle state, CallbackContext callbackContext) {
        super.onRestoreStateForActivityResult(state, callbackContext);
        mCallbackContext = callbackContext;
    }

    protected <T extends VerIDSessionSettings> void loadVerIDAndStartSession(final JSONArray args, final CallbackContext callbackContext, final T settings, final int requestCode) {
        loadVerIDAndRun(args, callbackContext, new VerIDFactoryDelegate() {
            @Override
            public void veridFactoryDidCreateEnvironment(VerIDFactory verIDFactory, VerID verID) {
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
                cordova.setActivityResultCallback(VerIDPlugin.this);
                Intent intent = new VerIDSessionIntent<T>(activity, verID, settings);
                activity.startActivityForResult(intent, requestCode);
            }

            @Override
            public void veridFactoryDidFailWithException(VerIDFactory verIDFactory, Exception e) {
                callbackContext.error(e.getLocalizedMessage());
            }
        });
    }

    protected void loadVerIDAndRun(final JSONArray args, final CallbackContext callbackContext, final VerIDFactoryDelegate factoryDelegate) {
        final Activity activity = cordova.getActivity();
        if (activity == null) {
            callbackContext.error("Cordova activity is null");
            return;
        }
        if (activity.isDestroyed()) {
            callbackContext.error("Activity is destroyed");
            return;
        }
        VerIDFactory verIDFactory = new VerIDFactory(cordova.getContext(), factoryDelegate);
        if (verID != null) {
            factoryDelegate.veridFactoryDidCreateEnvironment(verIDFactory, verID);
            return;
        }
        String apiSecret = getArg(args, "apiSecret", String.class);
        if (apiSecret != null) {
            FaceDetectionRecognitionFactory faceDetectionRecognitionFactory = new FaceDetectionRecognitionFactory(cordova.getContext(), apiSecret);
            verIDFactory.setFaceDetectionFactory(faceDetectionRecognitionFactory);
            verIDFactory.setFaceRecognitionFactory(faceDetectionRecognitionFactory);
        }
        verIDFactory.createVerID();
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
}