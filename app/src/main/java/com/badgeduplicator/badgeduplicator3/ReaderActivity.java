package com.badgeduplicator.badgeduplicator3;

import android.content.Intent;
import android.content.SharedPreferences;
import android.net.Uri;
import android.nfc.NfcAdapter;
import android.nfc.Tag;
import android.os.Bundle;
import android.view.View;
import android.widget.TextView;
import com.badgeduplicator.badgeduplicator3.App;
import java.io.IOException;
import java.util.HashMap;
import okhttp3.Call;

public class ReaderActivity extends CheckNfcActivity implements View.OnClickListener {
    protected static final String dumpRegisteredName = "dumpreader";
    CircleProgress circleProgress;
    TextView linkHelp;
    TextView linkSite;
    TextView txtValue;

    /* access modifiers changed from: protected */
    public void onCreate(Bundle bundle) {
        App.setNfcAdapter(NfcAdapter.getDefaultAdapter(this));
        super.onCreate(bundle);
        setContentView((int) R.layout.activity_reader);
        ((TextView) findViewById(R.id.app_version)).setText(App.getAppVersion(this, "v"));
        this.txtValue = (TextView) findViewById(R.id.txt_value);
        this.circleProgress = (CircleProgress) findViewById(R.id.circle_progress);
        TextView textView = (TextView) findViewById(R.id.lien_site);
        this.linkSite = textView;
        textView.setOnClickListener(this);
        TextView textView2 = (TextView) findViewById(R.id.lien_aide);
        this.linkHelp = textView2;
        textView2.setOnClickListener(this);
    }

    /* access modifiers changed from: protected */
    public void resetView() {
        App.removeDumpIfRegistered(dumpRegisteredName);
        runOnUiThread(new Runnable() {
            public void run() {
                ReaderActivity.this.txtValue.setText(ReaderActivity.this.getString(R.string.reader_presenter_badge));
                ReaderActivity.this.circleProgress.setValue(0, 100);
            }
        });
    }

    public void onClick(View view) {
        switch (view.getId()) {
            case R.id.lien_aide:
                startActivity(new Intent(this, HelpActivity.class));
                return;
            case R.id.lien_site:
                startActivity(new Intent("android.intent.action.VIEW", Uri.parse("https://izybadge.fr")));
                return;
            default:
                return;
        }
    }

