/**
 * Premium Auction Card Component
 * Displays auction listing with image, price, time remaining
 */

import React from "react";
import Card from "./Card";
import Badge from "./Badge";
import { Heart, Clock, Gavel } from "lucide-react";
import { useLanguageStore } from "@/store/languageStore";
import { formatPrice } from "@/utils/helpers";

interface AuctionCardProps {
  id: number;
  title: string;
  image: string;
  currentBid: number;
  buyNowPrice?: number;
  numberOfBids: number;
  timeRemaining: number; // in seconds
  status: "active" | "ending" | "ended";
  isFavorite?: boolean;
  onFavoriteClick?: () => void;
  onClick?: () => void;
}

const AuctionCard: React.FC<AuctionCardProps> = ({
  title,
  image,
  currentBid,
  buyNowPrice,
  numberOfBids,
  timeRemaining,
  status,
  isFavorite = false,
  onFavoriteClick,
  onClick,
}) => {
  const { t } = useLanguageStore();
  const parseBid = (val: any) => {
    if (typeof val === "string") {
      return parseFloat(val.replace(",", "."));
    }
    return typeof val === "number" ? val : 0;
  };
  const parsedCurrentBid = parseBid(currentBid);
  const formatTimeRemaining = () => {
    const hours = Math.floor(timeRemaining / 3600);
    const minutes = Math.floor((timeRemaining % 3600) / 60);
    const seconds = timeRemaining % 60;
    const pad2 = (value: number) => String(value).padStart(2, "0");
    const days = Math.floor(hours / 24);

    if (days >= 1) {
      return `${days}d ${hours % 24}h ${t("left")}`;
    }
    if (hours > 0) {
      return `${pad2(hours)} : ${pad2(minutes)} : ${pad2(seconds)} ${t("left")}`;
    }
    return `${pad2(minutes)} : ${pad2(seconds)} ${t("left")}`;
  };

  const statusColor = {
    active: "primary",
    ending: "warning",
    ended: "danger",
  };

  const statusLabel = {
    active: t("statusActive"),
    ending: t("statusEnding"),
    ended: t("statusEnded"),
  };

  return (
    <Card
      elevation="lg"
      hoverable
      onClick={onClick}
      className="overflow-hidden flex flex-col h-full"
    >
      {/* Image Container */}
      <div className="relative mb-4 aspect-square overflow-hidden rounded-md bg-neutral-200">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
        />
        {/* Status Badge */}
        <div className="absolute top-3 left-3">
          <Badge
            variant={statusColor[status] as "primary" | "danger" | "warning"}
            size="sm"
          >
            {statusLabel[status]}
          </Badge>
        </div>
        {/* Favorite Button */}
        <button
          className="absolute top-3 right-3 p-2 rounded-full bg-white shadow-md hover:shadow-lg transition-all"
          onClick={(e) => {
            e.stopPropagation();
            onFavoriteClick?.();
          }}
        >
          <Heart
            size={20}
            className={
              isFavorite
                ? "fill-danger-500 text-danger-500"
                : "text-neutral-400"
            }
          />
        </button>
      </div>

      {/* Title */}
      <h3 className="text-lg font-semibold text-neutral-900 line-clamp-2 mb-3">
        {title}
      </h3>

      {/* Price Info */}
      <div className="space-y-2 mb-4">
        <div>
          <p className="text-xs font-medium text-neutral-500 uppercase tracking-wide">
            {t("currentBid")}
          </p>
          <p className="text-2xl font-bold text-primary-600">
            {formatPrice(parsedCurrentBid)}
          </p>
        </div>
        {buyNowPrice !== undefined && (
          <p className="text-sm text-neutral-600">
            {t("buyNow")}:{" "}
            <span className="font-semibold">
              {formatPrice(parseBid(buyNowPrice))}
            </span>
          </p>
        )}
      </div>

      {/* Bid Count & Time */}
      <div className="flex items-center justify-between pt-4 border-t border-neutral-200">
        <div className="flex items-center gap-1.5 text-neutral-600">
          <Gavel size={16} />
          <span className="text-sm font-medium">
            {numberOfBids} {t("bids")}
          </span>
        </div>
        <div
          className={`flex items-center gap-1.5 text-sm font-medium ${
            status === "ending" ? "text-warning-600" : "text-neutral-600"
          }`}
        >
          <Clock size={16} />
          {formatTimeRemaining()}
        </div>
      </div>
    </Card>
  );
};

export default AuctionCard;
