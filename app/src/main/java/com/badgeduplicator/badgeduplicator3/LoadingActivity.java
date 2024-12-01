package com.badgeduplicator.badgeduplicator3;

import android.app.AlertDialog;
import android.content.DialogInterface;
import android.content.Intent;
import android.nfc.NfcAdapter;
import android.os.Bundle;
import android.widget.TextView;
import java.io.IOException;
import okhttp3.Call;
import okhttp3.Callback;
import okhttp3.Response;

public class LoadingActivity extends CheckNfcActivity {
    /* access modifiers changed from: protected */
    public void onCreate(Bundle bundle) {
        App.setNfcAdapter(NfcAdapter.getDefaultAdapter(this));
        super.onCreate(bundle);
        setContentView((int) R.layout.activity_loading);
        ((TextView) findViewById(R.id.app_version)).setText(App.getAppVersion(this, "v"));
    }

    /* access modifiers changed from: protected */
    public void onResume() {
        App.setNfcAdapter(NfcAdapter.getDefaultAdapter(this));
        super.onResume();
        final String string = App.getSharedPreferences(this, "persistent").getString("last_apicode", "");
        if (!App.isKeysLoaded()) {
            final AlertDialog.Builder builder = new AlertDialog.Builder(this);
            App.loadKeys(this, new Callback() {
                public void onFailure(Call call, IOException iOException) {
                    builder.setMessage(R.string.err_initialisation_app);
                    builder.setCancelable(false);
                    builder.setPositiveButton(17039370, new DialogInterface.OnClickListener() {
                        public void onClick(DialogInterface dialogInterface, int i) {
                            this.finish();
                        }
                    });
                    LoadingActivity.this.runOnUiThread(new Runnable() {
                        public void run() {
                            builder.show();
                        }
                    });
                }

                public void onResponse(Call call, Response response) {
                    if (!string.isEmpty()) {
                        Intent intent = new Intent(LoadingActivity.this, ReaderResultActivity.class);
                        intent.putExtra("last_apicode", string);
                        LoadingActivity.this.startActivity(intent);
                        LoadingActivity.this.finish();
                        return;
                    }
                    LoadingActivity.this.startActivity(new Intent(LoadingActivity.this, AnimationActivity.class));
                    LoadingActivity.this.finish();
                }
            });
        } else if (!string.isEmpty()) {
            Intent intent = new Intent(this, ReaderResultActivity.class);
            intent.putExtra("last_apicode", string);
            startActivity(intent);
            finish();
        } else {
            startActivity(new Intent(this, AnimationActivity.class));
            finish();
        }
    }
}
