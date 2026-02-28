import React, { useState, useEffect } from "react";

import { Gavel, Star, Clock } from "lucide-react";

import { useNavigate } from "react-router-dom";
import { apiClient, getMediaUrl } from "@/services/api";
import { formatPrice } from "@/utils/helpers";
import { toast } from "@/store/toastStore";
import { useAuthStore } from "@/store/authStore";
import { useLanguageStore } from "@/store/languageStore";
import {
  useWatchlist,
  useAddToWatchlist,
  useRemoveFromWatchlist,
} from "@/hooks/useApi";

// Countdown Timer Component
const CountdownTimer: React.FC<{ endTime: string; color: string }> = ({
  endTime,
  color,
}) => {
  const { t } = useLanguageStore();
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const end = new Date(endTime).getTime();
      const distance = end - now;

      if (distance < 0) {
        setTimeLeft(t("ended"));
        return;
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
      );
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      const pad2 = (value: number) => String(value).padStart(2, "0");
      if (days >= 1) {
        setTimeLeft(`${days}d ${hours}h`);
      } else if (hours > 0) {
        setTimeLeft(`${pad2(hours)} : ${pad2(minutes)} : ${pad2(seconds)}`);
      } else {
        setTimeLeft(`${pad2(minutes)} : ${pad2(seconds)}`);
      }
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(interval);
  }, [endTime]);

  return (
    <div
      className="flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-md shadow-sm backdrop-blur-sm"
      style={{
        backgroundColor: `${color}15`,
        color: color,
        border: `1.5px solid ${color}40`,
      }}
    >
      <Clock className="w-3.5 h-3.5" strokeWidth={2.5} />
      <span className="tracking-wide">{timeLeft}</span>
    </div>
  );
};

// Simple Countdown Component (matches price styling)
const SimpleCountdown: React.FC<{ endTime: string; className?: string }> = ({
  endTime,
  className = "text-lg font-black text-primary-600",
}) => {
  const { t } = useLanguageStore();
  const calculateTimeLeft = () => {
    const now = new Date().getTime();
    const end = new Date(endTime).getTime();
    const distance = end - now;

    if (distance < 0) {
      return t("ended");
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor(
      (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
    );
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    const pad2 = (value: number) => String(value).padStart(2, "0");
    if (days >= 1) {
      return `${days}d ${hours}h`;
    }
    if (hours > 0) {
      return `${pad2(hours)}:${pad2(minutes)}:${pad2(seconds)}`;
    }
    return `${pad2(minutes)}:${pad2(seconds)}`;
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(interval);
  }, [endTime]);

  const timeParts = timeLeft.split(":");
  return (
    <p className={className}>
      {timeParts.length > 1
        ? timeParts.map((part, index) => (
            <span key={`${part}-${index}`}>
              {index > 0 && <span className="mx-0.5">:</span>}
              {part}
            </span>
          ))
        : timeLeft}
    </p>
  );
};

const formatPriceForButton = (value: number) =>
  formatPrice(value).replace(/[\u202F\u00A0]/g, " ");

interface Auction {
  id: number;
  title: string;
  image: string;
  current_bid: number;
  current_highest_bid?: number;
  minimum_increment?: number;
  numberOfBids?: number;
  last_bidder?: {
    username: string;
    avatar?: string | null;
  };
  timeRemaining?: string;
  end_time?: string;
  status: "live" | "soon" | "ended";
  category?:
    | string
    | {
        id: number;
        name: string;
        slug: string;
        description: string;
        icon?: string;
      };
  location?: string;
  verified?: boolean;
  starting_price?: number;
  description?: string;
  currentBid?: number;
}

interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  icon: string;
  widget_settings?: {
    background_image?: string;
    background_color?: string;
    card_size?: "small" | "medium" | "large";
  };
  auction_count?: number;
}

const resolveAuctionStatus = (auction: any, now: number) => {
  const endTime = auction.end_time
    ? new Date(auction.end_time).getTime()
    : null;
  const hasEnded = endTime && now > endTime;

  return hasEnded
    ? "ended"
    : auction.status === "active"
      ? "live"
      : auction.status === "draft"
        ? "soon"
        : "ended";
};

