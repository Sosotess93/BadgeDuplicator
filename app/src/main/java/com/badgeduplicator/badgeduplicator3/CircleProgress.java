package com.badgeduplicator.badgeduplicator3;

import android.content.Context;
import android.content.res.TypedArray;
import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.Paint;
import android.graphics.RectF;
import android.os.Handler;
import android.util.AttributeSet;
import android.view.View;

public class CircleProgress extends View implements Runnable {
    private int angle = 0;
    RectF area = new RectF();
    private boolean count = false;
    private Handler handler = new Handler();
    private int lineColor = 0;
    private int lineWidth = 5;
    Paint p = new Paint();
    private int pathColor = 0;
    private boolean runAsync = true;
    private int start = 0;
    private int stop;
    private Thread thread = new Thread(this);
    /* access modifiers changed from: private */
    public int total = 100;
    /* access modifiers changed from: private */
    public int value = 0;

    public CircleProgress(Context context) {
        super(context);
    }

    public CircleProgress(Context context, AttributeSet attributeSet) {
        super(context, attributeSet);
        TypedArray obtainStyledAttributes = context.obtainStyledAttributes(attributeSet, R.styleable.CircleProgress);
        this.value = obtainStyledAttributes.getInteger(6, 0);
        this.total = obtainStyledAttributes.getInteger(5, 0);
        this.lineWidth = obtainStyledAttributes.getInteger(3, 5);
        this.lineColor = obtainStyledAttributes.getInteger(2, 0);
        this.pathColor = obtainStyledAttributes.getInteger(4, 0);
        obtainStyledAttributes.recycle();
    }

    public void runAsync(boolean z) {
        this.runAsync = z;
    }

    public void setValue(int i, int i2) {
        this.angle = (i * 360) / i2;
        invalidate();
    }

    public void setLineColor(int i) {
        this.lineColor = i;
        invalidate();
    }

    public void onDraw(Canvas canvas) {
        int width = getWidth();
        int height = getHeight();
        int i = width < height ? width : height;
        int ceil = (int) Math.ceil((double) (this.lineWidth / 2));
        int i2 = width > i ? ((width - i) / 2) + ceil : ceil;
        if (height > i) {
            ceil += (height - i) / 2;
        }
        int i3 = width > i ? width - i2 : i - i2;
        int i4 = height > i ? height - ceil : i - ceil;
        this.p.setStrokeWidth((float) this.lineWidth);
        this.p.setAntiAlias(true);
        this.p.setStyle(Paint.Style.STROKE);
        this.area.set((float) i2, (float) ceil, (float) i3, (float) i4);
        this.p.setColor(this.pathColor);
        Canvas canvas2 = canvas;
        canvas2.drawArc(this.area, -90.0f, 360.0f, false, this.p);
        this.p.setColor(this.lineColor);
        canvas2.drawArc(this.area, -90.0f, (float) this.angle, false, this.p);
    }

    public int hex2rgb(String str) {
        return Color.rgb(Integer.valueOf(str.length() < 6 ? str.substring(1, 2) + str.substring(1, 2) : str.substring(1, 3), 16).intValue(), Integer.valueOf(str.length() < 6 ? str.substring(2, 3) + str.substring(2, 3) : str.substring(3, 5), 16).intValue(), Integer.valueOf(str.length() < 6 ? str.substring(3, 4) + str.substring(3, 4) : str.substring(5, 7), 16).intValue());
    }

    public void run() {
        while (this.runAsync) {
            this.handler.post(new Runnable() {
                public void run() {
                    CircleProgress circleProgress = CircleProgress.this;
                    circleProgress.setValue(circleProgress.value, CircleProgress.this.total);
                }
            });
        }
    }

    public void prepare(int i) {
        this.stop = i;
        this.value = this.start;
        this.total = i;
        if (this.thread.isAlive()) {
            this.thread = new Thread(this);
        }
        this.thread.start();
    }
}
