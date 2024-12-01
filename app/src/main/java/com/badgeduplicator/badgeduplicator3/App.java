package com.badgeduplicator.badgeduplicator3;

import android.app.Activity;
import android.app.AlertDialog;
import android.app.PendingIntent;
import android.content.Context;
import android.content.DialogInterface;
import android.content.Intent;
import android.content.IntentFilter;
import android.content.SharedPreferences;
import android.content.pm.PackageManager;
import android.content.res.Resources;
import android.nfc.NfcAdapter;
import android.os.Build;
import android.os.Process;
import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import okhttp3.Call;
import okhttp3.Callback;
import okhttp3.FormBody;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.Response;

public class App {
    protected static final String EXTRA_LAST_APICODE = "last_apicode";
    protected static final int KEY_LENGTH = 6;
    protected static final String PREF_PERSISTENT = "persistent";
    protected static final String URL_AIDE = "https://izybadge.fr/html/aide.htm";
    protected static final String URL_API_BADGE = "https://izybadge.fr/scripts/izybadge/api-android.php?v=4";
    protected static final String URL_API_KEYS = "https://izybadge.fr/scripts/izybadge/api-android.php?cle=1";
    protected static final String URL_CMD_BADGE = "https://izybadge.fr/?rs_code=%s";
    protected static final String URL_LOG = "https://izybadge.fr/scripts/izybadge/api-android-logs.php";
    protected static final String URL_SITE = "https://izybadge.fr";
    protected static HashMap<String, Dump> dumps = new HashMap<>();
    protected static List<List<byte[]>> grouped_keys = new ArrayList();
    public static boolean keys_loaded = false;
    protected static NfcAdapter nfcAdapter;

    public static List<List<byte[]>> getAvailableGroupedKeys() {
        return grouped_keys;
    }

    public static String getAppVersion(Context context, String str) {
        try {
            return str + context.getPackageManager().getPackageInfo(context.getPackageName(), 0).versionName;
        } catch (PackageManager.NameNotFoundException unused) {
            return "";
        }
    }

    public static int getColor(Activity activity, int i) {
        int i2 = Build.VERSION.SDK_INT;
        Resources resources = activity.getResources();
        return i2 < 23 ? resources.getColor(i) : resources.getColor(i, (Resources.Theme) null);
    }

    public static SharedPreferences getSharedPreferences(Context context, String str) {
        return context.getSharedPreferences(str, 0);
    }

    public static void registerDump(String str, Dump dump) {
        dumps.put(str, dump);
    }

    public static boolean hasRegisteredDump(String str) {
        return dumps.containsKey(str) && dumps.get(str) != null;
    }

    public static Dump getRegisteredDump(String str) {
        if (hasRegisteredDump(str)) {
            return dumps.get(str);
        }
        return null;
    }

    public static void removeDumpIfRegistered(String str) {
        dumps.remove(str);
    }

    public static boolean isKeysLoaded() {
        return keys_loaded;
    }

    public static void setAvailableGroupedKeys(List<List<byte[]>> list) {
        grouped_keys = list;
    }

    public static Boolean nfcSupported() {
        return Boolean.valueOf(nfcAdapter != null);
    }

    public static Boolean nfcEnabled() {
        NfcAdapter nfcAdapter2 = nfcAdapter;
        return Boolean.valueOf(nfcAdapter2 != null && nfcAdapter2.isEnabled());
    }

    public static void setNfcAdapter(NfcAdapter nfcAdapter2) {
        nfcAdapter = nfcAdapter2;
    }

    public static void enableNfcForegroundDispatch(Activity activity) {
        NfcAdapter nfcAdapter2 = nfcAdapter;
        if (nfcAdapter2 != null && nfcAdapter2.isEnabled()) {
            Intent intent = new Intent(activity, activity.getClass());
            intent.addFlags(536870912);
            nfcAdapter.enableForegroundDispatch(activity, PendingIntent.getActivity(activity, 0, intent, 33554432), (IntentFilter[]) null, (String[][]) null);
        }
    }

    public static void disableNfcForegroundDispatch(Activity activity) {
        NfcAdapter nfcAdapter2 = nfcAdapter;
        if (nfcAdapter2 != null && nfcAdapter2.isEnabled()) {
            nfcAdapter.disableForegroundDispatch(activity);
        }
    }

