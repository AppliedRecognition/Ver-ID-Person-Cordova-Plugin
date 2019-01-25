package com.appliedrec.plugin;

import android.app.Activity;
import android.content.Intent;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.net.Uri;
import android.os.Bundle;
import android.util.Base64;
import android.util.Base64InputStream;

import com.appliedrec.detreclib.util.TemplateUtil;
import com.appliedrec.ver_id.VerID;
import com.appliedrec.ver_id.VerIDAuthenticationIntent;
import com.appliedrec.ver_id.VerIDLivenessDetectionIntent;
import com.appliedrec.ver_id.VerIDRegistrationIntent;
import com.appliedrec.ver_id.model.FaceTemplate;
import com.appliedrec.ver_id.model.VerIDFace;
import com.appliedrec.ver_id.model.VerIDUser;
import com.appliedrec.ver_id.session.VerIDAuthenticationSessionSettings;
import com.appliedrec.ver_id.session.VerIDLivenessDetectionSessionSettings;
import com.appliedrec.ver_id.session.VerIDRegistrationSessionSettings;
import com.appliedrec.ver_id.session.VerIDSessionResult;
import com.appliedrec.ver_id.session.VerIDSessionSettings;
import com.appliedrec.ver_id.ui.VerIDActivity;
import com.appliedrec.ver_id.util.FaceUtil;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.JsonArray;
import com.google.gson.JsonDeserializationContext;
import com.google.gson.JsonDeserializer;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.google.gson.JsonParseException;
import com.google.gson.JsonSerializationContext;
import com.google.gson.JsonSerializer;

import org.apache.cordova.CallbackContext;
import org.apache.cordova.CordovaPlugin;
import org.apache.cordova.PluginResult;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.lang.reflect.Type;
import java.util.ArrayList;
import java.util.EnumSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

public class VerIDPlugin extends CordovaPlugin {

    protected static final int REQUEST_CODE_REGISTER = 1;
    protected static final int REQUEST_CODE_AUTHENTICATE = 2;
    protected static final int REQUEST_CODE_DETECT_LIVENESS = 3;
    protected CallbackContext mCallbackContext;

