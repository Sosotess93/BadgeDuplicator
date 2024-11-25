/*
 * Filename: HapticService.ts
 * Project: /Users/sofiane/Desktop/PROJECT/BadgeDuplicator
 * Created Date: Saturday November 23rd 2024
 * Author: Sofiane (sofiane@klark.app)
 * -----
 * Last Modified: Saturday, 23rd November 2024 1:25:58 am
 * Modified By: Sofiane (sofiane@klark.app)
 * -----
 * Copyright (c) 2024 Klark
 */

// src/services/HapticService.ts

import { Vibration, PermissionsAndroid, Platform } from 'react-native';

export class HapticService {
    private static instance: HapticService;
    private hasPermission: boolean = false;

    private constructor() { }

    public static getInstance(): HapticService {
        if (!HapticService.instance) {
            HapticService.instance = new HapticService();
        }
        return HapticService.instance;
    }

    public async requestPermissions(): Promise<boolean> {
        if (Platform.OS === 'android') {
            try {
                const granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.VIBRATE,
                    {
                        title: 'Permission de vibration',
                        message: 'L\'application a besoin de la permission de vibration pour vous donner un retour tactile lors de la lecture des badges.',
                        buttonPositive: 'Accepter',
                        buttonNegative: 'Refuser',
                    }
                );
                this.hasPermission = granted === PermissionsAndroid.RESULTS.GRANTED;
                return this.hasPermission;
            } catch (err) {
                console.warn('Erreur lors de la demande de permission:', err);
                this.hasPermission = false;
                return false;
            }
        }
        // Sur iOS, pas besoin de permission
        this.hasPermission = true;
        return true;
    }

    private vibrateIfPermitted(pattern: number | number[]): void {
        if (this.hasPermission) {
            Vibration.vibrate(pattern);
        }
    }

    public startScan(): void {
        this.vibrateIfPermitted(50);
    }

    public tagDetected(): void {
        this.vibrateIfPermitted(100);
    }

    public success(): void {
        this.vibrateIfPermitted([0, 50, 50, 50]);
    }

    public error(): void {
        this.vibrateIfPermitted([0, 100, 50, 100]);
    }
}

export default HapticService;