/**
 * Zustand store for auction state
 */

import { create } from "zustand";
import { Auction } from "@/types";

interface AuctionStore {
  auctions: Auction[];
  selectedAuction: Auction | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  setAuctions: (auctions: Auction[]) => void;
  setSelectedAuction: (auction: Auction | null) => void;
  setIsLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  addAuction: (auction: Auction) => void;
  updateAuction: (id: number, auction: Partial<Auction>) => void;
}

export const useAuctionStore = create<AuctionStore>((set) => ({
  auctions: [],
  selectedAuction: null,
  isLoading: false,
  error: null,

  setAuctions: (auctions: Auction[]) => {
    set({ auctions });
  },

  setSelectedAuction: (auction: Auction | null) => {
    set({ selectedAuction: auction });
  },

  setIsLoading: (loading: boolean) => {
    set({ isLoading: loading });
  },

  setError: (error: string | null) => {
    set({ error });
  },

  addAuction: (auction: Auction) => {
    set((state) => ({
      auctions: [auction, ...state.auctions],
    }));
  },

  updateAuction: (id: number, updates: Partial<Auction>) => {
    set((state) => ({
      auctions: state.auctions.map((auction) =>
        auction.id === id ? { ...auction, ...updates } : auction,
      ),
      selectedAuction:
        state.selectedAuction?.id === id
          ? { ...state.selectedAuction, ...updates }
          : state.selectedAuction,
    }));
  },
}));
