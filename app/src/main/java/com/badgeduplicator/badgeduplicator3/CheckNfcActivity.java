package com.badgeduplicator.badgeduplicator3;

import android.app.AlertDialog;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.DialogInterface;
import android.content.Intent;
import android.content.IntentFilter;
import android.os.Bundle;
import androidx.appcompat.app.AppCompatActivity;

public abstract class CheckNfcActivity extends AppCompatActivity {
    private AlertDialog dialog = null;
    private final BroadcastReceiver mReceiver = new BroadcastReceiver() {
        public void onReceive(Context context, Intent intent) {
            String action = intent.getAction();
            if (action != null && action.equals("android.nfc.action.ADAPTER_STATE_CHANGED")) {
                int intExtra = intent.getIntExtra("android.nfc.extra.ADAPTER_STATE", 1);
                if (!(intExtra == 1 || intExtra == 2)) {
                    if (intExtra == 3) {
                        CheckNfcActivity.this.nfcEnabled(context);
                        return;
                    } else if (intExtra != 4) {
                        return;
                    }
                }
                CheckNfcActivity.this.nfcDisabled(context);
            }
        }
    };

    /* access modifiers changed from: protected */
    public void onCreate(Bundle bundle) {
        super.onCreate(bundle);
        if (!App.nfcSupported().booleanValue()) {
            AlertDialog.Builder builder = new AlertDialog.Builder(this);
            builder.setMessage(R.string.nfc_non_installe);
            builder.setCancelable(false);
            builder.setPositiveButton(17039370, new DialogInterface.OnClickListener() {
                public void onClick(DialogInterface dialogInterface, int i) {
                    this.finish();
                }
            });
            this.dialog = builder.show();
            return;
        }
        registerReceiver(this.mReceiver, new IntentFilter("android.nfc.action.ADAPTER_STATE_CHANGED"));
        if (App.nfcEnabled().booleanValue()) {
            nfcEnabled(this);
        } else {
            nfcDisabled(this);
        }
    }

    /* access modifiers changed from: private */
    public void nfcEnabled(Context context) {
        AlertDialog alertDialog = this.dialog;
        if (alertDialog != null) {
            alertDialog.setCancelable(true);
            this.dialog.dismiss();
            this.dialog = null;
        }
    }

    /* access modifiers changed from: private */
    public void nfcDisabled(final Context context) {
        AlertDialog alertDialog = this.dialog;
        if (alertDialog != null) {
            alertDialog.setCancelable(true);
            this.dialog.dismiss();
            this.dialog = null;
        }
        AlertDialog.Builder builder = new AlertDialog.Builder(context);
        builder.setMessage(R.string.nfc_desactive);
        builder.setCancelable(false);
        builder.setPositiveButton(R.string.nfc_activer_btn, new DialogInterface.OnClickListener() {
            public void onClick(DialogInterface dialogInterface, int i) {
                context.startActivity(new Intent("android.settings.NFC_SETTINGS"));
            }
        });
        this.dialog = builder.show();
    }

    /* access modifiers changed from: protected */
    public void onDestroy() {
        try {
            unregisterReceiver(this.mReceiver);
        } catch (Exception unused) {
        }
        super.onDestroy();
    }
}
