package com.badgeduplicator.badgeduplicator3;

import android.nfc.Tag;
import android.nfc.TagLostException;
import android.nfc.tech.MifareClassic;
import android.nfc.tech.MifareUltralight;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Iterator;
import java.util.List;

public class DumpReader extends Thread {
    /* access modifiers changed from: private */
    public List<byte[]> additionnalKeys = new ArrayList();
    /* access modifiers changed from: private */
    public List<DumpReaderEventListener> eventListeners = new ArrayList();
    /* access modifiers changed from: private */
    public Tag tag;

    public DumpReader(Tag tag2) {
        this.tag = tag2;
    }

    public void addAdditionnalKey(byte[] bArr) {
        if (!this.additionnalKeys.contains(bArr)) {
            this.additionnalKeys.add(bArr);
        }
    }

    public void addEventListener(DumpReaderEventListener dumpReaderEventListener) {
        this.eventListeners.add(dumpReaderEventListener);
    }

    public void run() {
        super.run();
        for (DumpReaderEventListener onStart : this.eventListeners) {
            onStart.onStart();
        }
        List asList = Arrays.asList(this.tag.getTechList());
        if (asList.contains(MifareClassic.class.getName())) {
            ReaderMifareClassic readerMifareClassic = new ReaderMifareClassic();
            readerMifareClassic.read();
            readerMifareClassic.tryClose();
        } else if (asList.contains(MifareUltralight.class.getName())) {
            ReaderMifareUltralight readerMifareUltralight = new ReaderMifareUltralight();
            readerMifareUltralight.read();
            readerMifareUltralight.tryClose();
        } else {
            for (DumpReaderEventListener onFailure : this.eventListeners) {
                onFailure.onFailure(DumpFailures.TAG_TYPE_UNSUPPORTED);
            }
        }
    }

    class ReaderMifareUltralight {
        protected Dump dump = new Dump(ApiBadgeType.getFrom(this.mu));
        private MifareUltralight mu;

        public ReaderMifareUltralight() {
            this.mu = MifareUltralight.get(DumpReader.this.tag);
            tryClose();
        }

        public boolean tryConnect() {
            if (!this.mu.isConnected()) {
                try {
                    this.mu.connect();
                } catch (IOException unused) {
                }
            }
            return this.mu.isConnected();
        }

        public boolean tryClose() {
            try {
                this.mu.close();
            } catch (IOException unused) {
            }
            return !this.mu.isConnected();
        }

        public void read() {
            if (!tryConnect()) {
                for (DumpReaderEventListener onFailure : DumpReader.this.eventListeners) {
                    onFailure.onFailure(DumpFailures.TAG_LOST);
                }
                return;
            }
            int i = 0;
            while (i < 4) {
                try {
                    byte[] readPages = this.mu.readPages(i * 4);
                    System.out.println(i + " : " + App.byteArrayToHexString(readPages));
                    this.dump.setBlockBytes(i, readPages);
                    for (DumpReaderEventListener onProgress : DumpReader.this.eventListeners) {
                        onProgress.onProgress(i, 4, this.dump);
                    }
                    i++;
                } catch (TagLostException unused) {
                    tryClose();
                    for (DumpReaderEventListener onFailure2 : DumpReader.this.eventListeners) {
                        onFailure2.onFailure(DumpFailures.TAG_LOST);
                    }
                    return;
                } catch (IOException unused2) {
                    tryClose();
                    for (DumpReaderEventListener onFailure3 : DumpReader.this.eventListeners) {
                        onFailure3.onFailure(DumpFailures.SECTOR_UNREADABLE);
                    }
                    return;
                }
            }
            this.dump.setComplete(true);
            tryClose();
            for (DumpReaderEventListener onSuccess : DumpReader.this.eventListeners) {
                onSuccess.onSuccess(this.dump);
            }
        }
    }

    class ReaderMifareClassic {
        protected Dump dump;
        private MifareClassic mc;
        protected List<byte[]> prefered_keys = new ArrayList();
        protected List<byte[]> valid_keys = new ArrayList();

        public ReaderMifareClassic() {
            this.mc = MifareClassic.get(DumpReader.this.tag);
            tryClose();
            this.dump = new Dump(ApiBadgeType.getFrom(this.mc));
        }

