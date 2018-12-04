package com.appliedrec.plugin;

import android.app.Activity;
import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.util.Base64;

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

    static class VerIDFaceCoder implements JsonSerializer<VerIDFace>, JsonDeserializer<VerIDFace> {

        @Override
        public JsonElement serialize(VerIDFace src, Type typeOfSrc, JsonSerializationContext context) {
            JsonObject jsonObject = new JsonObject();
            jsonObject.addProperty("x", src.getBounds().left);
            jsonObject.addProperty("y", src.getBounds().top);
            jsonObject.addProperty("width", src.getBounds().width());
            jsonObject.addProperty("height", src.getBounds().height());
            jsonObject.addProperty("bearing", new VerID.EulerAngleF(src.getFBFace()).toBearing().name());
            FaceTemplate faceTemplate = src.getFaceTemplate();
            if (faceTemplate != null) {
                JsonObject template = new JsonObject();
                template.addProperty("version", faceTemplate.getVersion());
                template.addProperty("data", Base64.encodeToString(faceTemplate.getData(), Base64.NO_WRAP));
                jsonObject.add("faceTemplate", template);
                try {
                    float[] comparisonTemplate = faceTemplate.getComparisonTemplate();
                    jsonObject.addProperty("comparisonTemplate", TemplateUtil.floatArrayToBase64(comparisonTemplate));
                } catch (Exception e) {
                    e.printStackTrace();
                }
            }
            return jsonObject;
        }

        @Override
        public VerIDFace deserialize(JsonElement json, Type typeOfT, JsonDeserializationContext context) throws JsonParseException {
            JsonObject jsonObject = json.getAsJsonObject();
            JsonObject templateJson = jsonObject.getAsJsonObject("faceTemplate");
            if (templateJson != null) {
                int version = templateJson.get("version").getAsInt();
                String data = templateJson.get("data").getAsString();
                if (data != null) {
                    FaceTemplate faceTemplate = new FaceTemplate(Base64.decode(data, Base64.NO_WRAP), version);
                    try {
                        return new VerIDFace(faceTemplate);
                    } catch (Exception e) {
                        throw new JsonParseException("Unable to parse face template");
                    }
                } else {
                    throw new JsonParseException("Missing face template data");
                }
            } else {
                throw new JsonParseException("The face may not be suitable for recognition");
            }
        }
    }

    static class VerIDSettingsCoder<T extends VerIDSessionSettings> implements JsonSerializer<T>, JsonDeserializer<T> {

        Class<T> settingsClass;

        public VerIDSettingsCoder(Class<T> settingsClass) {
            this.settingsClass = settingsClass;
        }

        @Override
        public JsonElement serialize(T src, Type typeOfSrc, JsonSerializationContext context) {
            JsonObject jsonObject = new JsonObject();
            jsonObject.addProperty("expiryTime", (float)src.expiryTime / 1000f);
            jsonObject.addProperty("numberOfResultsToCollect", src.numberOfResultsToCollect);
            jsonObject.addProperty("includeFaceTemplatesInResult", src.includeFaceTemplatesInResult);
            jsonObject.addProperty("showResult", src.showResult);
            if (src instanceof VerIDLivenessDetectionSessionSettings) {
                Set<VerID.Bearing> bearings = ((VerIDLivenessDetectionSessionSettings)src).bearings;
                JsonArray bearingsArray = new JsonArray();
                for (VerID.Bearing bearing : bearings) {
                    bearingsArray.add(bearing.name());
                }
                jsonObject.add("bearings", bearingsArray);
            }
            if (src instanceof VerIDAuthenticationSessionSettings) {
                jsonObject.addProperty("userId", ((VerIDAuthenticationSessionSettings)src).userId);
                jsonObject.addProperty("livenessDetection", ((VerIDAuthenticationSessionSettings)src).getLivenessDetection().name());
            }
            if (src instanceof VerIDRegistrationSessionSettings) {
                VerIDRegistrationSessionSettings registrationSessionSettings = (VerIDRegistrationSessionSettings)src;
                jsonObject.addProperty("userId", registrationSessionSettings.userId);
                jsonObject.addProperty("appendIfUserExists", registrationSessionSettings.appendIfUserExists);
                jsonObject.addProperty("livenessDetection", registrationSessionSettings.getLivenessDetection().name());
                JsonArray bearings = new JsonArray();
                for (VerID.Bearing bearing : registrationSessionSettings.bearingsToRegister) {
                    bearings.add(bearing.name());
                }
                jsonObject.add("bearingsToRegister", bearings);
            }
            return jsonObject;
        }

        @Override
        public T deserialize(JsonElement json, Type typeOfT, JsonDeserializationContext context) throws JsonParseException {
            T settings;
            try {
                settings = settingsClass.newInstance();
            } catch (InstantiationException e) {
                e.printStackTrace();
                throw new JsonParseException("Instantiation exception");
            } catch (IllegalAccessException e) {
                e.printStackTrace();
                throw new JsonParseException("Illegal access exception");
            }
            JsonObject jsonObject = json.getAsJsonObject();
            settings.expiryTime = (long)(jsonObject.get("expiryTime").getAsFloat() * 1000f);
            settings.numberOfResultsToCollect = jsonObject.get("numberOfResultsToCollect").getAsInt();
            settings.includeFaceTemplatesInResult = jsonObject.get("includeFaceTemplatesInResult").getAsBoolean();
            settings.showResult = jsonObject.get("showResult").getAsBoolean();
            if (settings instanceof VerIDLivenessDetectionSessionSettings) {
                JsonArray bearings = jsonObject.getAsJsonArray("bearings");
                ((VerIDLivenessDetectionSessionSettings) settings).bearings = EnumSet.noneOf(VerID.Bearing.class);
                for (JsonElement element : bearings) {
                    VerID.Bearing bearing = VerID.Bearing.valueOf(element.getAsString());
                    if (bearing != null) {
                        ((VerIDLivenessDetectionSessionSettings) settings).bearings.add(bearing);
                    }
                }
            }
            if (settings instanceof VerIDAuthenticationSessionSettings) {
                ((VerIDAuthenticationSessionSettings) settings).userId = jsonObject.get("userId").getAsString();
                VerID.LivenessDetection livenessDetection = VerID.LivenessDetection.valueOf(jsonObject.get("livenessDetection").getAsString());
                if (livenessDetection != null) {
                    ((VerIDAuthenticationSessionSettings) settings).setLivenessDetection(livenessDetection);
                }
            }
            if (settings instanceof VerIDRegistrationSessionSettings) {
                ((VerIDRegistrationSessionSettings) settings).userId = jsonObject.get("userId").getAsString();
                VerID.LivenessDetection livenessDetection = VerID.LivenessDetection.valueOf(jsonObject.get("livenessDetection").getAsString());
                if (livenessDetection != null) {
                    ((VerIDRegistrationSessionSettings) settings).setLivenessDetection(livenessDetection);
                }
                ((VerIDRegistrationSessionSettings) settings).appendIfUserExists = jsonObject.get("appendIfUserExists").getAsBoolean();
                JsonArray bearings = jsonObject.getAsJsonArray("bearings");
                ArrayList<VerID.Bearing> bearingList = new ArrayList<>();
                for (JsonElement element : bearings) {
                    VerID.Bearing bearing = VerID.Bearing.valueOf(element.getAsString());
                    if (bearing != null) {
                        bearingList.add(bearing);
                    }
                }
                ((VerIDRegistrationSessionSettings) settings).bearingsToRegister = new VerID.Bearing[bearingList.size()];
                bearingList.toArray(((VerIDRegistrationSessionSettings) settings).bearingsToRegister);
            }
            return settings;
        }
    }

    static class VerIDSessionResultCoder implements JsonSerializer<VerIDSessionResult>, JsonDeserializer<VerIDSessionResult> {

        @Override
        public VerIDSessionResult deserialize(JsonElement json, Type typeOfT, JsonDeserializationContext context) throws JsonParseException {
            JsonObject jsonObject = json.getAsJsonObject();
            VerIDSessionResult.Outcome outcome = VerIDSessionResult.Outcome.valueOf(jsonObject.get("outcome").getAsString());
            VerIDFace face = null;
            if (jsonObject.has("face")) {
                Gson gson = new GsonBuilder().registerTypeAdapter(VerIDFace.class, new VerIDFaceCoder()).create();
                face = gson.fromJson(jsonObject.get("face"), VerIDFace.class);
            }
            VerIDSessionResult result = null;
            if (jsonObject.has("image")) {
                String dataUri = jsonObject.get("image").getAsString();
                if (dataUri.startsWith("data:")) {
                    String mimeType = dataUri.substring(6, dataUri.indexOf(";"));
                    String ext = null;
                    if ("image/jpeg".equals(mimeType)) {
                        ext = "jpg";
                    } else if ("image/png".equals(mimeType)) {
                        ext = "png";
                    }
                    if (ext != null) {
                        byte[] image = Base64.decode(dataUri.substring(dataUri.indexOf(",")+1), Base64.NO_WRAP);
                        try {
                            ByteArrayInputStream inputStream = new ByteArrayInputStream(image);
                            File tempFile = File.createTempFile("image","."+ext);
                            FileOutputStream fileOutputStream = new FileOutputStream(tempFile);
                            int read;
                            byte[] buffer = new byte[512];
                            while ((read = inputStream.read(buffer, 0, buffer.length)) > 0) {
                                fileOutputStream.write(buffer, 0, read);
                            }
                            fileOutputStream.close();
                            inputStream.close();
                            result = new VerIDSessionResult(outcome, Uri.fromFile(tempFile), face.getFBFace());
                        } catch (IOException e) {
                            e.printStackTrace();
                            throw new JsonParseException("Unable to create temporary image file");
                        }
                    } else {
                        result = new VerIDSessionResult(outcome, null, face.getFBFace());
                    }
                } else {
                    result = new VerIDSessionResult(outcome, null, face.getFBFace());
                }
            } else {
                result = new VerIDSessionResult(outcome);
            }
            if (jsonObject.has("constituentResults")) {
                JsonArray constituentResults = jsonObject.get("constituentResults").getAsJsonArray();
                Gson gson = new GsonBuilder().registerTypeAdapter(VerIDSessionResult.class, new VerIDSessionResultCoder()).create();
                VerIDSessionResult[] results = gson.fromJson(constituentResults, VerIDSessionResult[].class);
                for (VerIDSessionResult result1 : results) {
                    result.addPositiveResult(result1);
                }
            }
            if (jsonObject.has("users")) {
                JsonObject users = jsonObject.get("users").getAsJsonObject();
                for (Map.Entry<String,JsonElement> entry : users.entrySet()) {
                    JsonArray bearings = entry.getValue().getAsJsonArray();
                    for (JsonElement val : bearings) {
                        VerID.Bearing bearing = VerID.Bearing.valueOf(val.getAsString());
                        if (bearing != null) {
                            result.addUser(entry.getKey(), bearing);
                        }
                    }
                }
            }
            return result;
        }

        @Override
        public JsonElement serialize(VerIDSessionResult src, Type typeOfSrc, JsonSerializationContext context) {
            JsonObject jsonObject = new JsonObject();
            jsonObject.addProperty("outcome", src.outcome.name());
            if (src.getFace() != null) {
                Gson gson = new GsonBuilder().registerTypeAdapter(VerIDFace.class, new VerIDFaceCoder()).create();
                jsonObject.add("face", gson.toJsonTree(src.getFace(), VerIDFace.class));
            }
            if (src.getImageUri() != null) {
                try {
                    String ext = src.getImageUri().getLastPathSegment().substring(src.getImageUri().getLastPathSegment().lastIndexOf(".")+1);
                    String mimeType;
                    if ("jpg".equals(ext) || "jpeg".equals(ext)) {
                        mimeType = "image/jpeg";
                    } else if ("png".equals(ext)) {
                        mimeType = "image/png";
                    } else {
                        mimeType = null;
                    }
                    if (mimeType != null) {
                        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
                        InputStream inputStream = new FileInputStream(src.getImageUri().getPath());
                        int read;
                        byte[] buffer = new byte[512];
                        while ((read = inputStream.read(buffer, 0, buffer.length)) > 0) {
                            outputStream.write(buffer, 0, read);
                        }
                        byte[] imageBytes = outputStream.toByteArray();
                        jsonObject.addProperty("image", "data:"+mimeType+";base64,"+Base64.encodeToString(imageBytes, Base64.NO_WRAP));
                        inputStream.close();
                        outputStream.close();
                    }
                } catch (FileNotFoundException e) {
                    e.printStackTrace();
                } catch (IOException e) {
                    e.printStackTrace();
                }
            }
            if (!src.getConstituentResults().isEmpty()) {
                Gson gson = new GsonBuilder().registerTypeAdapter(VerIDSessionResult.class, new VerIDSessionResultCoder()).create();
                JsonArray constituentResultsArray = new JsonArray();
                for (VerIDSessionResult result : src.getConstituentResults()) {
                    constituentResultsArray.add(gson.toJsonTree(result, VerIDSessionResult.class));
                }
                jsonObject.add("constituentResults", constituentResultsArray);
            }
            if (src.getIdentifiedUsers().length > 0) {
                JsonObject users = new JsonObject();
                for (VerIDUser user : src.getIdentifiedUsers()) {
                    JsonArray bearings = new JsonArray();
                    for (VerID.Bearing bearing : user.getBearings()) {
                        bearings.add(bearing.name());
                    }
                    users.add(user.getUserId(), bearings);
                }
            }
            return jsonObject;
        }
    }

    static class VerIDUserCoder implements JsonSerializer<VerIDUser>, JsonDeserializer<VerIDUser> {

        @Override
        public VerIDUser deserialize(JsonElement json, Type typeOfT, JsonDeserializationContext context) throws JsonParseException {
            JsonObject jsonObject = json.getAsJsonObject();
            String userId = jsonObject.get("userId").getAsString();
            JsonArray jsonBearings = jsonObject.get("bearings").getAsJsonArray();
            EnumSet<VerID.Bearing> bearings = EnumSet.noneOf(VerID.Bearing.class);
            if (jsonBearings != null) {
                for (JsonElement element : jsonBearings) {
                    VerID.Bearing bearing = VerID.Bearing.valueOf(element.getAsString());
                    if (bearing != null) {
                        bearings.add(bearing);
                    }
                }
            }
            return new VerIDUser(userId, bearings);
        }

        @Override
        public JsonElement serialize(VerIDUser src, Type typeOfSrc, JsonSerializationContext context) {
            JsonObject object = new JsonObject();
            object.addProperty("userId", src.getUserId());
            JsonArray bearings = new JsonArray();
            for (VerID.Bearing bearing : src.getBearings()) {
                bearings.add(bearing.name());
            }
            if (bearings.size() > 0) {
                object.add("bearings", bearings);
            }
            return object;
        }
    }

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
                Gson gson = new GsonBuilder().registerTypeAdapter(VerIDRegistrationSessionSettings.class, new VerIDSettingsCoder<>(VerIDRegistrationSessionSettings.class)).create();
                settings = gson.fromJson(jsonSettings, VerIDRegistrationSessionSettings.class);
            } else {
                settings = new VerIDRegistrationSessionSettings();
            }
            settings.includeFaceTemplatesInResult = true;
            loadVerIDAndStartActivity(args, callbackContext, new VerIDRegistrationIntent(activity, settings), REQUEST_CODE_REGISTER);
        } else if ("authenticate".equals(action)) {
            String jsonSettings = getArg(args, "settings", String.class);
            final VerIDAuthenticationSessionSettings settings;
            if (jsonSettings != null) {
                Gson gson = new GsonBuilder().registerTypeAdapter(VerIDAuthenticationSessionSettings.class, new VerIDSettingsCoder<>(VerIDAuthenticationSessionSettings.class)).create();
                settings = gson.fromJson(jsonSettings, VerIDAuthenticationSessionSettings.class);
            } else {
                settings = new VerIDAuthenticationSessionSettings();
            }
            loadVerIDAndStartActivity(args, callbackContext, new VerIDAuthenticationIntent(activity, settings), REQUEST_CODE_AUTHENTICATE);
        } else if ("captureLiveFace".equals(action)) {
            String jsonSettings = getArg(args, "settings", String.class);
            final VerIDLivenessDetectionSessionSettings settings;
            if (jsonSettings != null) {
                Gson gson = new GsonBuilder().registerTypeAdapter(VerIDLivenessDetectionSessionSettings.class, new VerIDSettingsCoder<>(VerIDLivenessDetectionSessionSettings.class)).create();
                settings = gson.fromJson(jsonSettings, VerIDLivenessDetectionSessionSettings.class);
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
                                Gson gson = new GsonBuilder().registerTypeAdapter(VerIDUser.class, new VerIDUserCoder()).create();
                                String jsonUsers = gson.toJson(users, VerIDUser[].class);
                                cordova.getActivity().runOnUiThread(new Runnable() {
                                    @Override
                                    public void run() {
                                        callbackContext.success(jsonUsers);
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
            cordova.getThreadPool().execute(new Runnable() {
                @Override
                public void run() {
                    VerIDSessionResult result;
                    Gson gson = new GsonBuilder().registerTypeAdapter(VerIDSessionResult.class, new VerIDSessionResultCoder()).create();
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