    /* access modifiers changed from: protected */
    public void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        resetView();
        if (intent.getAction().equals("android.nfc.action.TAG_DISCOVERED")) {
            final Tag tag = (Tag) intent.getParcelableExtra("android.nfc.extra.TAG");
            DumpReader dumpReader = new DumpReader(tag);
            dumpReader.addEventListener(new DumpReaderEventListener() {
                public void onStart() {
                    App.removeDumpIfRegistered(ReaderActivity.dumpRegisteredName);
                    ReaderActivity.this.runOnUiThread(new Runnable() {
                        public void run() {
                            ReaderActivity.this.txtValue.setText(ReaderActivity.this.getString(R.string.reader_lecture_en_cours));
                            ReaderActivity.this.circleProgress.setValue(0, 100);
                            ReaderActivity.this.circleProgress.setLineColor(App.getColor(ReaderActivity.this, R.color.colorCircleProgressReaderProgress));
                        }
                    });
                }

                public void onProgress(final int i, final int i2, Dump dump) {
                    ReaderActivity.this.runOnUiThread(new Runnable() {
                        public void run() {
                            ReaderActivity.this.circleProgress.setValue(i, i2);
                        }
                    });
                }

                public void onFailure(DumpFailures dumpFailures) {
                    String str;
                    if (dumpFailures.equals(DumpFailures.TAG_LOST)) {
                        ReaderActivity.this.runOnUiThread(new Runnable() {
                            public void run() {
                                ReaderActivity.this.circleProgress.setValue(100, 100);
                                ReaderActivity.this.circleProgress.setLineColor(App.getColor(ReaderActivity.this, R.color.colorCircleProgressReaderErrorTagLost));
                                ReaderActivity.this.txtValue.setText(ReaderActivity.this.getString(R.string.reader_erreur_taglost));
                            }
                        });
                    } else if (dumpFailures.equals(DumpFailures.TAG_TYPE_UNSUPPORTED)) {
                        HashMap hashMap = new HashMap();
                        String str2 = "";
                        for (String str3 : tag.getTechList()) {
                            StringBuilder append = new StringBuilder().append(str2);
                            if (str2.isEmpty()) {
                                str = "";
                            } else {
                                str = ", ";
                            }
                            str2 = append.append(str).append(str3).toString();
                        }
                        hashMap.put("techlist", str2);
                        App.logDatas(this, hashMap);
                        ReaderActivity.this.runOnUiThread(new Runnable() {
                            public void run() {
                                ReaderActivity.this.circleProgress.setValue(100, 100);
                                ReaderActivity.this.circleProgress.setLineColor(App.getColor(ReaderActivity.this, R.color.colorCircleProgressReaderError));
                                ReaderActivity.this.txtValue.setText(ReaderActivity.this.getString(R.string.reader_erreur_tag_unsupported));
                            }
                        });
                    } else {
                        ReaderActivity.this.runOnUiThread(new Runnable() {
                            public void run() {
                                ReaderActivity.this.circleProgress.setValue(100, 100);
                                ReaderActivity.this.circleProgress.setLineColor(App.getColor(ReaderActivity.this, R.color.colorCircleProgressReaderError));
                                ReaderActivity.this.txtValue.setText(ReaderActivity.this.getString(R.string.reader_erreur_lecture));
                            }
                        });
                    }
                }

                public void onSuccess(final Dump dump) {
                    ReaderActivity.this.runOnUiThread(new Runnable() {
                        public void run() {
                            ReaderActivity.this.circleProgress.setValue(100, 100);
                            ReaderActivity.this.txtValue.setText(ReaderActivity.this.getString(R.string.reader_lecture_finalisation));
                        }
                    });
                    App.getBadgeCode(this, dump, new App.CallbackAnalyseRetourAPI() {
                        public void onFailure(Call call, IOException iOException) {
                            ReaderActivity.this.runOnUiThread(new Runnable() {
                                public void run() {
                                    ReaderActivity.this.txtValue.setText(ReaderActivity.this.getString(R.string.get_code_erreur_inconnue));
                                    ReaderActivity.this.circleProgress.setValue(100, 100);
                                    ReaderActivity.this.circleProgress.setLineColor(App.getColor(ReaderActivity.this, R.color.colorCircleProgressReaderError));
                                }
                            });
                        }

                        public void onResponseResult(int i, String str) {
                            if (i == 200) {
                                String str2 = "";
                                if (str.matches("^[0-9]{3}-[0-9]{3}-[0-9]{3}\\|.+$")) {
                                    dump.setAPICode(str.substring(0, 11));
                                    Dump dump = dump;
                                    if (str.length() > 12) {
                                        str2 = str.substring(12);
                                    }
                                    dump.setBadgeNumber(str2);
                                    SharedPreferences.Editor edit = App.getSharedPreferences(this, "persistent").edit();
                                    edit.putString("last_apicode", dump.getAPICode());
                                    edit.apply();
                                    App.registerDump(ReaderActivity.dumpRegisteredName, dump);
                                    Intent intent = new Intent(ReaderActivity.this, ReaderResultActivity.class);
                                    intent.putExtra(ReaderResultActivity.EXTRA_DUMPNAME, ReaderActivity.dumpRegisteredName);
                                    ReaderActivity.this.startActivity(intent);
                                    ReaderActivity.this.finish();
                                    return;
                                } else if (str.matches("^U[0-9]{2}-[0-9]{3}-[0-9]{3}$")) {
                                    dump.setAPICode(str.substring(0, 11));
                                    dump.setBadgeNumber(str2);
                                    SharedPreferences.Editor edit2 = App.getSharedPreferences(this, "persistent").edit();
                                    edit2.putString("last_apicode", dump.getAPICode());
                                    edit2.apply();
                                    App.registerDump(ReaderActivity.dumpRegisteredName, dump);
                                    Intent intent2 = new Intent(ReaderActivity.this, ReaderResultActivity.class);
                                    intent2.putExtra(ReaderResultActivity.EXTRA_DUMPNAME, ReaderActivity.dumpRegisteredName);
                                    ReaderActivity.this.startActivity(intent2);
                                    ReaderActivity.this.finish();
                                    return;
                                } else if (str.equals("COMPTEUR")) {
                                    ReaderActivity.this.runOnUiThread(new Runnable() {
                                        public void run() {
                                            ReaderActivity.this.txtValue.setText(ReaderActivity.this.getString(R.string.get_code_erreur_compteur));
                                            ReaderActivity.this.circleProgress.setValue(100, 100);
                                            ReaderActivity.this.circleProgress.setLineColor(App.getColor(ReaderActivity.this, R.color.colorCircleProgressReaderError));
                                        }
                                    });
                                    return;
                                } else if (str.equals("ERREUR_LECTURE")) {
                                    ReaderActivity.this.runOnUiThread(new Runnable() {
                                        public void run() {
                                            ReaderActivity.this.txtValue.setText(ReaderActivity.this.getString(R.string.get_code_erreur_lecture));
                                            ReaderActivity.this.circleProgress.setValue(100, 100);
                                            ReaderActivity.this.circleProgress.setLineColor(App.getColor(ReaderActivity.this, R.color.colorCircleProgressReaderError));
                                        }
                                    });
                                    return;
                                }
                            }
                            ReaderActivity.this.runOnUiThread(new Runnable() {
                                public void run() {
                                    ReaderActivity.this.txtValue.setText(ReaderActivity.this.getString(R.string.get_code_erreur_inconnue));
                                    ReaderActivity.this.circleProgress.setValue(100, 100);
                                    ReaderActivity.this.circleProgress.setLineColor(App.getColor(ReaderActivity.this, R.color.colorCircleProgressReaderError));
                                }
                            });
                        }
                    });
                }
            });
            dumpReader.start();
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
