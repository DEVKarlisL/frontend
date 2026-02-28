/**
 * Auction detail page
 */

import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useParams } from "react-router-dom";
import {
  useAuth,
  useWatchlist,
  useAddToWatchlist,
  useRemoveFromWatchlist,
} from "@/hooks/useApi";
import { formatPrice, calculateTimeRemaining } from "@/utils/helpers";
import { apiClient, getMediaUrl } from "@/services/api";
import { Gavel, Star, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "@/store/toastStore";
import { useAuthStore } from "@/store/authStore";
import { useLanguageStore } from "@/store/languageStore";

const AuctionDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const auctionId = Number(id);
  const { isAuthenticated } = useAuth();
  const { user } = useAuthStore();
  const { t } = useLanguageStore();
  // const navigate = useNavigate(); // Removed unused variable

  // Watchlist hooks
  const { data: watchlistData, isLoading: watchlistLoading } = useWatchlist();
  const addToWatchlist = useAddToWatchlist();
  const removeFromWatchlist = useRemoveFromWatchlist();

  const [auction, setAuction] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [sellerOnline, setSellerOnline] = useState<boolean>(false);
  const adminResetSeconds = useMemo(() => {
    try {
      const raw = localStorage.getItem("admin_app_settings");
      if (!raw) return 60;
      const parsed = JSON.parse(raw) as {
        defaultAntiSnipeSeconds?: number;
        enableAntiSnipe?: boolean;
      };
      if (parsed?.enableAntiSnipe === false) {
        return 60;
      }
      const seconds = Number(parsed?.defaultAntiSnipeSeconds);
      return Number.isFinite(seconds) && seconds > 0 ? seconds : 30;
    } catch {
      return 60;
    }
  }, []);
  const finalizeGraceMs = 5000;
  const endTimeMs = auction?.end_time
    ? new Date(auction.end_time).getTime()
    : 0;
  const nowMs = Date.now();
  const isWithinGrace =
    endTimeMs > 0 && nowMs >= endTimeMs && nowMs < endTimeMs + finalizeGraceMs;
  const isEnded =
    !!auction &&
    (auction.status === "ended" ||
      (endTimeMs > 0 && nowMs >= endTimeMs + finalizeGraceMs));
  const isCurrentWinner =
    !!user &&
    !!auction?.last_bidder?.username &&
    auction.last_bidder.username === user.username;

  // Debug watchlist data
  useEffect(() => {
    console.log("Watchlist data updated:", {
      count: watchlistData?.length,
      data: watchlistData,
      loading: watchlistLoading,
    });
  }, [watchlistData, watchlistLoading]);

  // Fetch auction from API
  useEffect(() => {
    const fetchAuction = async () => {
      try {
        setIsLoading(true);
        const response = await apiClient.get(
          `/auctions/auctions/${auctionId}/`,
        );
        setAuction(response.data);
        setError(null);
      } catch (err: any) {
        console.error("Failed to fetch auction:", err);
        setError(
          err.response?.status === 404
            ? "Auction not found"
            : "Failed to load auction",
        );
      } finally {
        setIsLoading(false);
      }
    };

    if (auctionId) {
      fetchAuction();
    }
  }, [auctionId]);

  // Fetch seller online status
  useEffect(() => {
    if (!auction?.seller?.id) return;

    const fetchSellerStatus = async () => {
      try {
        const response = await apiClient.get(
          `/users/users/${auction.seller.id}/`,
        );
        setSellerOnline(response.data.is_online === true);
      } catch (err) {
        console.log("Could not fetch seller status");
      }
    };

    fetchSellerStatus();

    // Poll seller status every 5 minutes
    const interval = setInterval(fetchSellerStatus, 300000);
    return () => clearInterval(interval);
  }, [auction?.seller?.id]);

  // Fetch bids from API
  useEffect(() => {
    const fetchBids = async () => {
      try {
        const response = await apiClient.get(
          `/bidding/bids/auction_bids/?auction_id=${auctionId}`,
        );
        const formattedBids = response.data.map((bid: any) => ({
          bidder: bid.bidder?.username || t("unknown"),
          bidderAvatar: getMediaUrl(bid.bidder?.avatar),
          amount: bid.amount,
          timestamp: new Date(bid.created_at || Date.now()).toLocaleString(
            "lv-LV",
          ),
        }));
        setBids(formattedBids);
      } catch (err: any) {
        console.error("Failed to fetch bids:", err);
      }
    };

    if (auctionId) {
      fetchBids();
    }
  }, [auctionId]);

  // Mock auction data for fallback

  const [bidAmount, setBidAmount] = useState("");
  const [timeRemaining, setTimeRemaining] = useState("");
  const [bids, setBids] = useState<any[]>([]);
  const [bidError, setBidError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Removed unused resetHoldMs state
  // ...existing code...
  const resetSeconds = useMemo(() => {
    const auctionSeconds = Number(auction?.anti_snipe_seconds);
    if (Number.isFinite(auctionSeconds) && auctionSeconds > 0) {
      return auctionSeconds;
    }
    return adminResetSeconds;
  }, [auction?.anti_snipe_seconds, adminResetSeconds]);
  const triggerResetHold = useCallback((seconds: number) => {
    if (!seconds || seconds <= 0) return;
    // Removed setResetHoldUntilMs as it does not exist
  }, []);

  // WebSocket message handler
  // ...existing code...

  // Connect to WebSocket
  // ...existing code...

  // Calculate minimum allowed bid
  const parseBid = (val: any) => {
    if (typeof val === "string") {
      return parseFloat(val.replace(",", "."));
    }
    return typeof val === "number" ? val : 0;
  };
  const currentBid = parseBid(
    auction?.current_highest_bid || auction?.starting_price || 0,
  );
  const minimumIncrement = Number(auction?.minimum_increment || 50);
  const minimumAllowedBid = currentBid + minimumIncrement;
  // ...existing code...
  const baseRemainingMs = useMemo(() => {
    if (!auction?.end_time) return 0;
    const end = new Date(auction.end_time).getTime();
    const now = Date.now();
    return Math.max(end - now, 0);
  }, [auction?.end_time, timeRemaining]);
  const remainingMs = useMemo(() => {
    return baseRemainingMs;
  }, [baseRemainingMs]);
  const totalMs = useMemo(() => {
    if (!auction?.start_time || !auction?.end_time) return 0;
    const start = new Date(auction.start_time).getTime();
    const end = new Date(auction.end_time).getTime();
    if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) {
      return 0;
    }
    return end - start;
  }, [auction?.start_time, auction?.end_time]);
  // ...existing code...
  const lastMinuteWindowMs = resetSeconds * 1000;
  const lastMinuteRatio = Math.max(
    0,
    Math.min(1, remainingMs / lastMinuteWindowMs),
  );
  const preLastMinuteRatio =
    totalMs > 0 ? Math.max(0, Math.min(1, remainingMs / totalMs)) : 0;
  const timeBarWidth =
    remainingMs > lastMinuteWindowMs
      ? preLastMinuteRatio * 100
      : lastMinuteRatio * 100;
  const displayTimeRemaining = useMemo(() => {
    if (isWithinGrace) {
      return t("finalizing");
    }
    return timeRemaining;
  }, [isWithinGrace, timeRemaining, t]);
  const timeBarColor = useMemo(() => {
    if (!totalMs || totalMs <= 0) return "#ef4444";
    const ratio = Math.max(0, Math.min(1, remainingMs / totalMs));
    const hue = Math.round(120 * ratio);
    return `hsl(${hue} 80% 45%)`;
  }, [remainingMs, totalMs]);

  // Set bidAmount to minimum allowed bid when auction loads
  useEffect(() => {
    if (auction && minimumAllowedBid > 0) {
      setBidAmount(String(minimumAllowedBid));
    }
  }, [auction, minimumAllowedBid]);

  // Update time remaining
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (auction?.end_time) {
      setTimeRemaining(calculateTimeRemaining(auction.end_time));
      interval = setInterval(() => {
        setTimeRemaining(calculateTimeRemaining(auction.end_time));
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [auction, auction?.end_time]);

  const handlePlaceBid = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bidAmount || !isAuthenticated || isSubmitting) return;

    // Check if current user is already the highest bidder
    if (
      auction?.last_bidder &&
      user &&
      auction.last_bidder.username === user.username
    ) {
      toast.info(t("alreadyHighest"));
      return;
    }

    const newBid = parseFloat(bidAmount);

    // Validate bid amount
    if (isNaN(newBid)) {
      setBidError(t("invalidBid"));
      return;
    }

    if (newBid < minimumAllowedBid) {
      setBidError(`${t("minBidAmount")} ${formatPrice(minimumAllowedBid)}`);
      return;
    }

    setBidError("");
    setIsSubmitting(true);

    try {
      // Save bid to backend API
      const response = await apiClient.post("/bidding/bids/", {
        auction_id: auctionId,
        amount: newBid,
      });
      const updatedEndTime = response?.data?.auction?.end_time;
      const prevEndTimeMs = auction?.end_time
        ? new Date(auction.end_time).getTime()
        : 0;
      const nextEndTimeMs = updatedEndTime
        ? new Date(updatedEndTime).getTime()
        : 0;
      if (nextEndTimeMs > prevEndTimeMs && resetSeconds > 0) {
        triggerResetHold(resetSeconds);
      }

      // Update local state immediately for optimistic UI
      setAuction((prev: any) => ({
        ...prev,
        current_highest_bid: newBid,
        current_bid: newBid,
        last_bidder: {
          username: user?.username || "You",
          avatar: user?.avatar || null,
        },
        end_time: updatedEndTime || prev?.end_time,
      }));

      // Optimistically add bid to list
      setBids((prev) => {
        // Only add if not already present (prevents duplicate)
        if (
          prev.length > 0 &&
          prev[0].amount === newBid &&
          prev[0].bidder === (user?.username || "You")
        ) {
          return prev;
        }
        return [
          {
            bidder: user?.username || "You",
            bidderAvatar: getMediaUrl(user?.avatar),
            amount: newBid,
            timestamp: new Date().toLocaleString("lv-LV"),
          },
          ...prev,
        ];
      });

      toast.success(`${t("bidPlaced")} ${formatPrice(newBid)}`);
      setBidAmount(String(newBid + minimumIncrement));
    } catch (error: any) {
      console.error("Error placing bid:", error);
      const errorMessage =
        error.response?.data?.detail ||
        error.response?.data?.error ||
        t("bidFailed");
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isInWatchlist = useMemo(() => {
    const result =
      Array.isArray(watchlistData) &&
      watchlistData.some((item: any) => item.auction?.id === auction?.id);
    console.log("isInWatchlist computed:", result, {
      auctionId: auction?.id,
      watchlistLength: Array.isArray(watchlistData) ? watchlistData.length : 0,
    });
    return result;
  }, [watchlistData, auction?.id]);

  const handleToggleWatchlist = async () => {
    if (!auction?.id) {
      console.warn("Auction ID not available");
      return;
    }

    try {
      console.log("=== WATCHLIST TOGGLE START ===");
      console.log("Auction ID:", auction.id);
      console.log("Watchlist data:", watchlistData);
      console.log("Is in watchlist:", isInWatchlist);
      console.log(
        "Toggling watchlist for auction:",
        auction.id,
        "In watchlist:",
        isInWatchlist,
      );

      if (isInWatchlist) {
        console.log("Removing from watchlist...");
        await removeFromWatchlist.mutateAsync(auction.id);
        console.log(
          "Removed from watchlist, watchlistData is now:",
          watchlistData,
        );
        toast.success(t("watchlistRemoved"));
      } else {
        console.log("Adding to watchlist...");
        await addToWatchlist.mutateAsync(auction.id);
        console.log("Added to watchlist, watchlistData is now:", watchlistData);
        toast.success(t("watchlistAdded"));
      }
      console.log("=== WATCHLIST TOGGLE END ===");
    } catch (error: any) {
      console.error("Watchlist error:", error);
      const message = error?.response?.data?.error || t("watchlistError");
      toast.error(message);
    }
  };

  // Carousel handlers
  const images = auction?.images || [];
  const currentImage = images.length > 0 ? images[currentImageIndex] : null;

  const goToPrevious = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const goToImage = (index: number) => {
    setCurrentImageIndex(index);
  };

  if (isLoading)
    return <div className="container-fluid py-12">{t("loadingAuction")}</div>;
  if (error)
    return (
      <div className="container-fluid py-12">{t("errorLoadingAuction")}</div>
    );
  if (!auction)
    return <div className="container-fluid py-12">{t("auctionNotFound")}</div>;

  return (
    <div className="container-fluid py-12">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main content */}
        <div className="lg:col-span-2">
          {/* Image Gallery */}
          <div className="mb-8">
            {/* Main Image */}
            <div className="relative mb-4 rounded-xl overflow-hidden bg-gray-200 group">
              <img
                src={
                  currentImage?.image ||
                  auction.image ||
                  "https://picsum.photos/seed/detail/800/600"
                }
                alt={currentImage?.alt_text || auction.title}
                className="w-full h-96 object-cover transition-transform duration-300"
                onError={(e) => {
                  const img = e.target as HTMLImageElement;
                  if (!img.dataset.errorHandled) {
                    img.dataset.errorHandled = "true";
                    img.src =
                      "https://placehold.co/800x600/e2e8f0/94a3b8?text=Image+Not+Available";
                  }
                }}
              />

              {/* Carousel Controls - Only show if multiple images */}
              {images.length > 1 && (
                <>
                  {/* Previous Button */}
                  <button
                    onClick={goToPrevious}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/75 text-white p-2 rounded-full transition-all duration-200 opacity-0 group-hover:opacity-100"
                  >
                    <ChevronLeft size={24} />
                  </button>

                  {/* Next Button */}
                  <button
                    onClick={goToNext}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/75 text-white p-2 rounded-full transition-all duration-200 opacity-0 group-hover:opacity-100"
                  >
                    <ChevronRight size={24} />
                  </button>

                  {/* Image Counter */}
                  <div className="absolute bottom-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm font-medium">
                    {currentImageIndex + 1} / {images.length}
                  </div>
                </>
              )}
            </div>

            {/* Thumbnail Carousel */}
            {images.length > 1 && (
              <div className="overflow-x-auto scrollbar-hide">
                <div className="flex gap-3 pb-2">
                  {images.map((img: any, index: number) => (
                    <button
                      key={index}
                      onClick={() => goToImage(index)}
                      className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden transition-all duration-200 ${
                        currentImageIndex === index
                          ? "ring-2 ring-primary-500 ring-offset-2 opacity-100"
                          : "opacity-60 hover:opacity-100"
                      }`}
                    >
                      <img
                        src={img.image}
                        alt={`Thumbnail ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Title and description */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-4">{auction.title}</h1>
            <p className="text-gray-600 mb-4">{auction.description}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-4 rounded-xl bg-white/80 border border-slate-200 p-4 shadow-sm">
                <div className="relative">
                  {auction.seller?.avatar ? (
                    <img
                      src={getMediaUrl(auction.seller.avatar)}
                      alt={auction.seller?.username || t("unknown")}
                      className="w-12 h-12 rounded-full object-cover ring-2 ring-primary-200"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-600 to-indigo-600 text-white flex items-center justify-center font-bold">
                      {(auction.seller?.username || t("unknown"))
                        .charAt(0)
                        .toUpperCase()}
                    </div>
                  )}
                  {sellerOnline && (
                    <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white animate-pulse"></span>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-xs uppercase tracking-wide text-slate-400">
                    {t("seller")}
                  </p>
                  <p className="font-semibold text-gray-900 truncate">
                    {auction.seller?.username || t("unknown")}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 rounded-xl bg-white/80 border border-slate-200 p-4 shadow-sm">
                <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-xl">
                  🗂️
                </div>
                <div className="min-w-0">
                  <p className="text-xs uppercase tracking-wide text-slate-400">
                    {t("category")}
                  </p>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-gray-900 truncate">
                      {typeof auction.category === "object"
                        ? auction.category?.name
                        : auction.category}
                    </p>
                    <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-amber-50 text-amber-700">
                      Featured
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div>
          {/* Bidding card */}
          <div className="card">
            {/* Current Price Display */}
            <div className="mb-6 pb-6 border-b border-gray-200">
              <div className="rounded-2xl border border-red-100 bg-white p-4 shadow-sm">
                <p className="text-xs uppercase tracking-[0.2em] text-gray-500 font-semibold">
                  {t("currentBid")}
                </p>
                <p className="mt-2 text-4xl font-extrabold text-[#8B0000] tracking-tight">
                  {formatPrice(currentBid)}
                </p>
              </div>

              {/* Time remaining */}
              <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500 font-semibold">
                  {t("timeRemaining")}
                </p>
                <p className="mt-2 text-xl font-bold text-slate-900">
                  {displayTimeRemaining || t("calculating")}
                </p>
                <div className="mt-3 h-1.5 w-full rounded-full bg-slate-200 overflow-hidden">
                  <div
                    className="h-full rounded-full overflow-hidden transition-all duration-500"
                    style={{ width: `${timeBarWidth}%` }}
                  >
                    <div
                      className="h-full w-full"
                      style={{ background: timeBarColor }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {isAuthenticated ? (
              <>
                {/* Bidding Form */}
                <form onSubmit={handlePlaceBid} className="mb-6">
                  {/* Minimum Bid Info */}
                  <div className="mb-4 p-4 bg-red-50 rounded-lg border border-red-100">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-700">
                        {t("minimumIncrement")}:
                      </span>
                      <span className="text-sm font-semibold text-[#8B0000]">
                        {formatPrice(minimumIncrement)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">
                        {t("minimumBid")}:
                      </span>
                      <span className="text-base font-bold text-[#8B0000]">
                        {formatPrice(minimumAllowedBid)}
                      </span>
                    </div>
                  </div>

                  {/* Bid Input */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t("yourBid")}
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
                        €
                      </span>
                      <input
                        type="number"
                        step="0.01"
                        className={`input-field pl-8 text-lg font-semibold ${bidError ? "border-red-300 focus:border-red-500" : ""}`}
                        value={bidAmount}
                        onChange={(e) => {
                          setBidAmount(e.target.value);
                          setBidError("");
                        }}
                        required
                      />
                    </div>
                    {bidError && (
                      <p className="mt-2 text-sm text-red-600 font-medium">
                        {bidError}
                      </p>
                    )}
                  </div>

                  {/* Bid Button */}
                  <button
                    type="submit"
                    disabled={
                      isSubmitting ||
                      (auction?.last_bidder &&
                        user &&
                        auction.last_bidder.username === user.username)
                    }
                    className={`w-full font-bold py-4 px-6 rounded-lg transition-all duration-200 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl ${
                      isSubmitting ||
                      (auction?.last_bidder &&
                        user &&
                        auction.last_bidder.username === user.username)
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-[#8B0000] hover:bg-[#6B0000]"
                    } text-white`}
                  >
                    <Gavel className="w-5 h-5" />
                    <span className="text-lg">{t("placeBid")}</span>
                  </button>
                </form>

                {/* Watchlist Button */}
                <button
                  onClick={handleToggleWatchlist}
                  disabled={
                    !isAuthenticated ||
                    addToWatchlist.isPending ||
                    removeFromWatchlist.isPending
                  }
                  className={`btn w-full mb-4 ${
                    isInWatchlist
                      ? "bg-red-100 hover:bg-red-200 text-red-700"
                      : "btn-secondary"
                  }`}
                >
                  <span className="flex items-center justify-center gap-2">
                    <Star
                      size={20}
                      fill={isInWatchlist ? "currentColor" : "none"}
                      stroke="currentColor"
                    />
                    {isInWatchlist
                      ? t("removeFromWatchlist")
                      : t("addToWatchlist")}
                  </span>
                </button>
              </>
            ) : (
              <p className="text-center text-gray-600 py-4">
                {t("pleaseLoginToBid")}
              </p>
            )}

            {/* Buy Now Button */}
            {auction.buy_now_price && (
              <button className="btn btn-outline w-full border-[#8B0000] text-[#8B0000] hover:bg-[#8B0000] hover:text-white">
                {t("buyNow")}: {formatPrice(auction.buy_now_price)}
              </button>
            )}

            {/* Reserve Price Info */}
            {auction.reserve_price && (
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-600">
                  Rezerves cena: {formatPrice(auction.reserve_price)}
                </p>
              </div>
            )}
          </div>

          {/* Bid history sidebar */}
          <div className="card mt-6">
            {isEnded &&
              (auction?.winner?.username || auction?.last_bidder?.username) && (
                <div className="mb-4 flex items-center justify-between rounded-xl border px-4 py-3 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 border-slate-900 shadow-lg">
                  <div className="flex items-center gap-2 text-xs font-semibold text-white">
                    <span className="text-base">🏆</span>
                    {t("winner")}
                  </div>
                  <div className="flex items-center gap-2">
                    {auction?.winner?.avatar || auction?.last_bidder?.avatar ? (
                      <img
                        src={getMediaUrl(
                          auction.winner?.avatar || auction.last_bidder?.avatar,
                        )}
                        alt={
                          (auction.winner?.username ||
                            auction.last_bidder?.username) as string
                        }
                        className="w-8 h-8 rounded-full object-cover border-2 border-white shadow-sm"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-white/15 text-white flex items-center justify-center text-xs font-bold">
                        {(
                          auction?.winner?.username ||
                          auction?.last_bidder?.username ||
                          ""
                        )
                          .charAt(0)
                          .toUpperCase() || "–"}
                      </div>
                    )}
                    <div className="text-sm font-bold text-white">
                      {auction?.winner?.username ||
                        auction?.last_bidder?.username}
                    </div>
                  </div>
                </div>
              )}

            {!isEnded && auction?.last_bidder?.username && (
              <div
                className={`mb-4 flex items-center justify-between rounded-xl border px-4 py-3 shadow-lg ${
                  isCurrentWinner
                    ? "bg-gradient-to-r from-emerald-700 via-emerald-600 to-emerald-500 border-emerald-800"
                    : "bg-gradient-to-r from-amber-600 via-amber-500 to-amber-400 border-amber-700"
                }`}
              >
                <div className="flex items-center gap-2 text-xs font-semibold text-white">
                  <span className="text-base">🏆</span>
                  {t("currentWinner")}
                </div>
                <div className="flex items-center gap-2">
                  {auction?.last_bidder?.avatar ? (
                    <img
                      src={getMediaUrl(auction.last_bidder.avatar)}
                      alt={auction.last_bidder.username}
                      className="w-8 h-8 rounded-full object-cover border-2 border-white shadow-sm"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-white/20 text-white flex items-center justify-center text-xs font-bold">
                      {(auction?.last_bidder?.username || "").charAt(0) || "–"}
                    </div>
                  )}
                  <div className="text-sm font-bold text-white">
                    {auction?.last_bidder?.username}
                  </div>
                </div>
              </div>
            )}

            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Gavel className="w-5 h-5 text-[#8B0000]" />
              {t("bidHistory")} ({bids.length})
            </h2>

            {bids.length > 0 ? (
              <div className="space-y-3">
                {bids.map((bid, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-slate-50 to-white border border-slate-200"
                  >
                    <div className="flex-shrink-0">
                      {bid.bidderAvatar ? (
                        <img
                          src={bid.bidderAvatar}
                          alt={bid.bidder}
                          className="w-10 h-10 rounded-full object-cover border border-[#8B0000]/30"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#8B0000] to-[#6B0000] flex items-center justify-center text-white font-bold">
                          {bid.bidder.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 truncate">
                        {bid.bidder}
                      </p>
                      <p className="text-xs text-gray-500">{bid.timestamp}</p>
                    </div>
                    <div className="flex-shrink-0 text-sm font-bold text-[#8B0000]">
                      {formatPrice(bid.amount)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Gavel className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                <p className="text-gray-500 font-medium">{t("noBids")}</p>
                <p className="text-xs text-gray-400 mt-1">{t("beFirst")}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuctionDetailPage;
// ...existing code...
