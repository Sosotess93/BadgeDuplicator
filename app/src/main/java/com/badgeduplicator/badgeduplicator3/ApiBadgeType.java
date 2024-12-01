package com.badgeduplicator.badgeduplicator3;

import android.nfc.tech.MifareClassic;
import android.nfc.tech.MifareUltralight;

public class ApiBadgeType {
    protected int blockSize;
    protected int nbBlocks;
    protected int nbSectors;
    protected String type;

    public static ApiBadgeType getFor_mc1k() {
        return new ApiBadgeType("mc1k", 16, 64, 16);
    }

    public static ApiBadgeType getFor_mc2k() {
        return new ApiBadgeType("mc2k", 32, 128, 16);
    }

    public static ApiBadgeType getFor_mc4k() {
        return new ApiBadgeType("mc4k", 40, 256, 16);
    }

    public static ApiBadgeType getFor_mc320() {
        return new ApiBadgeType("mc320", 5, 20, 16);
    }

    public static ApiBadgeType getFor_mu64() {
        return new ApiBadgeType("mu64", 1, 4, 4);
    }

    public static ApiBadgeType getFor_mu192() {
        return new ApiBadgeType("mu192", 1, 48, 4);
    }

    public static ApiBadgeType getFrom(String str) {
        int length = str.length() / 2;
        if (length == 64) {
            return getFor_mu64();
        }
        if (length == 192) {
            return getFor_mu192();
        }
        if (length == 320) {
            return getFor_mc320();
        }
        if (length == 1024) {
            return getFor_mc1k();
        }
        if (length == 2048) {
            return getFor_mc2k();
        }
        if (length != 4096) {
            return null;
        }
        return getFor_mc4k();
    }

    public static ApiBadgeType getFrom(MifareClassic mifareClassic) {
        int size = mifareClassic.getSize();
        if (size == 320) {
            return getFor_mc320();
        }
        if (size == 1024) {
            return getFor_mc1k();
        }
        if (size == 2048) {
            return getFor_mc2k();
        }
        if (size != 4096) {
            return null;
        }
        return getFor_mc4k();
    }

    public static ApiBadgeType getFrom(MifareUltralight mifareUltralight) {
        int type2 = mifareUltralight.getType();
        if (type2 == 1) {
            return getFor_mu64();
        }
        if (type2 != 2) {
            return null;
        }
        return getFor_mu192();
    }

    public ApiBadgeType(String str, int i, int i2, int i3) {
        this.type = str;
        this.nbSectors = i;
        this.nbBlocks = i2;
        this.blockSize = i3;
    }

    public String getType() {
        return this.type;
    }

    public int getNbSectors() {
        return this.nbSectors;
    }

    public int getNbBlocks() {
        return this.nbBlocks;
    }

    public int getBlockSize() {
        return this.blockSize;
    }
}
