package com.badgeduplicator.badgeduplicator3;

import android.content.Intent;
import android.graphics.ImageDecoder;
import android.graphics.drawable.AnimatedImageDrawable;
import android.graphics.drawable.Drawable;
import android.os.Build;
import android.os.Bundle;
import androidx.appcompat.app.AppCompatActivity;
import android.view.View;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.ImageView;

public class AnimationActivity extends AppCompatActivity implements View.OnClickListener {
    /* access modifiers changed from: protected */
    public void onCreate(Bundle bundle) {
        super.onCreate(bundle);
        setContentView((int) R.layout.activity_animation);
        findViewById(R.id.close_btn).setOnClickListener(this);
        ImageView imageView = (ImageView) findViewById(R.id.animation);
        WebView webView = (WebView) findViewById(R.id.animationWebView);
        if (Build.VERSION.SDK_INT < 28) {
            imageView.setVisibility(8);
            webView.setVisibility(0);
            webView.getSettings().setJavaScriptEnabled(true);
            webView.setWebViewClient(new WebViewClient());
            webView.loadDataWithBaseURL((String) null, "<html><head><style>img{display: inline; height: auto; max-width: 100%;}</style></head><body><img src=\"" + "file:///android_res/drawable/phone.gif" + "\"></body></html>", "text/html", "UTF-8", (String) null);
            return;
        }
        try {
            Drawable decodeDrawable = ImageDecoder.decodeDrawable(ImageDecoder.createSource(getResources(), R.drawable.phone));
            imageView.setImageDrawable(decodeDrawable);
            if (decodeDrawable instanceof AnimatedImageDrawable) {
                ((AnimatedImageDrawable) decodeDrawable).start();
            }
        } catch (Exception unused) {
            startReaderActivity();
        }
    }

    private void startReaderActivity() {
        startActivity(new Intent(this, ReaderActivity.class));
        finish();
    }

    public void onClick(View view) {
        if (view.getId() == R.id.close_btn) {
            startReaderActivity();
        }
    }
}
