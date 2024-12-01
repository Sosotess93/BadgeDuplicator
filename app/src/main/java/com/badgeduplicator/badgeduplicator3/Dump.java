package com.badgeduplicator.badgeduplicator3;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.lang.reflect.Array;

public class Dump {
    private ApiBadgeType apiBadgeType;
    private String apiCode = "";
    private String badgeNumber = "";
    private byte[][] blocks;
    private boolean complete = false;
    private byte[][][] sectorsKeys;

    public Dump(ApiBadgeType apiBadgeType2) {
        this.blocks = new byte[apiBadgeType2.getNbBlocks()][];
        int nbSectors = apiBadgeType2.getNbSectors();
        int[] iArr = new int[2];
        iArr[1] = 2;
        iArr[0] = nbSectors;
        this.sectorsKeys = (byte[][][]) Array.newInstance(byte[].class, iArr);
        this.apiBadgeType = apiBadgeType2;
    }

    public void loadFromString(String str) {
        int i = 0;
        this.complete = false;
        byte[] hexStringToByteArray = App.hexStringToByteArray(str);
        int length = hexStringToByteArray.length;
        int nbBlocks = this.apiBadgeType.getNbBlocks();
        int blockSize = this.apiBadgeType.getBlockSize();
        byte[] bArr = new byte[blockSize];
        int i2 = nbBlocks * blockSize;
        while (i < i2) {
            if (i < length) {
                int i3 = i % blockSize;
                bArr[i3] = hexStringToByteArray[i];
                if (i3 == blockSize - 1) {
                    setBlockBytes((int) Math.floor((double) (i / blockSize)), bArr);
                    bArr = new byte[blockSize];
                }
                i++;
            } else {
                return;
            }
        }
        this.complete = true;
    }

    public ApiBadgeType getApiBadgeType() {
        return this.apiBadgeType;
    }

    public boolean isComplete() {
        return this.complete;
    }

    public void setComplete(boolean z) {
        this.complete = z;
    }

    public int getNbBlocks() {
        return this.blocks.length;
    }

    public byte[] getBlockBytes(int i) {
        return this.blocks[i];
    }

    public void setBlockBytes(int i, byte[] bArr) {
        this.blocks[i] = bArr;
        this.complete = false;
    }

    public boolean hasSectorKeyA(int i) {
        return this.sectorsKeys[i][0] != null;
    }

    public boolean hasSectorKeyB(int i) {
        return this.sectorsKeys[i][1] != null;
    }

    public byte[] getSectorKeyA(int i) {
        return this.sectorsKeys[i][0];
    }

    public byte[] getSectorKeyB(int i) {
        return this.sectorsKeys[i][1];
    }

    public void setSectorKeyA(int i, byte[] bArr) {
        this.sectorsKeys[i][0] = bArr;
    }

    public void setSectorKeyB(int i, byte[] bArr) {
        this.sectorsKeys[i][1] = bArr;
    }

    public byte[] toByteArray() {
        ByteArrayOutputStream byteArrayOutputStream = new ByteArrayOutputStream();
        int length = this.blocks.length;
        int i = 0;
        while (i < length) {
            try {
                byteArrayOutputStream.write(this.blocks[i]);
                i++;
            } catch (IOException unused) {
                return null;
            }
        }
        return byteArrayOutputStream.toByteArray();
    }

    public String toHexString() {
        return App.byteArrayToHexString(toByteArray());
    }

    public int getTrailerBlockIndex(int i) {
        return (((int) Math.floor((double) (i / 4))) * 4) + 3;
    }

    public boolean isTrailerBlock(int i) {
        return getTrailerBlockIndex(i) == i;
    }

    public int getAccessBits(int i) {
        byte[] blockBytes = getBlockBytes(getTrailerBlockIndex(i));
        int i2 = 4;
        int i3 = 3 - (i % 4);
        int i4 = 7 - i3;
        if (((blockBytes[7] >> i4) & 1) != 1) {
            i2 = 0;
        }
        if (((blockBytes[8] >> (3 - i3)) & 1) == 1) {
            i2 |= 2;
        }
        return ((blockBytes[8] >> i4) & 1) == 1 ? i2 | 1 : i2;
    }

    public String getBadgeNumber() {
        return this.badgeNumber;
    }

    public boolean hasBadgeNumber() {
        return !this.badgeNumber.equals("");
    }

    public void setBadgeNumber(String str) {
        this.badgeNumber = str;
    }

    public String getAPICode() {
        return this.apiCode;
    }

    public boolean hasAPICode() {
        return !this.apiCode.equals("");
    }

    public void setAPICode(String str) {
        this.apiCode = str;
    }
}
