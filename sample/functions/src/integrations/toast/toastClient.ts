// Toast POS API Client
// Handles authentication and API requests to Toast POS

import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import * as admin from 'firebase-admin';

/**
 * Toast API Configuration
 * Sandbox: https://ws-api.eng.toasttab.com
 * Production: https://ws-api.toasttab.com
 */
const TOAST_API_BASE_URL = process.env.TOAST_ENV === 'production'
  ? 'https://ws-api.toasttab.com'
  : 'https://ws-sandbox-api.eng.toasttab.com';

const TOAST_OAUTH_URL = 'https://ws-api.toasttab.com/authentication/v1/authentication/login';

/**
 * Toast API Client
 */
export class ToastClient {
  private client: AxiosInstance;
  private restaurantId: string;
  private db: admin.firestore.Firestore;

  constructor(restaurantId: string) {
    this.restaurantId = restaurantId;
    this.db = admin.firestore();
    
    this.client = axios.create({
      baseURL: TOAST_API_BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor to inject auth token
    this.client.interceptors.request.use(
      async (config) => {
        const token = await this.getAccessToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          // Token expired, try to refresh
          console.log('Toast token expired, refreshing...');
          await this.refreshAccessToken();
          // Retry the request
          return this.client.request(error.config);
        }
        return Promise.reject(error);
      }
    );
  }

  /**
   * Get access token from Firestore
   */
  private async getAccessToken(): Promise<string | null> {
    try {
      const doc = await this.db
        .collection('restaurants')
        .doc(this.restaurantId)
        .collection('integrations')
        .doc('toast')
        .get();

      if (!doc.exists) {
        return null;
      }

      const data = doc.data();
      return data?.accessToken || null;
    } catch (error) {
      console.error('Error getting Toast access token:', error);
      return null;
    }
  }

  /**
   * Refresh access token using refresh token
   */
  private async refreshAccessToken(): Promise<void> {
    try {
      const doc = await this.db
        .collection('restaurants')
        .doc(this.restaurantId)
        .collection('integrations')
        .doc('toast')
        .get();

      if (!doc.exists) {
        throw new Error('Toast integration not found');
      }

      const data = doc.data();
      const refreshToken = data?.refreshToken;

      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      // Toast uses client credentials for token refresh
      const response = await axios.post(TOAST_OAUTH_URL, {
        clientId: process.env.TOAST_CLIENT_ID,
        clientSecret: process.env.TOAST_CLIENT_SECRET,
        userAccessType: 'TOAST_MACHINE_CLIENT',
      });

      const { accessToken, expiresIn } = response.data;
      const expiresAt = new Date(Date.now() + expiresIn * 1000);

      // Update token in Firestore
      await this.db
        .collection('restaurants')
        .doc(this.restaurantId)
        .collection('integrations')
        .doc('toast')
        .update({
          accessToken,
          expiresAt,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

      console.log('Toast access token refreshed successfully');
    } catch (error) {
      console.error('Error refreshing Toast access token:', error);
      throw error;
    }
  }

  /**
   * Make authenticated request to Toast API
   */
  private async request<T>(config: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.client.request<T>(config);
      return response.data;
    } catch (error: any) {
      console.error('Toast API request failed:', {
        url: config.url,
        method: config.method,
        status: error.response?.status,
        message: error.message,
        data: error.response?.data,
      });
      throw error;
    }
  }

  /**
   * Get restaurant GUID (Toast's restaurant identifier)
   */
  async getRestaurantGuid(): Promise<string | null> {
    try {
      const doc = await this.db
        .collection('restaurants')
        .doc(this.restaurantId)
        .collection('integrations')
        .doc('toast')
        .get();

      return doc.data()?.restaurantGuid || null;
    } catch (error) {
      console.error('Error getting restaurant GUID:', error);
      return null;
    }
  }

  /**
   * Fetch menu from Toast
   */
  async fetchMenu(): Promise<any> {
    const restaurantGuid = await this.getRestaurantGuid();
    if (!restaurantGuid) {
      throw new Error('Restaurant GUID not found');
    }

    return this.request({
      method: 'GET',
      url: `/menus/v2/menus`,
      params: { restaurantGuid },
    });
  }

  /**
   * Fetch menu items from Toast
   */
  async fetchMenuItems(): Promise<any[]> {
    const restaurantGuid = await this.getRestaurantGuid();
    if (!restaurantGuid) {
      throw new Error('Restaurant GUID not found');
    }

    const response = await this.request<any>({
      method: 'GET',
      url: `/menus/v2/items`,
      params: { restaurantGuid },
    });

    return response.items || [];
  }

  /**
   * Create order in Toast
   */
  async createOrder(orderData: any): Promise<any> {
    const restaurantGuid = await this.getRestaurantGuid();
    if (!restaurantGuid) {
      throw new Error('Restaurant GUID not found');
    }

    return this.request({
      method: 'POST',
      url: `/orders/v2/orders`,
      params: { restaurantGuid },
      data: orderData,
    });
  }

  /**
   * Get inventory counts
   */
  async getInventory(): Promise<any> {
    const restaurantGuid = await this.getRestaurantGuid();
    if (!restaurantGuid) {
      throw new Error('Restaurant GUID not found');
    }

    return this.request({
      method: 'GET',
      url: `/inventory/v2/counts`,
      params: { restaurantGuid },
    });
  }

  /**
   * Get restaurant details
   */
  async getRestaurantDetails(): Promise<any> {
    const restaurantGuid = await this.getRestaurantGuid();
    if (!restaurantGuid) {
      throw new Error('Restaurant GUID not found');
    }

    return this.request({
      method: 'GET',
      url: `/restaurants/v2/restaurants/${restaurantGuid}`,
    });
  }
}

/**
 * Create Toast client for a restaurant
 */
export function createToastClient(restaurantId: string): ToastClient {
  return new ToastClient(restaurantId);
}
