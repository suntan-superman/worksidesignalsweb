// Toast Order Push
// Pushes orders from Merxus to Toast POS

import * as admin from 'firebase-admin';
import { createToastClient } from './toastClient';

/**
 * Push order to Toast POS
 */
export async function pushOrderToToast(
  restaurantId: string,
  orderId: string
): Promise<{ success: boolean; toastOrderId?: string; error?: string }> {
  try {
    console.log('📤 Pushing order to Toast:', { restaurantId, orderId });

    const db = admin.firestore();

    // Get order from Firestore
    const orderDoc = await db
      .collection('restaurants')
      .doc(restaurantId)
      .collection('orders')
      .doc(orderId)
      .get();

    if (!orderDoc.exists) {
      throw new Error('Order not found');
    }

    const order = orderDoc.data();

    // Transform Merxus order to Toast format
    const toastOrderData = await transformMerxusOrderToToast(restaurantId, order!);

    // Push to Toast
    const client = createToastClient(restaurantId);
    const response = await client.createOrder(toastOrderData);

    const toastOrderId = response.guid || response.id;

    // Update order with Toast order ID
    await db
      .collection('restaurants')
      .doc(restaurantId)
      .collection('orders')
      .doc(orderId)
      .update({
        posOrderId: toastOrderId,
        posStatus: 'sent_to_pos',
        posOrderNumber: `AI-${orderId.substring(0, 8)}`,
        sentToToastAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

    console.log('✅ Order pushed to Toast successfully:', {
      orderId,
      toastOrderId,
    });

    return {
      success: true,
      toastOrderId,
    };
  } catch (error: any) {
    console.error('❌ Failed to push order to Toast:', error);

    // Update order with error
    const db = admin.firestore();
    await db
      .collection('restaurants')
      .doc(restaurantId)
      .collection('orders')
      .doc(orderId)
      .update({
        posStatus: 'push_failed',
        posError: {
          message: error.message,
          timestamp: admin.firestore.FieldValue.serverTimestamp(),
        },
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Transform Merxus order to Toast format
 */
async function transformMerxusOrderToToast(
  restaurantId: string,
  order: any
): Promise<any> {
  const db = admin.firestore();

  // Get menu item mappings (to get Toast item GUIDs)
  const menuSnapshot = await db
    .collection('restaurants')
    .doc(restaurantId)
    .collection('menu')
    .where('source', '==', 'toast')
    .get();

  const menuMap = new Map();
  menuSnapshot.docs.forEach((doc) => {
    const data = doc.data();
    menuMap.set(doc.id, data.toastItemId); // Merxus ID → Toast GUID
    menuMap.set(data.name.toLowerCase(), data.toastItemId); // Name → Toast GUID (fallback)
  });

  // Transform order items
  const selections = [];
  for (const item of order.items || []) {
    // Try to find Toast GUID by Merxus menu item ID or name
    const toastItemId =
      menuMap.get(item.menuItemId) ||
      menuMap.get(item.name?.toLowerCase());

    if (!toastItemId) {
      console.warn(`⚠️ Toast item ID not found for: ${item.name}`);
      continue; // Skip items not in Toast menu
    }

    selections.push({
      itemGuid: toastItemId,
      quantity: item.quantity || 1,
      modifiers: [], // TODO: Add modifier support
      preDiscountPrice: item.price || 0,
      price: item.price || 0,
      tax: 0, // Toast will calculate
    });
  }

  // Build Toast order structure
  const toastOrder = {
    businessDate: new Date().toISOString().split('T')[0],
    estimatedFulfillmentDate: order.pickupTime
      ? new Date(order.pickupTime).toISOString()
      : new Date(Date.now() + 30 * 60 * 1000).toISOString(), // Default: 30 min from now
    source: 'THIRD_PARTY', // or 'ONLINE'
    checks: [
      {
        displayNumber: `AI-${order.id?.substring(0, 8)}`,
        selections,
        customer: {
          firstName: order.customerName?.split(' ')[0] || 'Guest',
          lastName: order.customerName?.split(' ').slice(1).join(' ') || '',
          phone: order.customerPhone || null,
          email: order.customerEmail || null,
        },
        orderType: order.orderType === 'delivery' ? 'DELIVERY' : 'TAKEOUT',
        deliveryInfo: order.orderType === 'delivery' && order.deliveryAddress
          ? {
              address: order.deliveryAddress,
            }
          : undefined,
      },
    ],
  };

  return toastOrder;
}

/**
 * Auto-push order to Toast when created (Firestore trigger)
 */
export async function autoPushOrderToToast(
  restaurantId: string,
  orderId: string
): Promise<void> {
  const db = admin.firestore();

  // Check if Toast integration is enabled
  const integrationDoc = await db
    .collection('restaurants')
    .doc(restaurantId)
    .collection('integrations')
    .doc('toast')
    .get();

  if (!integrationDoc.exists) {
    console.log('Toast not connected, skipping auto-push');
    return;
  }

  const integration = integrationDoc.data();
  if (!integration?.enabled || !integration?.syncSettings?.orderPushEnabled) {
    console.log('Toast order push not enabled, skipping');
    return;
  }

  // Push order
  await pushOrderToToast(restaurantId, orderId);
}
