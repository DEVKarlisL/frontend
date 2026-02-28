/**
 * API Service Layer
 */

import axios, { AxiosInstance, AxiosError } from "axios";
import { AuthTokens, User, PaginatedResponse } from "@/types";
import {
  getAccessToken,
  getRefreshToken,
  setTokens,
  clearTokens,
} from "@/utils/authStorage";

const API_URL =
  (import.meta as any).env.VITE_API_URL || "http://localhost:8002/api";

const MEDIA_URL =
  (import.meta as any).env.VITE_API_MEDIA_URL || "http://localhost:8002";

/**
 * Convert relative media URL to absolute URL
 */
export const getMediaUrl = (path: string | null | undefined): string => {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }
  return `${MEDIA_URL}${path}`;
};

const shouldLogWatchlist = (url?: string) =>
  Boolean(url?.includes("watchlist"));

const logWatchlistRequest = (method: string | undefined, url?: string) => {
  console.log(`[API] ${method?.toUpperCase()} ${url} with token`);
};

const logWatchlistRequestNoToken = (
  method: string | undefined,
  url?: string,
) => {
  console.log(`[API] ${method?.toUpperCase()} ${url} NO TOKEN`);
};

const logWatchlistResponse = (status: number, url?: string, data?: unknown) => {
  console.log(`[API RESPONSE] ${status} from ${url}`, {
    dataLength: Array.isArray(data) ? data.length : "N/A",
  });
};

class APIClient {
  private client: AxiosInstance;
  private baseURL: string;

  constructor(baseURL: string = API_URL) {
    this.baseURL = baseURL;
    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Add token to requests
    this.client.interceptors.request.use((config) => {
      const token = getAccessToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        if (shouldLogWatchlist(config.url)) {
          logWatchlistRequest(config.method, config.url);
        }
      } else {
        if (shouldLogWatchlist(config.url)) {
          logWatchlistRequestNoToken(config.method, config.url);
        }
      }
      return config;
    });

    // Handle token refresh
    this.client.interceptors.response.use(
      (response) => {
        if (shouldLogWatchlist(response.config.url)) {
          logWatchlistResponse(
            response.status,
            response.config.url,
            response.data,
          );
        }
        return response;
      },
      async (error: AxiosError) => {
        const originalRequest = error.config;
        if (error.response?.status === 401 && originalRequest) {
          try {
            const refreshToken = getRefreshToken();
            if (refreshToken) {
              const response = await axios.post(
                `${this.baseURL}/auth/token/refresh/`,
                { refresh: refreshToken },
              );
              const { access } = response.data;
              setTokens(access, refreshToken);
              originalRequest.headers.Authorization = `Bearer ${access}`;
              return this.client(originalRequest);
            }
          } catch {
            // Redirect to login
            clearTokens();
            window.location.href = "/login";
          }
        }
        return Promise.reject(error);
      },
    );
  }

  // Auth endpoints
  async login(username: string, password: string): Promise<AuthTokens> {
    const response = await this.client.post("/auth/token/", {
      username,
      password,
    });
    const { access, refresh } = response.data;
    setTokens(access, refresh);
    return { access, refresh };
  }

  async loginWithGoogle(googleToken: string): Promise<any> {
    const response = await this.client.post("/users/auth/google/", {
      token: googleToken,
    });
    return response.data;
  }

  async logout(): Promise<void> {
    clearTokens();
  }

  async register(data: any): Promise<User> {
    const response = await this.client.post("/users/register/", data);
    return response.data;
  }

  // User endpoints
  async getCurrentUser(): Promise<User> {
    const response = await this.client.get("/users/me/");
    return response.data;
  }

  async updateProfile(data: Partial<User>): Promise<User> {
    const response = await this.client.put("/users/profile/", data);
    return response.data;
  }

  // Auction endpoints
  async getAuctions(params?: any): Promise<PaginatedResponse<any>> {
    const response = await this.client.get("/auctions/", { params });
    return response.data;
  }

  async getAuction(id: number): Promise<any> {
    const response = await this.client.get(`/auctions/${id}/`);
    return response.data;
  }

  async createAuction(data: any): Promise<any> {
    const response = await this.client.post("/auctions/", data);
    return response.data;
  }

  async updateAuction(id: number, data: any): Promise<any> {
    const response = await this.client.patch(`/auctions/${id}/`, data);
    return response.data;
  }

  async activateAuction(id: number): Promise<any> {
    const response = await this.client.post(`/auctions/${id}/activate/`);
    return response.data;
  }

  // Bid endpoints
  async placeBid(auctionId: number, amount: number): Promise<any> {
    const response = await this.client.post("/bidding/bids/", {
      auction: auctionId,
      amount,
    });
    return response.data;
  }

  async getBids(auctionId: number): Promise<any[]> {
    const response = await this.client.get("/bidding/bids/auction_bids/", {
      params: { auction_id: auctionId },
    });
    return response.data;
  }

  // Watchlist endpoints
  async getWatchlist(): Promise<any[]> {
    const response = await this.client.get("/auctions/watchlist/");
    return response.data;
  }

  async addToWatchlist(auctionId: number): Promise<any> {
    const response = await this.client.post("/auctions/watchlist/", {
      auction_id: auctionId,
    });
    return response.data;
  }

  async removeFromWatchlist(auctionId: number): Promise<void> {
    await this.client.delete("/auctions/watchlist/", {
      data: { auction_id: auctionId },
    });
  }

  // Notification endpoints
  async getNotifications(): Promise<any[]> {
    const response = await this.client.get("/notifications/notifications/");
    return response.data;
  }

  async markNotificationAsRead(id: number): Promise<void> {
    await this.client.post(`/notifications/notifications/${id}/mark_as_read/`);
  }

  // Generic request
  get<T = any>(url: string, config?: any) {
    return this.client.get<T>(url, config);
  }

  post<T = any>(url: string, data?: any, config?: any) {
    return this.client.post<T>(url, data, config);
  }

  put<T = any>(url: string, data?: any, config?: any) {
    return this.client.put<T>(url, data, config);
  }

  patch<T = any>(url: string, data?: any, config?: any) {
    return this.client.patch<T>(url, data, config);
  }

  delete<T = any>(url: string, config?: any) {
    return this.client.delete<T>(url, config);
  }
}

export const apiClient = new APIClient();
export default apiClient;
