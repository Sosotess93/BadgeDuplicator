/*
 * Filename: navigation.ts
 * Project: /Users/sofiane/Desktop/PROJECT/BadgeDuplicator
 * Created Date: Thursday November 21st 2024
 * Author: Sofiane (sofiane@klark.app)
 * -----
 * Last Modified: Thursday, 21st November 2024 6:19:18 pm
 * Modified By: Sofiane (sofiane@klark.app)
 * -----
 * Copyright (c) 2024 Klark
 */

import { DumpData } from '../services/MifareService';

export type RootStackParamList = {
    HomeScreen: undefined;
    NFCRead: undefined;
    NFCWrite: undefined;
    BadgeDetail: {
        dumpData: DumpData;  // Doit être strictement DumpData, pas DumpData | undefined
    };
};

export type RootTabParamList = {
    Home: undefined;
    History: undefined;
    Profile: undefined;
};