        public boolean tryConnect() {
            if (!this.mc.isConnected()) {
                try {
                    this.mc.connect();
                } catch (IOException unused) {
                }
            }
            return this.mc.isConnected();
        }

        public boolean tryClose() {
            try {
                this.mc.close();
            } catch (IOException unused) {
            }
            return !this.mc.isConnected();
        }

        public void read() {
            if (!tryConnect()) {
                for (DumpReaderEventListener onFailure : DumpReader.this.eventListeners) {
                    onFailure.onFailure(DumpFailures.TAG_LOST);
                }
                return;
            }
            int blockCount = this.mc.getBlockCount();
            for (DumpReaderEventListener onProgress : DumpReader.this.eventListeners) {
                onProgress.onProgress(0, blockCount, this.dump);
            }
            int i = 0;
            int i2 = 0;
            while (i2 < 5) {
                int i3 = i;
                int i4 = 0;
                while (i4 < this.mc.getSectorCount()) {
                    try {
                        FoundKey foundKey = new FoundKey(this.dump.hasSectorKeyA(i4), this.dump.hasSectorKeyB(i4));
                        if (!foundKey.hasKeyA() || !foundKey.hasKeyB()) {
                            Iterator<byte[]> it = this.valid_keys.iterator();
                            while (true) {
                                if (!it.hasNext()) {
                                    byte[] bArr = MifareClassic.KEY_DEFAULT;
                                    if (!this.valid_keys.contains(bArr)) {
                                        checkSectorKey(i4, bArr, foundKey, this.dump, false);
                                        if (foundKey.hasKeyA() && foundKey.hasKeyB()) {
                                        }
                                    }
                                    Iterator it2 = DumpReader.this.additionnalKeys.iterator();
                                    while (true) {
                                        if (!it2.hasNext()) {
                                            Iterator<byte[]> it3 = this.prefered_keys.iterator();
                                            while (true) {
                                                if (!it3.hasNext()) {
                                                    Iterator<List<byte[]>> it4 = App.getAvailableGroupedKeys().iterator();
                                                    while (true) {
                                                        if (!it4.hasNext()) {
                                                            break;
                                                        }
                                                        List next = it4.next();
                                                        Iterator it5 = next.iterator();
                                                        boolean z = false;
                                                        while (true) {
                                                            if (it5.hasNext()) {
                                                                List list = next;
                                                                checkSectorKey(i4, (byte[]) it5.next(), foundKey, this.dump, false);
                                                                if ((foundKey.hasKeyA() || foundKey.hasKeyB()) && !z) {
                                                                    addPreferedKeys(list);
                                                                    z = true;
                                                                }
                                                                if (foundKey.hasKeyA() && foundKey.hasKeyB()) {
                                                                    break;
                                                                }
                                                                next = list;
                                                            }
                                                        }
                                                    }
                                                } else {
                                                    checkSectorKey(i4, it3.next(), foundKey, this.dump, false);
                                                    if (foundKey.hasKeyA() && foundKey.hasKeyB()) {
                                                        break;
                                                    }
                                                }
                                            }
                                        } else {
                                            checkSectorKey(i4, (byte[]) it2.next(), foundKey, this.dump, true);
                                            if (foundKey.hasKeyA() && foundKey.hasKeyB()) {
                                                break;
                                            }
                                        }
                                    }
                                } else {
                                    checkSectorKey(i4, it.next(), foundKey, this.dump, true);
                                    if (foundKey.hasKeyA() && foundKey.hasKeyB()) {
                                        break;
                                    }
                                }
                            }
                        }
                        if (foundKey.hasKeyA()) {
                            if (foundKey.hasKeyB()) {
                                int blockCountInSector = this.mc.getBlockCountInSector(i4);
                                for (int i5 = 0; i5 < blockCountInSector; i5++) {
                                    int sectorToBlock = this.mc.sectorToBlock(i4) + i5;
                                    byte[] sectorKeyA = this.dump.getSectorKeyA(i4);
                                    byte[] sectorKeyB = this.dump.getSectorKeyB(i4);
                                    if ((!tryConnect() || !this.mc.authenticateSectorWithKeyA(i4, sectorKeyA)) && (!tryConnect() || !this.mc.authenticateSectorWithKeyB(i4, sectorKeyB))) {
                                        tryClose();
                                        for (DumpReaderEventListener onFailure2 : DumpReader.this.eventListeners) {
                                            onFailure2.onFailure(DumpFailures.SECTOR_UNREADABLE);
                                        }
                                        return;
                                    }
                                    byte[] readBlock = this.mc.readBlock(sectorToBlock);
                                    if (i5 == blockCountInSector - 1) {
                                        for (int i6 = 0; i6 < sectorKeyA.length; i6++) {
                                            readBlock[i6] = sectorKeyA[i6];
                                        }
                                        int length = readBlock.length - sectorKeyB.length;
                                        for (int i7 = 0; i7 < sectorKeyB.length; i7++) {
                                            readBlock[length + i7] = sectorKeyB[i7];
                                        }
                                    }
                                    this.dump.setBlockBytes(sectorToBlock, readBlock);
                                    i3++;
                                    for (DumpReaderEventListener onProgress2 : DumpReader.this.eventListeners) {
                                        onProgress2.onProgress(i3, blockCount, this.dump);
                                    }
                                }
                                i4++;
                            }
                        }
                        tryClose();
                        for (DumpReaderEventListener onFailure3 : DumpReader.this.eventListeners) {
                            onFailure3.onFailure(DumpFailures.KEY_UNKNOWN);
                        }
                        return;
                    } catch (TagLostException unused) {
                        tryClose();
                        for (DumpReaderEventListener onFailure4 : DumpReader.this.eventListeners) {
                            onFailure4.onFailure(DumpFailures.TAG_LOST);
                        }
                        return;
                    } catch (IOException unused2) {
                        i = i3;
                        i2++;
                        if (i2 >= 5) {
                            tryClose();
                            for (DumpReaderEventListener onFailure5 : DumpReader.this.eventListeners) {
                                onFailure5.onFailure(DumpFailures.SECTOR_UNREADABLE);
                            }
                        }
                    }
                }
                if (i3 == blockCount) {
                    this.dump.setComplete(true);
                    tryClose();
                    for (DumpReaderEventListener onSuccess : DumpReader.this.eventListeners) {
                        onSuccess.onSuccess(this.dump);
                    }
                    return;
                }
                return;
            }
        }

