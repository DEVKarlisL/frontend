/**
 * My auctions page
 */

import React from "react";
import { useAuctions } from "@/hooks/useApi";
import { useAuth } from "@/hooks/useApi";
import { Link } from "react-router-dom";
import { formatPrice } from "@/utils/helpers";
import { useLanguageStore } from "@/store/languageStore";

const MyAuctionsPage: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguageStore();
  const { data: auctionsData, isLoading } = useAuctions({
    seller: user?.id,
  });

  const auctions = auctionsData?.results || [];

  return (
    <div className="container-fluid py-12">
      <h1 className="text-3xl font-bold mb-8">{t("myAuctionsTitle")}</h1>

      {isLoading ? (
        <p>{t("loading")}</p>
      ) : auctions.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-3 text-left">{t("title")}</th>
                <th className="px-4 py-3 text-left">{t("status")}</th>
                <th className="px-4 py-3 text-left">{t("price")}</th>
                <th className="px-4 py-3 text-left">{t("bids")}</th>
                <th className="px-4 py-3 text-left">{t("actions")}</th>
              </tr>
            </thead>
            <tbody>
              {auctions.map((auction) => (
                <tr key={auction.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <Link
                      to={`/auctions/${auction.id}`}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      {auction.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-3 py-1 rounded text-sm font-medium ${
                        auction.status === "active"
                          ? "bg-green-100 text-green-800"
                          : auction.status === "ended"
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {auction.status === "active"
                        ? t("statusActive")
                        : auction.status === "ended"
                          ? t("statusEnded")
                          : auction.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {formatPrice(auction.current_price)}
                  </td>
                  <td className="px-4 py-3">{auction.total_bids}</td>
                  <td className="px-4 py-3">
                    <Link
                      to={`/auctions/${auction.id}`}
                      className="text-blue-600 hover:text-blue-700 text-sm"
                    >
                      {t("view")}
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-gray-600">{t("noAuctionsYet")}</p>
      )}
    </div>
  );
};

export default MyAuctionsPage;
