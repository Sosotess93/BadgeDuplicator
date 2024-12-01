package com.badgeduplicator.badgeduplicator3;

public interface DumpReaderEventListener {
    void onFailure(DumpFailures dumpFailures);

    void onProgress(int i, int i2, Dump dump);

    void onStart();

    void onSuccess(Dump dump);
}
