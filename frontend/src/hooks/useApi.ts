/**
 * Custom hook for authentication
 */

import { useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import {
  getAccessToken,
  clearLegacyLocalStorageTokens,
} from "@/utils/authStorage";

export const useAuth = () => {
  const { user, isAuthenticated, isLoading, error, fetchCurrentUser } =
    useAuthStore();

  useEffect(() => {
    const token = getAccessToken();
    if (token && !user) {
      fetchCurrentUser().catch(() => {
        // User not logged in, loading will be set to false in store
      });
    } else if (!token) {
      // No token, set loading to false immediately
      useAuthStore.setState({ isLoading: false });
    }
  }, []); // Empty dependency array to run only once on mount

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
  };
};

/**
 * Custom hook for API data fetching with React Query
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/services/api";

export const useAuctions = (params?: any) => {
  return useQuery({
    queryKey: ["auctions", params],
    queryFn: () => apiClient.getAuctions(params),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useAuction = (id: number) => {
  return useQuery({
    queryKey: ["auction", id],
    queryFn: () => apiClient.getAuction(id),
    enabled: !!id,
  });
};

export const useCreateAuction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => apiClient.createAuction(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auctions"] });
    },
  });
};

export const useUpdateAuction = (id: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => apiClient.updateAuction(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auction", id] });
      queryClient.invalidateQueries({ queryKey: ["auctions"] });
    },
  });
};

export const usePlaceBid = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      auctionId,
      amount,
    }: {
      auctionId: number;
      amount: number;
    }) => apiClient.placeBid(auctionId, amount),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auction"] });
      queryClient.invalidateQueries({ queryKey: ["bidding"] });
    },
  });
};

export const useWatchlist = () => {
  return useQuery({
    queryKey: ["watchlist"],
    queryFn: () => apiClient.getWatchlist(),
    staleTime: 0, // Data is always considered stale
    refetchOnMount: "stale",
    refetchOnWindowFocus: "stale",
    refetchOnReconnect: "stale",
    gcTime: 0, // Don't cache in garbage collection - always refetch
  });
};

export const useAddToWatchlist = () => {
  return useWatchlistMutation({
    label: "ADD",
    actionText: "Adding",
    actionTarget: "to",
    mutation: (auctionId) => apiClient.addToWatchlist(auctionId),
  });
};

export const useRemoveFromWatchlist = () => {
  return useWatchlistMutation({
    label: "REMOVE",
    actionText: "Removing",
    actionTarget: "from",
    mutation: (auctionId) => apiClient.removeFromWatchlist(auctionId),
  });
};

const useWatchlistMutation = ({
  label,
  actionText,
  actionTarget,
  mutation,
}: {
  label: string;
  actionText: string;
  actionTarget: "to" | "from";
  mutation: (auctionId: number) => Promise<any>;
}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (auctionId: number) => {
      console.log(
        `[${label}] ${actionText} auction ${auctionId} ${actionTarget} watchlist`,
      );
      const result = await mutation(auctionId);
      console.log(`[${label}] API response:`, result);
      return result;
    },
    onSuccess: async () => {
      console.log(
        `[${label}] onSuccess - invalidating and refetching watchlist`,
      );
      await queryClient.invalidateQueries({ queryKey: ["watchlist"] });
      await queryClient.refetchQueries({ queryKey: ["watchlist"] });
      console.log(`[${label}] Refetch completed`);
    },
    onError: (error) => {
      console.error(`[${label}] Error:`, error);
    },
  });
};

export const useNotifications = () => {
  return useQuery({
    queryKey: ["notifications"],
    queryFn: () => apiClient.getNotifications(),
    refetchInterval: 1000 * 30, // Refetch every 30 seconds
  });
};
