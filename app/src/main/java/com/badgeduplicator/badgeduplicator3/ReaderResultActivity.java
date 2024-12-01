package com.badgeduplicator.badgeduplicator3;

import android.content.Intent;
import android.net.Uri;
import android.nfc.NfcAdapter;
import android.os.Bundle;
import android.view.View;
import android.widget.Button;
import android.widget.TextView;

public class ReaderResultActivity extends CheckNfcActivity implements View.OnClickListener {
    public static final String EXTRA_DUMPNAME = "dumpname";
    protected String apiCode;
    protected CircleProgress circleProgress;
    protected Dump dump;
    protected String dumpName;
    protected TextView txtValue;

    /* access modifiers changed from: protected */
    public void onCreate(Bundle bundle) {
        super.onCreate(bundle);
        setContentView((int) R.layout.activity_reader_result);
        ((TextView) findViewById(R.id.app_version)).setText(App.getAppVersion(this, "v"));
        this.txtValue = (TextView) findViewById(R.id.txt_value);
        TextView textView = (TextView) findViewById(R.id.title);
        if (getIntent().hasExtra("last_apicode")) {
            textView.setText(R.string.reader_result_last_title);
            this.apiCode = getIntent().getStringExtra("last_apicode");
        } else {
            textView.setText(R.string.reader_result_success_title);
            String stringExtra = getIntent().getStringExtra(EXTRA_DUMPNAME);
            this.dumpName = stringExtra;
            if (!App.hasRegisteredDump(stringExtra)) {
                finish();
                return;
            }
            Dump registeredDump = App.getRegisteredDump(this.dumpName);
            this.dump = registeredDump;
            if (!registeredDump.isComplete() || !this.dump.hasAPICode()) {
                finish();
                return;
            }
            this.apiCode = this.dump.getAPICode();
        }
        this.txtValue.setText(getString(R.string.reader_result_success_text_nonum, new Object[]{this.apiCode}));
        Button button = (Button) findViewById(R.id.btn_commander_badge);
        button.setVisibility(0);
        button.setOnClickListener(this);
        findViewById(R.id.btn_retour_menu).setOnClickListener(this);
        CircleProgress circleProgress2 = (CircleProgress) findViewById(R.id.circle_progress);
        this.circleProgress = circleProgress2;
        circleProgress2.setValue(100, 100);
    }

    public void onClick(View view) {
        switch (view.getId()) {
            case R.id.btn_commander_badge /*2131165221*/:
                startActivity(new Intent("android.intent.action.VIEW", Uri.parse(String.format("https://izybadge.fr/?rs_code=%s", new Object[]{this.apiCode}))));
                return;
            case R.id.btn_retour_menu /*2131165222*/:
                startActivity(new Intent(this, ReaderActivity.class));
                finish();
                return;
            default:
                return;
        }
    }

    /* access modifiers changed from: protected */
    public void onPause() {
        App.disableNfcForegroundDispatch(this);
        super.onPause();
    }

    /* access modifiers changed from: protected */
    public void onResume() {
        App.setNfcAdapter(NfcAdapter.getDefaultAdapter(this));
        App.enableNfcForegroundDispatch(this);
        super.onResume();
    }
}
