package com.badgeduplicator.badgeduplicator3;

import android.content.Intent;
import android.content.pm.PackageInfo;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.os.Bundle;
import android.os.Message;
import androidx.appcompat.app.AppCompatActivity;
import android.webkit.DownloadListener;
import android.webkit.WebBackForwardList;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

public class HelpActivity extends AppCompatActivity {
    protected WebView webView;

    /* access modifiers changed from: protected */
    public void onCreate(Bundle bundle) {
        super.onCreate(bundle);
        setContentView((int) R.layout.activity_help);
        initView();
    }

    /* access modifiers changed from: protected */
    public void onResume() {
        super.onResume();
        initView();
    }

    public void onBackPressed() {
        WebBackForwardList copyBackForwardList = this.webView.copyBackForwardList();
        if (copyBackForwardList.getCurrentIndex() > 0) {
            copyBackForwardList.getItemAtIndex(copyBackForwardList.getCurrentIndex() - 1).getUrl();
            this.webView.goBack();
            return;
        }
        super.onBackPressed();
    }

    /* access modifiers changed from: protected */
    public void initView() {
        WebView webView2 = (WebView) findViewById(R.id.webview);
        this.webView = webView2;
        WebSettings settings = webView2.getSettings();
        settings.setSupportMultipleWindows(true);
        settings.setJavaScriptEnabled(true);
        this.webView.setWebChromeClient(new WebChromeClient() {
            public boolean onCreateWindow(WebView webView, boolean z, boolean z2, Message message) {
                webView.getContext().startActivity(new Intent("android.intent.action.VIEW", Uri.parse(webView.getHitTestResult().getExtra())));
                return false;
            }
        });
        this.webView.setWebViewClient(new WebViewClient() {
            public boolean shouldOverrideUrlLoading(WebView webView, String str) {
                if ((str.toLowerCase().startsWith("https://") || str.toLowerCase().startsWith("http://")) && Uri.parse(str).getHost().equals(Uri.parse("https://izybadge.fr/html/aide.htm").getHost())) {
                    return false;
                }
                HelpActivity.this.startActivity(new Intent("android.intent.action.VIEW", Uri.parse(str)));
                return true;
            }
        });
        this.webView.setDownloadListener(new DownloadListener() {
            public void onDownloadStart(String str, String str2, String str3, String str4, long j) {
                Intent intent = new Intent("android.intent.action.VIEW");
                intent.setData(Uri.parse(str));
                HelpActivity.this.startActivity(intent);
            }
        });
        try {
            PackageInfo packageInfo = getPackageManager().getPackageInfo(getPackageName(), 0);
            settings.setUserAgentString(settings.getUserAgentString() + " " + packageInfo.packageName + "/" + packageInfo.versionName);
        } catch (PackageManager.NameNotFoundException unused) {
        }
        this.webView.loadUrl("https://izybadge.fr/html/aide.htm");
    }
}
