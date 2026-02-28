/**
 * Watchlist page
 */

import React, { useEffect } from "react";
import { useWatchlist } from "@/hooks/useApi";
import { Link } from "react-router-dom";
import { formatPrice, calculateTimeRemaining } from "@/utils/helpers";
import { useLanguageStore } from "@/store/languageStore";

const WatchlistPage: React.FC = () => {
  const { data: watchlistData, isLoading, isError, error } = useWatchlist();
  const { t } = useLanguageStore();

  useEffect(() => {
    console.log("[WatchlistPage] Data updated:", {
      count: watchlistData?.length,
      loading: isLoading,
      error: isError ? error : null,
      data: watchlistData,
    });
  }, [watchlistData, isLoading, isError, error]);

  const watchlist = watchlistData || [];

  return (
    <div className="container-fluid py-12">
      <h1 className="text-3xl font-bold mb-8">{t("watchlistTitle")}</h1>

      {isLoading ? (
        <p>{t("loading")}</p>
      ) : watchlist.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {watchlist.map((item) => (
            <Link
              key={item.id}
              to={`/auctions/${item.auction.id}`}
              className="card hover:shadow-lg transition-shadow"
            >
              {item.auction.images?.[0] && (
                <div className="mb-4 bg-gray-200 aspect-square rounded-lg overflow-hidden">
                  <img
                    src={item.auction.images[0].image}
                    alt={item.auction.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <h3 className="font-semibold text-lg mb-2 line-clamp-2">
                {item.auction.title}
              </h3>

              <div className="mb-4">
                <p className="text-gray-600 text-sm mb-1">{t("currentBid")}</p>
                <p className="text-2xl font-bold text-blue-600">
                  {formatPrice(
                    item.auction.current_highest_bid ||
                      item.auction.starting_price,
                  )}
                </p>
              </div>

              <div className="flex justify-between text-sm text-gray-600">
                <span>
                  {item.auction.bid_count || 0} {t("bids")}
                </span>
                <span>{calculateTimeRemaining(item.auction.end_time)}</span>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <p className="text-gray-600">{t("noWatchlist")}</p>
      )}
    </div>
  );
};

export default WatchlistPage;
