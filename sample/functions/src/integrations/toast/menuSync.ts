// Toast Menu Sync
// Syncs menu items from Toast to Merxus

import * as admin from 'firebase-admin';
import { createToastClient } from './toastClient';

/**
 * Sync menu from Toast to Merxus
 */
export async function syncMenuFromToast(restaurantId: string): Promise<{
  success: boolean;
  itemsAdded: number;
  itemsUpdated: number;
  itemsRemoved: number;
  error?: string;
}> {
  const startTime = Date.now();
  let itemsAdded = 0;
  let itemsUpdated = 0;
  let itemsRemoved = 0;

  try {
    console.log('📥 Starting menu sync from Toast:', restaurantId);

    const client = createToastClient(restaurantId);
    const db = admin.firestore();

    // Fetch menu items from Toast
    const toastItems = await client.fetchMenuItems();
    console.log(`Found ${toastItems.length} items in Toast`);

    // Get existing menu items from Merxus
    const menuSnapshot = await db
      .collection('restaurants')
      .doc(restaurantId)
      .collection('menu')
      .where('source', '==', 'toast')
      .get();

    const existingItems = new Map();
    menuSnapshot.docs.forEach((doc) => {
      existingItems.set(doc.data().toastItemId, doc.id);
    });

    // Process each Toast item
    for (const toastItem of toastItems) {
      const itemData = transformToastItemToMerxus(toastItem);
      const existingDocId = existingItems.get(toastItem.guid);

      if (existingDocId) {
        // Update existing item
        await db
          .collection('restaurants')
          .doc(restaurantId)
          .collection('menu')
          .doc(existingDocId)
          .update({
            ...itemData,
            syncedAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          });
        itemsUpdated++;
        existingItems.delete(toastItem.guid); // Mark as processed
      } else {
        // Add new item
        await db
          .collection('restaurants')
          .doc(restaurantId)
          .collection('menu')
          .add({
            ...itemData,
            syncedAt: admin.firestore.FieldValue.serverTimestamp(),
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          });
        itemsAdded++;
      }
    }

    // Mark remaining items as unavailable (removed from Toast)
    for (const [, docId] of existingItems.entries()) {
      await db
        .collection('restaurants')
        .doc(restaurantId)
        .collection('menu')
        .doc(docId as string)
        .update({
          available: false,
          removedFromToast: true,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      itemsRemoved++;
    }

    // Update sync metadata
    await db
      .collection('restaurants')
      .doc(restaurantId)
      .collection('integrations')
      .doc('toast')
      .update({
        'syncSettings.lastMenuSync': admin.firestore.FieldValue.serverTimestamp(),
        lastError: null,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

    const duration = Date.now() - startTime;
    console.log('✅ Menu sync completed:', {
      restaurantId,
      duration: `${duration}ms`,
      itemsAdded,
      itemsUpdated,
      itemsRemoved,
    });

    return {
      success: true,
      itemsAdded,
      itemsUpdated,
      itemsRemoved,
    };
  } catch (error: any) {
    console.error('❌ Menu sync failed:', error);

    // Log error to integration doc
    const db = admin.firestore();
    await db
      .collection('restaurants')
      .doc(restaurantId)
      .collection('integrations')
      .doc('toast')
      .update({
        lastError: {
          type: 'menu_sync_failed',
          message: error.message,
          timestamp: admin.firestore.FieldValue.serverTimestamp(),
        },
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

    return {
      success: false,
      itemsAdded,
      itemsUpdated,
      itemsRemoved,
      error: error.message,
    };
  }
}

/**
 * Transform Toast menu item to Merxus format
 */
function transformToastItemToMerxus(toastItem: any): any {
  return {
    toastItemId: toastItem.guid,
    name: toastItem.name,
    description: toastItem.description || '',
    category: toastItem.salesCategory?.name || 'Uncategorized',
    price: toastItem.price || 0,
    available: toastItem.visibility !== 'HIDDEN',
    source: 'toast',
    
    // Store original Toast data for reference
    toastData: {
      visibility: toastItem.visibility,
      salesCategory: toastItem.salesCategory,
      sku: toastItem.sku,
      plu: toastItem.plu,
      modifierGroups: toastItem.menuItemOptionGroups || [],
    },
  };
}

/**
 * Schedule menu sync (called by Cloud Scheduler)
 */
export async function scheduleMenuSync(): Promise<void> {
  const db = admin.firestore();

  // Get all restaurants with Toast enabled
  const snapshot = await db
    .collectionGroup('integrations')
    .where('provider', '==', 'toast')
    .where('enabled', '==', true)
    .where('syncSettings.menuSyncEnabled', '==', true)
    .get();

  console.log(`📅 Scheduled menu sync for ${snapshot.docs.length} restaurants`);

  for (const doc of snapshot.docs) {
    // Extract restaurant ID from path (integrations is a subcollection)
    const restaurantId = doc.ref.parent.parent?.id;
    if (!restaurantId) continue;

    try {
      await syncMenuFromToast(restaurantId);
    } catch (error) {
      console.error(`Failed to sync menu for ${restaurantId}:`, error);
    }
  }
}