        /* access modifiers changed from: protected */
        public void addPreferedKeys(List<byte[]> list) {
            int i = 0;
            for (int i2 = 0; i2 < list.size(); i2++) {
                byte[] bArr = list.get(i2);
                this.prefered_keys.remove(bArr);
                if (!this.valid_keys.contains(bArr)) {
                    this.prefered_keys.add(i, bArr);
                    i++;
                }
            }
        }

        private void checkSectorKey(int i, byte[] bArr, FoundKey foundKey, Dump dump2, boolean z) throws IOException {
            if (!tryConnect()) {
                for (DumpReaderEventListener onFailure : DumpReader.this.eventListeners) {
                    onFailure.onFailure(DumpFailures.TAG_LOST);
                }
                return;
            }
            if (!foundKey.hasKeyA() && this.mc.authenticateSectorWithKeyA(i, bArr)) {
                dump2.setSectorKeyA(i, bArr);
                foundKey.setKeyA(true);
                if (!z && !this.valid_keys.contains(bArr)) {
                    this.valid_keys.remove(bArr);
                    this.valid_keys.add(0, bArr);
                }
            }
            if (!tryConnect()) {
                for (DumpReaderEventListener onFailure2 : DumpReader.this.eventListeners) {
                    onFailure2.onFailure(DumpFailures.TAG_LOST);
                }
            } else if (!foundKey.hasKeyB() && this.mc.authenticateSectorWithKeyB(i, bArr)) {
                dump2.setSectorKeyB(i, bArr);
                foundKey.setKeyB(true);
                if (!z && !this.valid_keys.contains(bArr)) {
                    this.valid_keys.remove(bArr);
                    this.valid_keys.add(0, bArr);
                }
            }
        }

        protected class FoundKey {
            protected boolean key_a;
            protected boolean key_b;

            public FoundKey(boolean z, boolean z2) {
                this.key_a = z;
                this.key_b = z2;
            }

            public void setKeyA(boolean z) {
                this.key_a = z;
            }

            public void setKeyB(boolean z) {
                this.key_b = z;
            }

            public boolean hasKeyA() {
                return this.key_a;
            }

            public boolean hasKeyB() {
                return this.key_b;
            }
        }
    }
}