    public static String byteArrayToHexString(byte[] bArr) {
        String[] strArr = {"0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "A", "B", "C", "D", "E", "F"};
        String str = "";
        for (byte b : bArr) {
            byte b2 = b & 255;
            str = (str + strArr[(b2 >> 4) & 15]) + strArr[b2 & 15];
        }
        return str;
    }

    public static byte[] hexStringToByteArray(String str) {
        int length = str.length();
        byte[] bArr = new byte[(length / 2)];
        for (int i = 0; i < length; i += 2) {
            bArr[i / 2] = (byte) ((Character.digit(str.charAt(i), 16) << 4) + Character.digit(str.charAt(i + 1), 16));
        }
        return bArr;
    }

    public static class CallbackAnalyseRetourAPI implements Callback {
        private Callback callback;
        private Context context;

        public void onResponseResult(int i, String str) {
        }

        public CallbackAnalyseRetourAPI(Context context2, Callback callback2) {
            this.context = context2;
            this.callback = callback2;
        }

        public CallbackAnalyseRetourAPI() {
            this.context = null;
            this.callback = null;
        }

        public void onFailure(Call call, IOException iOException) {
            this.callback.onFailure(call, iOException);
        }

        public void onResponse(Call call, Response response) throws IOException {
            int code = response.code();
            if (code == 200) {
                String string = response.body().string();
                if (this.context == null || !string.equals("ERRMAJ")) {
                    Callback callback2 = this.callback;
                    if (callback2 instanceof CallbackAnalyseRetourAPI) {
                        ((CallbackAnalyseRetourAPI) callback2).onResponseResult(code, string);
                    } else {
                        callback2.onResponse(call, response);
                    }
                } else {
                    AlertDialog.Builder builder = new AlertDialog.Builder(this.context);
                    builder.setMessage(R.string.api_errmaj);
                    builder.setCancelable(false);
                    builder.setPositiveButton(17039370, new DialogInterface.OnClickListener() {
                        public void onClick(DialogInterface dialogInterface, int i) {
                            Process.killProcess(Process.myPid());
                        }
                    });
                    builder.show();
                }
            } else {
                this.callback.onFailure(call, new IOException());
            }
        }
    }

    public static void logDatas(Context context, HashMap<String, String> hashMap) {
        OkHttpClient okHttpClient = new OkHttpClient();
        FormBody.Builder add = new FormBody.Builder().add("vapp", getAppVersion(context, "")).add("android_version", Build.VERSION.RELEASE).add("phone_model", Build.MODEL).add("phone_manufacturer", Build.MANUFACTURER);
        for (String next : hashMap.keySet()) {
            add.add(next, hashMap.get(next));
        }
        okHttpClient.newCall(new Request.Builder().url(URL_LOG).post(add.build()).build()).enqueue(new Callback() {
            public void onFailure(Call call, IOException iOException) {
            }

            public void onResponse(Call call, Response response) throws IOException {
            }
        });
        System.out.println("DEBUG 4");
    }

    public static void getBadgeCode(Context context, Dump dump, Callback callback) {
        String byteArrayToHexString = byteArrayToHexString(dump.toByteArray());
        new OkHttpClient().newCall(new Request.Builder().url(URL_API_BADGE).post(new FormBody.Builder().add("type", dump.getApiBadgeType().getType()).add("dump", byteArrayToHexString).add("dump_length", String.valueOf(byteArrayToHexString.length())).add("vapp", getAppVersion(context, "")).build()).build()).enqueue(new CallbackAnalyseRetourAPI(context, callback));
    }

    public static void loadKeys(final Context context, final Callback callback) {
        new OkHttpClient().newCall(new Request.Builder().url(URL_API_KEYS).build()).enqueue(new Callback() {
            public void onFailure(Call call, IOException iOException) {
                callback.onFailure(call, iOException);
            }

            public void onResponse(Call call, Response response) throws IOException {
                Call call2 = call;
                String string = response.body().string();
                int code = response.code();
                if (string.equals("ERRMAJ")) {
                    AlertDialog.Builder builder = new AlertDialog.Builder(context);
                    builder.setMessage(R.string.api_errmaj);
                    builder.setCancelable(false);
                    builder.setPositiveButton(17039370, new DialogInterface.OnClickListener() {
                        public void onClick(DialogInterface dialogInterface, int i) {
                            Process.killProcess(Process.myPid());
                        }
                    });
                    builder.show();
                } else if (code != 200 || string.length() <= 12) {
                    callback.onFailure(call2, new IOException("Impossible de récupérer les clés"));
                } else {
                    String[] strArr = {"!", "#", ":", "$", "^", "Z", "x", "/", "&", "@", "(", "]", "[", "y", "*", "g"};
                    String[] strArr2 = {"0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "a", "b", "c", "d", "e", "f"};
                    for (int i = 0; i < 16; i++) {
                        string = string.replace(strArr[i], strArr2[i]);
                    }
                    String[] split = string.split("u");
                    ArrayList arrayList = new ArrayList();
                    ArrayList arrayList2 = new ArrayList();
                    for (int i2 = 0; i2 < split.length; i2++) {
                        if (split[i2].length() == 0 && arrayList2.size() > 0) {
                            arrayList.add(arrayList2);
                            arrayList2 = new ArrayList();
                        }
                        if (split[i2].length() == 12) {
                            arrayList2.add(App.hexStringToByteArray(split[i2]));
                        }
                    }
                    if (arrayList2.size() > 0) {
                        arrayList.add(arrayList2);
                    }
                    App.setAvailableGroupedKeys(arrayList);
                    App.keys_loaded = true;
                    callback.onResponse(call2, response);
                }
            }
        });
    }
}