const extractResponseList = (response: any) => {
  if (Array.isArray(response?.data?.results)) return response.data.results;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response)) return response;
  // If it's an object with results, return results
  if (response?.data?.results) return Object.values(response.data.results);
  if (response?.data) return [response.data];
  return [];
};

const extractResponseData = (response: any) => {
  if (Array.isArray(response?.data?.results)) return response.data.results;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response)) return response;
  // If it's an object with results, return results
  if (response?.data?.results) return Object.values(response.data.results);
  if (response?.data) return [response.data];
  return [];
};
const HomePage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [liveAuctions, setLiveAuctions] = useState<Auction[]>([]);
  const [endedAuctions, setEndedAuctions] = useState<Auction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [biddingAuction, setBiddingAuction] = useState<number | null>(null);
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();
  const { t } = useLanguageStore();
  const { data: watchlistData } = useWatchlist();
  const addToWatchlist = useAddToWatchlist();
  const removeFromWatchlist = useRemoveFromWatchlist();

  // Recalculate category auction counts when liveAuctions or categories change
  React.useEffect(() => {
    if (!categories.length) return;
    const updatedCategories = categories.map((cat) => {
      const categoryAuctions = liveAuctions.filter((auction) => {
        const auctionCat = auction.category;
        if (!auctionCat) return false;
        if (typeof auctionCat === "object") {
          return (
            (auctionCat.name &&
              auctionCat.name.toLowerCase() === cat.name.toLowerCase()) ||
            (auctionCat.id && String(auctionCat.id) === String(cat.id))
          );
        }
        return auctionCat.toLowerCase() === cat.name.toLowerCase();
      });
      // Find the auction ending soonest
      let closestAuction = null;
      if (categoryAuctions.length > 0) {
        closestAuction = categoryAuctions.reduce((closest, current) => {
          const closestTime = new Date(closest.end_time).getTime();
          const currentTime = new Date(current.end_time).getTime();
          return currentTime < closestTime ? current : closest;
        });
      }
      return {
        ...cat,
        auction_count: categoryAuctions.length,
        closest_auction: closestAuction,
      };
    });
    // Only update categories if changed
    if (JSON.stringify(updatedCategories) !== JSON.stringify(categories)) {
      setCategories(updatedCategories);
    }
  }, [liveAuctions, categories]);

  useEffect(() => {
    fetchAuctions();
    fetchCategories();
    fetchLiveAuctions();

    // Poll auctions every 1 second for near real-time updates, only updates if data changed
    const interval = setInterval(async () => {
      await fetchAuctionsQuiet();
      await fetchLiveAuctionsQuiet();
    }, 1000);

    return () => clearInterval(interval);
  }, []);
  // Fetch live auctions from new endpoint
  const fetchLiveAuctions = async () => {
    try {
      const response = await apiClient.get("/auctions/auctions/live/");
      const liveAuctionData = extractResponseData(response);
      // Map backend 'active' status to 'live' for frontend
      const mappedAuctions = Array.isArray(liveAuctionData)
        ? liveAuctionData.map((auction) => ({
            ...auction,
            status: auction.status === "active" ? "live" : auction.status,
          }))
        : [];
      // Sort live auctions by closest ending first
      const sortedLive = mappedAuctions
        .filter((auction) => auction.status === "live")
        .sort(
          (a, b) =>
            new Date(a.end_time).getTime() - new Date(b.end_time).getTime(),
        );
      setLiveAuctions(sortedLive);
    } catch (error) {
      console.error("Failed to fetch live auctions:", error);
    }
  };

  // Quiet polling for live auctions
  const fetchLiveAuctionsQuiet = async () => {
    try {
      const response = await apiClient.get("/auctions/auctions/live/");
      const liveAuctionData = extractResponseData(response);
      if (!liveAuctionData || liveAuctionData.length === 0) return;
      // Map backend 'active' status to 'live' for frontend
      const mappedAuctions = Array.isArray(liveAuctionData)
        ? liveAuctionData.map((auction) => ({
            ...auction,
            status: auction.status === "active" ? "live" : auction.status,
          }))
        : [];
      const sortedLive = mappedAuctions
        .filter((auction) => auction.status === "live")
        .sort(
          (a, b) =>
            new Date(a.end_time).getTime() - new Date(b.end_time).getTime(),
        );
      setLiveAuctions(sortedLive);
    } catch (error) {
      // Silently fail on background refresh
      console.log("Background live auction refresh skipped");
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await apiClient.get("/auctions/categories/");
      const categoryData = extractResponseList(response);

      // Fetch auctions to count per category and find closest ending
      const auctionsResponse = await apiClient.get("/auctions/auctions/");
      const allAuctions = extractResponseList(auctionsResponse);

      const now = Date.now();
      const isAuctionActive = (auction: any) => {
        if (!auction?.end_time) return false;
        const endTime = new Date(auction.end_time).getTime();
        const hasEnded = Number.isFinite(endTime) && endTime <= now;
        return auction.status === "active" && !hasEnded;
      };

      // Add auction count and closest ending auction to each category
      const categoriesWithCount = categoryData.map((cat: any) => {
        const categoryAuctions = allAuctions.filter(
          (auction: any) =>
            (auction.category?.id === cat.id ||
              auction.category?.name === cat.name) &&
            isAuctionActive(auction),
        );

        // Find the auction ending soonest
        let closestAuction = null;
        if (categoryAuctions.length > 0) {
          closestAuction = categoryAuctions.reduce(
            (closest: any, current: any) => {
              const closestTime = new Date(closest.end_time).getTime();
              const currentTime = new Date(current.end_time).getTime();
              return currentTime < closestTime ? current : closest;
            },
          );
        }

        return {
          ...cat,
          auction_count: categoryAuctions.length,
          closest_auction: closestAuction,
        };
      });

      setCategories(
        Array.isArray(categoriesWithCount) ? categoriesWithCount : [],
      );
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  };

  const fetchAuctions = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(
        "/auctions/auctions/?ordering=end_time",
      );
      const auctionData = extractResponseData(response);
      console.log("Auction data sample:", auctionData[0]); // Debug log

      // Map backend status to frontend status and check if auction has ended
      const mappedAuctions = (auctionData || []).map((auction: any) => {
        return {
          ...auction,
          status: resolveAuctionStatus(auction, Date.now()),
        };
      });

      // Sort ended auctions by latest ended first
      const ended = mappedAuctions
        .filter((auction) => auction.status === "ended")
        .sort(
          (a, b) =>
            new Date(b.end_time).getTime() - new Date(a.end_time).getTime(),
        );
      setEndedAuctions(ended);
      // Keep auctions for other uses if needed
      setAuctions(mappedAuctions);
    } catch (error) {
      console.error("Failed to fetch auctions:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch auctions quietly without showing loading state, only update fields that changed
  const fetchAuctionsQuiet = async () => {
    try {
      const response = await apiClient.get(
        "/auctions/auctions/?ordering=end_time",
      );
      const auctionData = extractResponseData(response);

      if (!auctionData || auctionData.length === 0) return;

      // Create index map of new auction data by ID
      const newAuctionMap = new Map(auctionData.map((a: any) => [a.id, a]));

      // Update only auctions that have changed fields
      setAuctions((prevAuctions) => {
        let hasChanges = false;

        const updatedAuctions = prevAuctions.map((prevAuction) => {
          const newAuctionData = newAuctionMap.get(prevAuction.id);

          if (!newAuctionData) return prevAuction;

          // Check if any relevant field changed
          const newStatus: "ended" | "live" | "soon" = resolveAuctionStatus(
            newAuctionData,
            Date.now(),
          );

          // Only create new object if something actually changed
          if (
            prevAuction.current_bid !== newAuctionData.current_bid ||
            prevAuction.title !== newAuctionData.title ||
            prevAuction.end_time !== newAuctionData.end_time ||
            prevAuction.status !== newStatus
          ) {
            hasChanges = true;
            return {
              ...prevAuction,
              ...newAuctionData,
              status: newStatus,
            } as Auction;
          }

          // No changes, return same reference
          return prevAuction;
        });

        // Only trigger re-render if something actually changed
        return hasChanges ? updatedAuctions : prevAuctions;
      });
    } catch (error) {
      // Silently fail on background refresh
      console.log("Background auction refresh skipped");
    }
  };

  const handleCategoryClick = (catName: string) => {
    setSelectedCategory(catName);
  };

  const handleAuctionClick = (auctionId: number) => {
    navigate(`/auctions/${auctionId}`);
  };

  const handleBidClick = async (
    e: React.MouseEvent,
    auctionId: number,
    status: string,
  ) => {
    e.stopPropagation();

    if (status === "soon") {
      toast.success("Atgādinājums pievienots!");
      return;
    }

    // Check if user is authenticated
    if (!isAuthenticated) {
      toast.error("Lūdzu, ielogojieties, lai veiktu solīšanu");
      navigate("/login");
      return;
    }

    // Prevent race condition - check if already bidding on this auction
    if (biddingAuction === auctionId) {
      return;
    }

    // Find the auction to get the minimum bid amount
    // Use liveAuctions for homepage cards
    const auction = liveAuctions.find((a) => a.id === auctionId);
    if (!auction) return;

    // Check if current user is already the highest bidder
    if (
      auction.last_bidder &&
      user &&
      auction.last_bidder.username === user.username
    ) {
      toast.info("Jūs jau esat augstākais solītājs");
      return;
    }

    const minimumBid =
      Number(
        auction.current_highest_bid ||
          auction.starting_price ||
          auction.currentBid ||
          auction.current_bid ||
          0,
      ) + Number(auction.minimum_increment || 100);

    setBiddingAuction(auctionId);

    try {
      const response = await apiClient.post("/bidding/bids/", {
        auction_id: auctionId,
        amount: minimumBid,
      });

      toast.success(`Solījums veiksmīgs! ${formatPrice(minimumBid)}`);

      // Update only the specific auction in the state with actual data from backend
      setAuctions((prevAuctions) =>
        prevAuctions.map((a) =>
          a.id === auctionId
            ? {
                ...a,
                current_highest_bid: minimumBid,
                currentBid: minimumBid,
                current_bid: minimumBid,
                numberOfBids:
                  response.data.auction?.bid_count || (a.numberOfBids || 0) + 1,
                last_bidder: user
                  ? {
                      username: user.username,
                      avatar: getMediaUrl(user.avatar),
                    }
                  : a.last_bidder,
              }
            : a,
        ),
      );
    } catch (error: any) {
      console.error("Bid error:", error.response?.data);
      const errorMessage =
        error.response?.data?.bid_amount?.[0] ||
        error.response?.data?.detail ||
        error.response?.data?.non_field_errors?.[0] ||
        error.response?.data?.error ||
        "Neizdevās veikt solījumu";
      toast.error(errorMessage);
    } finally {
      setBiddingAuction(null);
    }
  };

  const handleFavoriteClick = async (
    e: React.MouseEvent,
    auctionId: number,
  ) => {
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.error("Lūdzu, ielogojieties, lai pievienotu vērojamajiem");
      navigate("/login");
      return;
    }

    const isInWatchlist = watchlistData?.some(
      (item: any) => item.auction?.id === auctionId,
    );

    try {
      if (isInWatchlist) {
        console.log(`[STAR] Removing auction ${auctionId} from watchlist`);
        await removeFromWatchlist.mutateAsync(auctionId);
        toast.success("Noņemts no vērojamajiem!");
      } else {
        console.log(`[STAR] Adding auction ${auctionId} to watchlist`);
        await addToWatchlist.mutateAsync(auctionId);
        toast.success("Pievienots vērojamajiem!");
      }
    } catch (error: any) {
      console.error("[STAR] Error:", error);
      const message =
        error?.response?.data?.error || "Neizdevās mainīt vērojamos.";
      toast.error(message);
    }
  };

  const visibleAuctions = selectedCategory
    ? liveAuctions.filter((a) => {
        const cat = a.category;
        if (cat == null) return false;
        if (typeof cat === "object") {
          return (
            (cat.name &&
              cat.name.toLowerCase() === selectedCategory.toLowerCase()) ||
            (cat.id && String(cat.id) === String(selectedCategory))
          );
        }
        return cat.toLowerCase() === selectedCategory.toLowerCase();
      })
    : liveAuctions;

  // Separate ended auctions (live auctions now fetched from backend)
  // ...existing code...

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="relative py-4 px-2.5">
        {/* Dark background with subtle pattern */}
        <div className="absolute inset-0 w-full h-full bg-black" />
        <svg
          className="absolute inset-0 w-full h-full z-0"
          style={{ pointerEvents: "none" }}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="silver-gradient" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#e5e7eb" stopOpacity="0.13" />
              <stop offset="100%" stopColor="#f3f4f6" stopOpacity="0.18" />
            </linearGradient>
          </defs>
          {/* Draw many wavy lines for subtle wiggle effect */}
          {Array.from({ length: 80 }).map((_, i) => (
            <path
              key={i}
              d={`M0 ${i * 1.25} Q 25 ${i * 1.25 + Math.sin(i) * 2}, 50 ${i * 1.25} T 100 ${i * 1.25}`}
              stroke="url(#silver-gradient)"
              strokeWidth="0.18"
              fill="none"
              opacity="0.22"
            />
          ))}
        </svg>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-6 auto-rows-[210px] gap-2">
            {loading
              ? Array.from({ length: 8 }).map((_, index) => (
                  <div
                    key={index}
                    className="col-span-2 row-span-1 rounded-lg skeleton"
                  />
                ))
              : categories.map((category) => {
                  const cardSize =
                    category.widget_settings?.card_size || "medium";
                  const sizeClasses = {
                    small: "col-span-1 row-span-1",
                    medium: "col-span-2 row-span-1",
                    large: "col-span-3 row-span-1",
                  };

                  const hasBackgroundImage =
                    !!category.widget_settings?.background_image;
                  const backgroundColor =
                    category.widget_settings?.background_color || "#1e40af";
                  const textColor =
                    category.widget_settings?.text_color || "#ffffff";
                  const timerColor =
                    category.widget_settings?.timer_color || "#fbbf24";
                  const iconImage = category.widget_settings?.icon_image;
                  const closestAuction = category.closest_auction;

                  return (
                    <button
                      key={category.id}
                      onClick={() => handleCategoryClick(category.name)}
                      className={`${sizeClasses[cardSize]} relative rounded-lg overflow-hidden group border border-white/10 shadow-md transition-all hover:shadow-xl`}
                    >
                      {hasBackgroundImage ? (
                        <>
                          <img
                            src={category.widget_settings.background_image}
                            alt={category.name}
                            className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/45 to-black/20"></div>
                          <div className="absolute bottom-0 left-0 w-full flex items-end justify-between p-3">
                            <div className="flex flex-col text-left">
                              <div className="flex items-center">
                                <p className="font-bold text-base leading-tight text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.85)]">
                                  {category.name}
                                </p>
                                {category.auction_count !== undefined && (
                                  <span
                                    className="inline-flex items-center justify-center bg-red-600 text-white font-bold text-[10px] rounded px-1 py-0.5 relative -top-1"
                                    style={{
                                      marginLeft: "3px",
                                      minWidth: "18px",
                                      height: "18px",
                                      lineHeight: "18px",
                                      padding: "0 6px",
                                      borderRadius: "6px",
                                    }}
                                  >
                                    {category.auction_count}
                                  </span>
                                )}
                              </div>
                            </div>
                            {closestAuction && (
                              <div className="text-xs text-white ml-auto">
                                <CountdownTimer
                                  endTime={closestAuction.end_time}
                                  color="#fbbf24"
                                />
                              </div>
                            )}
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="absolute inset-0 w-full h-full bg-white" />
                          <div className="absolute bottom-0 left-0 w-full flex items-end justify-between p-3">
                            <div className="flex flex-col text-left">
                              <div className="flex items-center">
                                <h3 className="font-bold text-base text-slate-900 leading-tight">
                                  {category.name}
                                </h3>
                                {category.auction_count !== undefined && (
                                  <span
                                    className="inline-flex items-center justify-center bg-red-600 text-white font-bold text-[10px] rounded px-1 py-0.5 relative -top-1"
                                    style={{
                                      marginLeft: "3px",
                                      minWidth: "18px",
                                      height: "18px",
                                      lineHeight: "18px",
                                      padding: "0 6px",
                                      borderRadius: "6px",
                                    }}
                                  >
                                    {category.auction_count}
                                  </span>
                                )}
                              </div>
                            </div>
                            {closestAuction && (
                              <div className="text-xs text-slate-900 ml-auto">
                                <CountdownTimer
                                  endTime={closestAuction.end_time}
                                  color="#fbbf24"
                                />
                              </div>
                            )}
                          </div>
                          <div className="absolute top-0 left-0 w-full h-1/2 overflow-hidden flex items-center justify-center">
                            {iconImage ? (
                              <img
                                src={iconImage}
                                alt={category.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="text-4xl">{category.icon}</div>
                            )}
                          </div>
                        </>
                      )}
                    </button>
                  );
                })}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-2xl font-bold uppercase tracking-tight mb-6 flex items-start gap-2">
          {t("liveAuctions")}
          <span className="inline-flex items-center justify-center bg-red-600 text-white font-bold text-xs rounded px-1.5 py-0.5 relative -top-1">
            {liveAuctions.length}
          </span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {loading ? (
            Array.from({ length: 8 }).map((_, index) => (
              <div
                key={index}
                className="text-left bg-white rounded-lg overflow-hidden shadow-md border border-slate-100"
              >
                <div className="h-48 skeleton" />
                <div className="p-4 space-y-3">
                  <div className="h-5 w-3/4 rounded skeleton" />
                  <div className="h-4 w-1/2 rounded skeleton" />
                  <div className="h-8 w-2/3 rounded skeleton" />
                  <div className="h-4 w-full rounded skeleton" />
                </div>
              </div>
            ))
          ) : visibleAuctions.length === 0 ? (
            <div className="col-span-full text-center py-16">
              <div className="flex flex-col items-center justify-center">
                <svg
                  className="w-16 h-16 text-slate-300 mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                  />
                </svg>
                <p className="text-lg font-semibold text-slate-600 mb-2">
                  {t("noAuctions")}
                </p>
                <p className="text-sm text-slate-500">{t("checkBackSoon")}</p>
              </div>
            </div>
          ) : (
            visibleAuctions.map((auction) => (
              <div
                key={auction.id}
                onClick={() => handleAuctionClick(auction.id)}
                className="text-left bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all border border-slate-100 cursor-pointer"
              >
                <div className="relative h-48 overflow-hidden bg-slate-200">
                  <img
                    src={
                      auction.image ||
                      "https://picsum.photos/seed/default/800/600"
                    }
                    alt={auction.title}
                    className="w-full h-full object-cover hover:scale-110 transition-transform"
                    onError={(e) => {
                      const img = e.target as HTMLImageElement;
                      console.error("Image load error:", img.src);
                      // Only set placeholder once to avoid infinite loop
                      if (!img.dataset.errorHandled) {
                        img.dataset.errorHandled = "true";
                        img.src =
                          "https://placehold.co/800x600/e2e8f0/94a3b8?text=Image+Not+Available";
                      }
                    }}
                  />

                  <div className="absolute top-2 left-2">
                    {(() => {
                      const now = new Date().getTime();
                      const endTime = new Date(auction.end_time).getTime();
                      const hoursRemaining = (endTime - now) / (1000 * 60 * 60);

                      if (auction.status === "live" && hoursRemaining < 24) {
                        return (
                          <div className="flex items-center gap-1">
                            <div className="relative">
                              <div className="w-3 h-3 bg-red-600 rounded-full border-2 border-white"></div>
                              <div className="absolute inset-0 w-3 h-3 bg-red-600 rounded-full border-2 border-white animate-ping"></div>
                            </div>
                          </div>
                        );
                      } else if (auction.status === "live") {
                        return (
                          <span className="inline-block text-xs font-bold px-2 py-1 rounded bg-amber-500 text-white">
                            {t("endingSoon")}
                          </span>
                        );
                      } else {
                        return (
                          <span
                            className={`inline-block text-xs font-bold px-2 py-1 rounded ${
                              auction.status === "soon"
                                ? "bg-amber-500 text-white"
                                : "bg-slate-400 text-white"
                            }`}
                          >
                            {auction.status === "soon"
                              ? t("startsSoon")
                              : t("ended")}
                          </span>
                        );
                      }
                    })()}
                  </div>

                  <button
                    onClick={(e) => handleFavoriteClick(e, auction.id)}
                    className="absolute top-2 right-2"
                  >
                    <Star
                      size={20}
                      className={
                        Array.isArray(watchlistData) &&
                        watchlistData.some(
                          (item: any) => item.auction?.id === auction.id,
                        )
                          ? "fill-amber-400 text-amber-400"
                          : "text-slate-300 hover:text-amber-400"
                      }
                    />
                  </button>
                </div>

                <div className="p-4">
                  <h3 className="font-bold text-sm mb-2 line-clamp-2">
                    {auction.title}
                  </h3>

                  <div className="flex items-center justify-between text-xs text-slate-500 mb-3">
                    <span>
                      {auction.verified && "✓"}{" "}
                      {typeof auction.category === "object"
                        ? auction.category?.name
                        : auction.category}
                    </span>
                    {auction.location && (
                      <span className="text-slate-600 flex items-center gap-1">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          className="w-3.5 h-3.5"
                        >
                          <path
                            fillRule="evenodd"
                            d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z"
                            clipRule="evenodd"
                          />
                        </svg>
                        {auction.location}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4 pb-4 border-t border-slate-100 pt-4">
                    <div>
                      <p className="text-xs text-slate-900 uppercase font-bold underline underline-offset-2">
                        Cena
                      </p>

                      <p className="mt-2 text-xl font-black text-primary-600">
                        {formatPrice(
                          auction.current_highest_bid ||
                            auction.starting_price ||
                            auction.currentBid ||
                            auction.current_bid ||
                            0,
                        )}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-xs text-slate-900 uppercase font-bold underline underline-offset-2">
                        Laiks
                      </p>

                      {auction.end_time ? (
                        <SimpleCountdown
                          endTime={auction.end_time}
                          className="mt-2 text-xl font-black text-primary-600"
                        />
                      ) : (
                        <p className="mt-2 text-xl font-black text-primary-600">
                          {auction.timeRemaining || "-"}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                    <div className="flex items-center gap-2">
                      {/* Bid count */}
                      <div className="flex items-center gap-1 text-xs font-medium text-slate-600">
                        <Gavel size={14} />
                        {auction.numberOfBids || 0} {t("solPluralShort")}
                      </div>
                    </div>

                    <button
                      onClick={(e) =>
                        handleBidClick(e, auction.id, auction.status)
                      }
                      disabled={
                        biddingAuction === auction.id ||
                        (auction.last_bidder &&
                          user &&
                          auction.last_bidder.username === user.username)
                      }
                      className={`flex items-center gap-2 text-sm font-bold px-4 py-2 rounded-md transition-all ${
                        auction.status === "soon"
                          ? "bg-slate-200 text-slate-800 hover:bg-slate-300"
                          : biddingAuction === auction.id ||
                              (auction.last_bidder &&
                                user &&
                                auction.last_bidder.username === user.username)
                            ? "bg-slate-400 text-white cursor-not-allowed"
                            : "bg-primary-500 text-white hover:bg-primary-600"
                      }`}
                    >
                      {auction.status === "soon" ? (
                        "Atgādināt"
                      ) : biddingAuction === auction.id ? (
                        <>
                          <Gavel size={16} className="animate-pulse" />
                          <span>Solās...</span>
                        </>
                      ) : (
                        <>
                          <Gavel size={16} />
                          <span>
                            {formatPriceForButton(
                              Number(
                                auction.current_highest_bid ||
                                  auction.starting_price ||
                                  auction.currentBid ||
                                  auction.current_bid ||
                                  0,
                              ) + Number(auction.minimum_increment || 100),
                            )}
                          </span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Ended Auctions Section */}
      {!loading && endedAuctions.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-8 border-t border-slate-200">
          <h2 className="text-2xl font-bold mb-6 text-slate-600 flex items-start gap-2">
            {t("endedAuctions")}
            <span className="inline-flex items-center justify-center bg-red-600 text-white font-bold text-xs rounded px-1.5 py-0.5 relative -top-1">
              {endedAuctions.length}
            </span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {endedAuctions.map((auction) => (
              <div
                key={auction.id}
                onClick={() => handleAuctionClick(auction.id)}
                className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all cursor-pointer overflow-hidden opacity-60 grayscale hover:opacity-75 hover:grayscale-0"
              >
                <div className="relative h-48 bg-slate-200">
                  <img
                    src={
                      auction.image
                        ? getMediaUrl(auction.image)
                        : "https://placehold.co/800x600/e2e8f0/94a3b8?text=No+Image"
                    }
                    alt={auction.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const img = e.target as HTMLImageElement;
                      if (!img.dataset.errorHandled) {
                        img.dataset.errorHandled = "true";
                        img.src =
                          "https://placehold.co/800x600/e2e8f0/94a3b8?text=Image+Not+Available";
                      }
                    }}
                  />

                  <div className="absolute top-2 left-2">
                    <span className="inline-block text-xs font-bold px-2 py-1 rounded bg-slate-400 text-white">
                      {t("ended")}
                    </span>
                  </div>

                  <button
                    onClick={(e) => handleFavoriteClick(e, auction.id)}
                    className="absolute top-2 right-2"
                  >
                    <Star
                      size={20}
                      className={
                        watchlistData?.some(
                          (item: any) => item.auction?.id === auction.id,
                        )
                          ? "fill-amber-400 text-amber-400"
                          : "text-slate-300 hover:text-amber-400"
                      }
                    />
                  </button>
                </div>

                <div className="p-4">
                  <h3 className="font-bold text-sm mb-2 line-clamp-2 text-slate-600">
                    {auction.title}
                  </h3>

                  <div className="flex items-center justify-between text-xs text-slate-400 mb-3">
                    <span>
                      {auction.verified && "✓"}{" "}
                      {typeof auction.category === "object"
                        ? auction.category?.name
                        : auction.category}
                    </span>
                    {auction.location && (
                      <span className="text-slate-500 flex items-center gap-1">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          className="w-3.5 h-3.5"
                        >
                          <path
                            fillRule="evenodd"
                            d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z"
                            clipRule="evenodd"
                          />
                        </svg>
                        {auction.location}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4 pb-4 border-t border-slate-100 pt-4">
                    <div>
                      <p className="text-xs text-slate-600 uppercase font-bold underline underline-offset-2">
                        Cena
                      </p>

                      <p className="mt-2 text-xl font-black text-slate-500">
                        {formatPrice(
                          auction.current_highest_bid ||
                            auction.starting_price ||
                            auction.currentBid ||
                            auction.current_bid ||
                            0,
                        )}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-xs text-slate-600 uppercase font-bold underline underline-offset-2">
                        Laiks
                      </p>

                      <p className="mt-2 text-xl font-black text-slate-400">
                        {t("ended")}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                    <div className="flex items-center gap-2">
                      {/* Bid count */}
                      <div className="flex items-center gap-1 text-xs font-medium text-slate-500">
                        <Gavel size={14} />
                        {auction.numberOfBids || 0} {t("solPluralShort")}
                      </div>
                    </div>

                    <button
                      disabled
                      className="flex items-center gap-2 text-sm font-bold px-4 py-2 rounded-md bg-slate-300 text-slate-500 cursor-not-allowed"
                    >
                      <span>{t("ended")}</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <footer className="bg-slate-100 border-t border-slate-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center text-sm text-slate-500">
            <p>
              © 2024 Latvijas Izsole. Reģ. Nr. 40003000001. Visas tiesības
              aizsargātas.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
