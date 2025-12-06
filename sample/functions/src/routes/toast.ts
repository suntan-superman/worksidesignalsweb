// Toast POS Integration Routes

import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth';
import {
  authenticateToast,
  disconnectToast,
  isToastConnected,
  syncMenuFromToast,
  pushOrderToToast,
} from '../integrations/toast';

const router = Router();

// Apply auth middleware to all Toast routes
router.use(authenticate);

/**
 * POST /toast/connect
 * Connect Toast POS for a restaurant
 */
router.post('/toast/connect', async (req: Request, res: Response) => {
  try {
    const { restaurantId } = (req as any).user;
    const { clientId, clientSecret, restaurantGuid } = req.body;

    if (!clientId || !clientSecret || !restaurantGuid) {
      res.status(400).json({
        error: 'Missing required fields: clientId, clientSecret, restaurantGuid',
      });
      return;
    }

    const result = await authenticateToast(restaurantId, {
      clientId,
      clientSecret,
      restaurantGuid,
    });

    if (result.success) {
      res.json({
        success: true,
        message: 'Toast POS connected successfully',
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error,
      });
    }
  } catch (error: any) {
    console.error('Toast connect error:', error);
    res.status(500).json({
      error: 'Failed to connect Toast POS',
      details: error.message,
    });
  }
});

/**
 * POST /toast/disconnect
 * Disconnect Toast POS for a restaurant
 */
router.post('/toast/disconnect', async (req: Request, res: Response) => {
  try {
    const { restaurantId } = (req as any).user;

    await disconnectToast(restaurantId);

    res.json({
      success: true,
      message: 'Toast POS disconnected successfully',
    });
  } catch (error: any) {
    console.error('Toast disconnect error:', error);
    res.status(500).json({
      error: 'Failed to disconnect Toast POS',
      details: error.message,
    });
  }
});

/**
 * GET /toast/status
 * Check if Toast is connected
 */
router.get('/toast/status', async (req: Request, res: Response) => {
  try {
    const { restaurantId } = (req as any).user;

    const connected = await isToastConnected(restaurantId);

    res.json({
      connected,
      provider: 'toast',
    });
  } catch (error: any) {
    console.error('Toast status error:', error);
    res.status(500).json({
      error: 'Failed to check Toast status',
      details: error.message,
    });
  }
});

/**
 * POST /toast/sync-menu
 * Manually trigger menu sync from Toast
 */
router.post('/toast/sync-menu', async (req: Request, res: Response) => {
  try {
    const { restaurantId } = (req as any).user;

    const result = await syncMenuFromToast(restaurantId);

    res.json(result);
  } catch (error: any) {
    console.error('Toast menu sync error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to sync menu from Toast',
      details: error.message,
    });
  }
});

/**
 * POST /toast/push-order/:orderId
 * Manually push a specific order to Toast
 */
router.post('/toast/push-order/:orderId', async (req: Request, res: Response) => {
  try {
    const { restaurantId } = (req as any).user;
    const { orderId } = req.params;

    if (!orderId) {
      res.status(400).json({ error: 'Order ID is required' });
      return;
    }

    const result = await pushOrderToToast(restaurantId, orderId);

    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error: any) {
    console.error('Toast order push error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to push order to Toast',
      details: error.message,
    });
  }
});

export default router;
