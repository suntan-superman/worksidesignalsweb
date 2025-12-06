// Toast OAuth flow handlers

import * as admin from 'firebase-admin';
import axios from 'axios';

const TOAST_OAUTH_URL = 'https://ws-api.toasttab.com/authentication/v1/authentication/login';

/**
 * Toast OAuth Configuration
 */
export interface ToastOAuthConfig {
  clientId: string;
  clientSecret: string;
  restaurantGuid: string;
}

/**
 * Authenticate with Toast and store credentials
 */
export async function authenticateToast(
  restaurantId: string,
  config: ToastOAuthConfig
): Promise<{ success: boolean; error?: string }> {
  try {
    const { clientId, clientSecret, restaurantGuid } = config;

    // Toast uses client credentials flow for authentication
    const response = await axios.post(TOAST_OAUTH_URL, {
      clientId,
      clientSecret,
      userAccessType: 'TOAST_MACHINE_CLIENT',
    });

    const { accessToken, expiresIn } = response.data;
    const expiresAt = new Date(Date.now() + expiresIn * 1000);

    // Store credentials in Firestore
    const db = admin.firestore();
    await db
      .collection('restaurants')
      .doc(restaurantId)
      .collection('integrations')
      .doc('toast')
      .set({
        provider: 'toast',
        enabled: true,
        accessToken,
        expiresAt,
        restaurantGuid,
        clientId, // Store for future refreshes
        // NOTE: In production, encrypt clientSecret or use Secret Manager
        clientSecret, // TODO: Encrypt this
        syncSettings: {
          menuSyncEnabled: true,
          menuSyncFrequency: 'hourly',
          lastMenuSync: null,
          orderPushEnabled: true,
          inventorySyncEnabled: false,
        },
        status: 'connected',
        lastError: null,
        connectedAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

    // Update restaurant settings to indicate POS is connected
    await db
      .collection('restaurants')
      .doc(restaurantId)
      .update({
        'settings.posIntegration': {
          provider: 'toast',
          enabled: true,
          connectedAt: admin.firestore.FieldValue.serverTimestamp(),
        },
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

    console.log('✅ Toast authentication successful:', {
      restaurantId,
      restaurantGuid,
    });

    return { success: true };
  } catch (error: any) {
    console.error('❌ Toast authentication failed:', error.response?.data || error.message);
    
    return {
      success: false,
      error: error.response?.data?.message || error.message || 'Authentication failed',
    };
  }
}

/**
 * Disconnect Toast integration
 */
export async function disconnectToast(restaurantId: string): Promise<void> {
  const db = admin.firestore();

  // Mark as disconnected
  await db
    .collection('restaurants')
    .doc(restaurantId)
    .collection('integrations')
    .doc('toast')
    .update({
      enabled: false,
      status: 'disconnected',
      disconnectedAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

  // Update restaurant settings
  await db
    .collection('restaurants')
    .doc(restaurantId)
    .update({
      'settings.posIntegration.enabled': false,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

  console.log('✅ Toast disconnected:', restaurantId);
}

/**
 * Check if Toast is connected and enabled
 */
export async function isToastConnected(restaurantId: string): Promise<boolean> {
  const db = admin.firestore();
  
  const doc = await db
    .collection('restaurants')
    .doc(restaurantId)
    .collection('integrations')
    .doc('toast')
    .get();

  if (!doc.exists) {
    return false;
  }

  const data = doc.data();
  return data?.enabled === true && data?.status === 'connected';
}