    @Override
    public boolean execute(String action, final JSONArray args, final CallbackContext callbackContext) throws JSONException {
        final Activity activity = cordova.getActivity();
        mCallbackContext = null;

        if (activity == null) {
            callbackContext.error("Activity is null");
            return false;
        }

        if ("load".equals(action)) {
            loadVerIDAndRun(args, callbackContext, new Runnable() {
                @Override
                public void run() {
                    callbackContext.success();
                }
            });
        } else if ("unload".equals(action)) {
            VerID.shared.unload();
            return true;
        } else if ("registerUser".equals(action)) {
            final VerIDRegistrationSessionSettings settings;
            String jsonSettings = getArg(args, "settings", String.class);
            if (jsonSettings != null) {
                Gson gson = new Gson();
                settings = gson.fromJson(jsonSettings, VerIDRegistrationSessionSettings.class);
            } else {
                callbackContext.error("Unable to parse session settings");
                return false;
            }
            settings.includeFaceTemplatesInResult = true;
            loadVerIDAndStartActivity(args, callbackContext, new VerIDRegistrationIntent(activity, settings), REQUEST_CODE_REGISTER);
        } else if ("authenticate".equals(action)) {
            String jsonSettings = getArg(args, "settings", String.class);
            final VerIDAuthenticationSessionSettings settings;
            if (jsonSettings != null) {
                Gson gson = new Gson();
                settings = gson.fromJson(jsonSettings, VerIDAuthenticationSessionSettings.class);
            } else {
                callbackContext.error("Unable to parse session settings");
                return false;
            }
            loadVerIDAndStartActivity(args, callbackContext, new VerIDAuthenticationIntent(activity, settings), REQUEST_CODE_AUTHENTICATE);
        } else if ("captureLiveFace".equals(action)) {
            String jsonSettings = getArg(args, "settings", String.class);
            final VerIDLivenessDetectionSessionSettings settings;
            if (jsonSettings != null) {
                Gson gson = new Gson();
                settings = gson.fromJson(jsonSettings, VerIDLivenessDetectionSessionSettings.class);
            } else {
                callbackContext.error("Unable to parse session settings");
                return false;
            }
            settings.includeFaceTemplatesInResult = true;
            loadVerIDAndStartActivity(args, callbackContext, new VerIDLivenessDetectionIntent(activity, settings), REQUEST_CODE_DETECT_LIVENESS);
            return true;
        } else if ("getRegisteredUsers".equals(action)) {
            loadVerIDAndRun(args, callbackContext, new Runnable() {
                @Override
                public void run() {
                    cordova.getThreadPool().execute(new Runnable() {
                        @Override
                        public void run() {
                            try {
                                String[] users = VerID.shared.getRegisteredUsers();
                                Gson gson = new Gson();
                                final String jsonUsers = gson.toJson(users, String[].class);
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
                                    VerID.shared.deregisterUser(userId);
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
        } else if ("compareFaceTemplates".equals(action)) {
            String t1 = getArg(args, "template1", String.class);
            String t2 = getArg(args, "template2", String.class);
            loadVerIDAndRun(args, callbackContext, new Runnable() {
                @Override
                public void run() {
                    cordova.getThreadPool().execute(new Runnable() {
                        @Override
                        public void run() {
                            try {
                                Gson gson = new Gson();
                                FaceTemplate faceTemplate1 = gson.fromJson(t1, FaceTemplate.class);
                                FaceTemplate faceTemplate2 = gson.fromJson(t2, FaceTemplate.class);
                                VerIDFace face1 = new VerIDFace(faceTemplate1);
                                VerIDFace face2 = new VerIDFace(faceTemplate2);
                                final float score = FaceUtil.compareFaces(face1, face2);
                                final JSONObject response = new JSONObject();
                                response.put("score", score);
                                cordova.getActivity().runOnUiThread(new Runnable() {
                                    @Override
                                    public void run() {
                                        callbackContext.success(response);
                                    }
                                });
                            } catch (Exception e) {
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
            String image = getArg(args, "image", String.class);
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
                                VerIDFace face = VerID.shared.detectFaceInImage(bitmap, true, false);
                                Gson gson = new Gson();
                                final String encodedFace = gson.toJson(face);
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

    @Override
    public void onActivityResult(int requestCode, int resultCode, final Intent intent) {
        super.onActivityResult(requestCode, resultCode, intent);
        if (mCallbackContext != null && (requestCode == REQUEST_CODE_REGISTER || requestCode == REQUEST_CODE_AUTHENTICATE || requestCode == REQUEST_CODE_DETECT_LIVENESS)) {
            cordova.getThreadPool().execute(new Runnable() {
                @Override
                public void run() {
                    VerIDSessionResult result;
                    Gson gson = new Gson();
                    if (resultCode == Activity.RESULT_OK && intent != null) {
                        result = intent.getParcelableExtra(VerIDActivity.EXTRA_SESSION_RESULT);
                    } else if (resultCode == Activity.RESULT_CANCELED) {
                        result = new VerIDSessionResult(VerIDSessionResult.Outcome.CANCEL);
                    } else {
                        result = new VerIDSessionResult(VerIDSessionResult.Outcome.UNKNOWN_FAILURE);
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

    @Override
    public void onRestoreStateForActivityResult(Bundle state, CallbackContext callbackContext) {
        super.onRestoreStateForActivityResult(state, callbackContext);
        mCallbackContext = callbackContext;
    }

    protected void loadVerIDAndStartActivity(JSONArray args, final CallbackContext callbackContext, final Intent intent, final int requestCode) {
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
                activity.startActivityForResult(intent, requestCode);
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
        if (VerID.shared.isLoaded()) {
            runnable.run();
            return;
        }
        String apiSecret = getArg(args, "apiSecret", String.class);
        VerID.shared.load(activity, apiSecret, new VerID.LoadCallback() {
            @Override
            public void onLoad() {
                runnable.run();
            }

            @Override
            public void onError(Exception e) {
                callbackContext.error(e.getLocalizedMessage());
            }
        });
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