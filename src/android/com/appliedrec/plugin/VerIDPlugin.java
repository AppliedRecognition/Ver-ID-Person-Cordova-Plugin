package com.appliedrec.plugin;

import android.app.Activity;
import android.content.Intent;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.PointF;
import android.net.Uri;
import android.os.Bundle;
import android.util.Base64;
import android.util.Base64OutputStream;

import com.appliedrec.detreclib.util.TemplateUtil;
import com.appliedrec.ver_id.VerID;
import com.appliedrec.ver_id.VerIDAuthenticationIntent;
import com.appliedrec.ver_id.VerIDLivenessDetectionIntent;
import com.appliedrec.ver_id.VerIDRegistrationIntent;
import com.appliedrec.ver_id.model.VerIDFace;
import com.appliedrec.ver_id.model.VerIDUser;
import com.appliedrec.ver_id.session.VerIDAuthenticationSessionSettings;
import com.appliedrec.ver_id.session.VerIDLivenessDetectionSessionSettings;
import com.appliedrec.ver_id.session.VerIDRegistrationSessionSettings;
import com.appliedrec.ver_id.session.VerIDSessionResult;
import com.appliedrec.ver_id.ui.VerIDActivity;

import org.apache.cordova.CallbackContext;
import org.apache.cordova.CordovaPlugin;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.io.ByteArrayOutputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;

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
            JSONObject jsonSettings = getArg(args, "settings", JSONObject.class);
            final VerIDRegistrationSessionSettings settings;
            if (jsonSettings != null) {
                settings = new VerIDRegistrationSessionSettings(jsonSettings);
            } else {
                settings = new VerIDRegistrationSessionSettings();
            }
            loadVerIDAndStartActivity(args, callbackContext, new VerIDRegistrationIntent(activity, settings), REQUEST_CODE_REGISTER);
        } else if ("authenticate".equals(action)) {
            JSONObject jsonSettings = getArg(args, "settings", JSONObject.class);
            final VerIDAuthenticationSessionSettings settings;
            if (jsonSettings != null) {
                settings = new VerIDAuthenticationSessionSettings(jsonSettings);
            } else {
                settings = new VerIDAuthenticationSessionSettings(VerIDUser.DEFAULT_USER_ID);
            }
            loadVerIDAndStartActivity(args, callbackContext, new VerIDAuthenticationIntent(activity, settings), REQUEST_CODE_AUTHENTICATE);
        } else if ("captureLiveFace".equals(action)) {
            JSONObject jsonSettings = getArg(args, "settings", JSONObject.class);
            final VerIDLivenessDetectionSessionSettings settings;
            if (jsonSettings != null) {
                settings = new VerIDLivenessDetectionSessionSettings(jsonSettings);
            } else {
                settings = new VerIDLivenessDetectionSessionSettings();
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
                                VerIDUser[] users = VerID.shared.getRegisteredVerIDUsers();
                                JSONArray jsonUsers = new JSONArray();
                                for (VerIDUser user : users) {
                                    JSONObject jsonUser = new JSONObject();
                                    JSONArray bearings = new JSONArray();
                                    for (VerID.Bearing bearing : user.getBearings()) {
                                        bearings.put(bearing.ordinal());
                                    }
                                    jsonUser.put("userId", user.getUserId());
                                    jsonUser.put("bearings", bearings);
                                    jsonUsers.put(jsonUser);
                                }
                                callbackContext.success(jsonUsers);
                            } catch (Exception e) {
                                e.printStackTrace();
                                callbackContext.error(e.getLocalizedMessage());
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
                                    callbackContext.success();
                                } catch (Exception e) {
                                    e.printStackTrace();
                                    callbackContext.error(e.getLocalizedMessage());
                                }
                            }
                        });
                    }
                });
            } else {
                callbackContext.error("User id must not be null");
            }
            return true;
        } else {
            return false;
        }
        return true;
    }

    @Override
    public void onActivityResult(int requestCode, int resultCode, final Intent intent) {
        super.onActivityResult(requestCode, resultCode, intent);
        if (mCallbackContext != null && (requestCode == REQUEST_CODE_REGISTER || requestCode == REQUEST_CODE_AUTHENTICATE || requestCode == REQUEST_CODE_DETECT_LIVENESS)) {
            if (resultCode == Activity.RESULT_OK && intent != null) {
                cordova.getThreadPool().execute(new Runnable() {
                    @Override
                    public void run() {
                        VerIDSessionResult result = intent.getParcelableExtra(VerIDActivity.EXTRA_SESSION_RESULT);
                        HashMap<VerIDFace, Uri> faceImages = result.getFaceImages(VerID.Bearing.STRAIGHT);
                        JSONObject response = new JSONObject();
                        try {
                            response.put("outcome", result.outcome.ordinal());
                        } catch (JSONException e) {
                            e.printStackTrace();
                        }
                        Iterator<Map.Entry<VerIDFace, Uri>> faceImageIterator = faceImages.entrySet().iterator();
                        JSONArray jsonFaces = new JSONArray();
                        JSONArray jsonImages = new JSONArray();
                        while (faceImageIterator.hasNext()) {
                            Map.Entry<VerIDFace, Uri> entry = faceImageIterator.next();
                            VerIDFace face = entry.getKey();
                            try {
                                PointF imageSize = getImageSize(entry.getValue());
                                String base64jpeg = imageUriToBase64String(entry.getValue());
                                JSONObject jsonFace = new JSONObject();
                                jsonFace.put("x", face.getBounds().left / imageSize.x);
                                jsonFace.put("y", face.getBounds().top / imageSize.y);
                                jsonFace.put("width", face.getBounds().width() / imageSize.x);
                                jsonFace.put("height", face.getBounds().height() / imageSize.y);
                                if (face.getFaceTemplate() != null) {
                                    jsonFace.put("template", TemplateUtil.floatArrayToBase64(face.getFaceTemplate().getComparisonTemplate()));
                                }
                                jsonFaces.put(jsonFace);
                                jsonImages.put(base64jpeg);
                            } catch (JSONException e) {
                                e.printStackTrace();
                            } catch (FileNotFoundException e) {
                                e.printStackTrace();
                            } catch (IOException e) {
                                e.printStackTrace();
                            } catch (Exception e) {
                                e.printStackTrace();
                            }
                        }
                        try {
                            response.put("faces", jsonFaces);
                            response.put("images", jsonImages);
                        } catch (JSONException e) {
                            e.printStackTrace();
                        }
                        cordova.getActivity().runOnUiThread(new Runnable() {
                            @Override
                            public void run() {
                                mCallbackContext.success(response);
                            }
                        });
                    }
                });
            } else {
                mCallbackContext.error("");
            }
            mCallbackContext = null;
        }
    }

    @Override
    public void onRestoreStateForActivityResult(Bundle state, CallbackContext callbackContext) {
        super.onRestoreStateForActivityResult(state, callbackContext);
        mCallbackContext = callbackContext;
    }

    protected void loadVerIDAndStartActivity(JSONArray args, final CallbackContext callbackContext, final Intent intent, final int requestCode) {
        loadVerIDAndRun(args, callbackContext, new Runnable() {
            @Override
            public void run() {
                Activity activity = cordova.getActivity();
                if (activity == null) {
                    callbackContext.error("Cordova activity is null");
                    return;
                }
                mCallbackContext = callbackContext;
                cordova.setActivityResultCallback(VerIDPlugin.this);
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

    protected String imageUriToBase64String(Uri imageUri) throws IOException {
        InputStream inputStream = cordova.getActivity().getContentResolver().openInputStream(imageUri);
        Bitmap bitmap = BitmapFactory.decodeStream(inputStream);
        if (bitmap != null) {
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            Base64OutputStream base64OutputStream = new Base64OutputStream(outputStream, Base64.NO_WRAP);
            bitmap.compress(Bitmap.CompressFormat.JPEG, 95, base64OutputStream);
            base64OutputStream.flush();
            base64OutputStream.close();
            String base64jpeg = new String(outputStream.toByteArray(), "UTF-8");
            outputStream.close();
            return base64jpeg;
        } else {
            throw new IOException("Unable to decode bitmap");
        }
    }

    protected PointF getImageSize(Uri imageUri) throws FileNotFoundException {
        InputStream inputStream = cordova.getActivity().getContentResolver().openInputStream(imageUri);
        BitmapFactory.Options options = new BitmapFactory.Options();
        options.inJustDecodeBounds = true;
        BitmapFactory.decodeStream(inputStream, null, options);
        return new PointF((float)options.outWidth, (float)options.outHeight);
    }
}