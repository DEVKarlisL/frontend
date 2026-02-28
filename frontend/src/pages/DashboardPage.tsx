/**
 * User Dashboard Page - Professional Layout with Sidebar
 */

import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useApi";
import { apiClient, getMediaUrl } from "@/services/api";
import { useLanguageStore } from "@/store/languageStore";
import { useAuthStore } from "@/store/authStore";
import {
  LayoutDashboard,
  Gavel,
  ShoppingBag,
  Settings,
  User,
  LogOut,
  Bell,
  TrendingUp,
  Package,
  Heart,
  Award,
  Activity,
  HelpCircle,
} from "lucide-react";

interface DashboardStats {
  activeAuctions: number;
  totalBids: number;
  watchlistCount: number;
  wonAuctions: number;
}

type ActiveTab =
  | "overview"
  | "my-auctions"
  | "bids"
  | "watchlist"
  | "won"
  | "profile"
  | "notifications"
  | "settings";

const extractResponseList = (response: any) =>
  response?.data?.results || response?.data || [];

const DashboardPage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const logout = useAuthStore((state) => state.logout);
  const { t } = useLanguageStore();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<ActiveTab>("overview");
  const [stats, setStats] = useState<DashboardStats>({
    activeAuctions: 0,
    totalBids: 0,
    watchlistCount: 0,
    wonAuctions: 0,
  });
  const [recentAuctions, setRecentAuctions] = useState<any[]>([]);
  const [recentBids, setRecentBids] = useState<any[]>([]);
  const [watchlist, setWatchlist] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    if (isAuthenticated) {
      fetchDashboardData();
    }
  }, [isAuthenticated]);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      // Initialize empty arrays
      let auctions: any[] = [];
      let bids: any[] = [];
      let watchlistData: any[] = [];

      // Fetch user's auctions (handle 404 gracefully)
      try {
        const auctionsResponse = await apiClient.get(
          "/auctions/auctions/my-auctions/",
        );
        auctions = extractResponseList(auctionsResponse);
      } catch (auctError) {
        console.log(
          "Could not fetch my auctions (endpoint may not exist):",
          auctError,
        );
      }

      // Fetch user's bids
      try {
        const bidsResponse = await apiClient.get("/bidding/bids/");
        bids = extractResponseList(bidsResponse);
      } catch (bidError) {
        console.error("Error fetching bids:", bidError);
      }

      // Fetch watchlist
      try {
        const watchlistResponse = await apiClient.get("/auctions/watchlist/");
        watchlistData = extractResponseList(watchlistResponse);
      } catch (watchError) {
        console.error("Error fetching watchlist:", watchError);
      }

      // Calculate stats
      const activeAuctions = Array.isArray(auctions)
        ? auctions.filter((a: any) => a.status === "active").length
        : 0;

      const wonAuctions = Array.isArray(auctions)
        ? auctions.filter(
            (a: any) => a.status === "completed" && a.winner?.id === user?.id,
          ).length
        : 0;

      setStats({
        activeAuctions,
        totalBids: Array.isArray(bids) ? bids.length : 0,
        watchlistCount: Array.isArray(watchlistData) ? watchlistData.length : 0,
        wonAuctions,
      });

      // Set recent items
      setRecentAuctions(Array.isArray(auctions) ? auctions.slice(0, 5) : []);
      setRecentBids(Array.isArray(bids) ? bids.slice(0, 5) : []);
      setWatchlist(Array.isArray(watchlistData) ? watchlistData : []);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const menuItems = [
    {
      id: "overview" as ActiveTab,
      label: t("overview"),
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: "my-auctions" as ActiveTab,
      label: t("myAuctions"),
      icon: Gavel,
      badge: stats.activeAuctions,
    },
    {
      id: "bids" as ActiveTab,
      label: t("myBids"),
      icon: TrendingUp,
      badge: stats.totalBids,
    },
    {
      id: "watchlist" as ActiveTab,
      label: t("watchlist"),
      icon: Heart,
      badge: stats.watchlistCount,
    },
    {
      id: "won" as ActiveTab,
      label: t("wonAuctionsTab"),
      icon: Award,
      badge: stats.wonAuctions,
    },
    {
      id: "profile" as ActiveTab,
      label: t("profile"),
      icon: User,
      badge: null,
    },
    {
      id: "notifications" as ActiveTab,
      label: t("notifications"),
      icon: Bell,
      badge: null,
    },
    {
      id: "settings" as ActiveTab,
      label: t("settings"),
      icon: Settings,
      badge: null,
    },
  ];

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto py-12 text-center">
        <p className="text-gray-600">
          {t("pleaseLogin")} to view your dashboard
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar */}
      <aside
        className={`${
          isSidebarOpen ? "w-64" : "w-20"
        } bg-white shadow-lg transition-all duration-300 fixed h-screen overflow-y-auto z-30`}
      >
        {/* User Profile Section */}
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <div className={`${isSidebarOpen ? "block" : "hidden"}`}>
              <h3 className="font-bold text-slate-900 truncate">
                {user?.first_name || user?.username}
              </h3>
              <p className="text-sm text-slate-500 truncate">{user?.email}</p>
            </div>
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 hover:bg-slate-100 rounded-lg transition"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d={
                    isSidebarOpen
                      ? "M11 19l-7-7 7-7m8 14l-7-7 7-7"
                      : "M13 5l7 7-7 7M5 5l7 7-7 7"
                  }
                />
              </svg>
            </button>
          </div>
          {isSidebarOpen && (
            <Link
              to="/auctions/create"
              className="w-full bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition flex items-center justify-center gap-2 font-medium"
            >
              <Package size={18} />
              {t("createAuction")}
            </Link>
          )}
        </div>

        {/* Navigation Menu */}
        <nav className="p-4">
          <div className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                    activeTab === item.id
                      ? "bg-primary-50 text-primary-600 font-semibold"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <Icon size={20} />
                  {isSidebarOpen && (
                    <>
                      <span className="flex-1 text-left">{item.label}</span>
                      {item.badge !== null && item.badge > 0 && (
                        <span className="bg-primary-600 text-white text-xs px-2 py-1 rounded-full">
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                </button>
              );
            })}
          </div>

          {/* Divider */}
          <div className="my-4 border-t border-slate-200"></div>

          {/* Additional Links */}
          <div className="space-y-1">
            <Link
              to="/"
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-slate-600 hover:bg-slate-100 transition"
            >
              <ShoppingBag size={20} />
              {isSidebarOpen && <span>{t("browseAuctions")}</span>}
            </Link>
            <Link
              to="/help"
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-slate-600 hover:bg-slate-100 transition"
            >
              <HelpCircle size={20} />
              {isSidebarOpen && <span>{t("helpCenter")}</span>}
            </Link>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition"
            >
              <LogOut size={20} />
              {isSidebarOpen && <span>{t("logout")}</span>}
            </button>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main
        className={`flex-1 ${isSidebarOpen ? "ml-64" : "ml-20"} transition-all duration-300`}
      >
        {/* Top Header */}
        <header className="bg-white shadow-sm sticky top-0 z-20">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">
                  {menuItems.find((item) => item.id === activeTab)?.label ||
                    t("dashboardTitle")}
                </h1>
                <p className="text-sm text-slate-500 mt-1">
                  {t("welcomeBack")} {user?.first_name || user?.username}!
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button className="relative p-2 hover:bg-slate-100 rounded-lg transition">
                  <Bell size={20} />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>
                <Link
                  to="/profile"
                  className="flex items-center gap-2 px-3 py-2 hover:bg-slate-100 rounded-lg transition"
                >
                  <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                    <User size={18} className="text-primary-600" />
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="p-6">
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl shadow-lg p-6 text-white">
                  <div className="flex items-center justify-between mb-2">
                    <Gavel size={24} />
                    <Activity size={20} className="opacity-50" />
                  </div>
                  <p className="text-sm opacity-90 mb-1">
                    {t("activeAuctions")}
                  </p>
                  <p className="text-3xl font-bold">{stats.activeAuctions}</p>
                </div>

                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
                  <div className="flex items-center justify-between mb-2">
                    <TrendingUp size={24} />
                    <Activity size={20} className="opacity-50" />
                  </div>
                  <p className="text-sm opacity-90 mb-1">{t("totalBids")}</p>
                  <p className="text-3xl font-bold">{stats.totalBids}</p>
                </div>

                <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl shadow-lg p-6 text-white">
                  <div className="flex items-center justify-between mb-2">
                    <Heart size={24} />
                    <Activity size={20} className="opacity-50" />
                  </div>
                  <p className="text-sm opacity-90 mb-1">{t("watchlist")}</p>
                  <p className="text-3xl font-bold">{stats.watchlistCount}</p>
                </div>

                <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
                  <div className="flex items-center justify-between mb-2">
                    <Award size={24} />
                    <Activity size={20} className="opacity-50" />
                  </div>
                  <p className="text-sm opacity-90 mb-1">{t("wonAuctions")}</p>
                  <p className="text-3xl font-bold">{stats.wonAuctions}</p>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Auctions */}
                <div className="bg-white rounded-xl shadow-md p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-slate-900">
                      {t("myRecentAuctions")}
                    </h2>
                    <button
                      onClick={() => setActiveTab("my-auctions")}
                      className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                    >
                      {t("viewAllLink")} →
                    </button>
                  </div>
                  {recentAuctions.length > 0 ? (
                    <div className="space-y-3">
                      {recentAuctions.map((auction) => (
                        <Link
                          key={auction.id}
                          to={`/auctions/${auction.id}`}
                          className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition group"
                        >
                          <img
                            src={
                              auction.image
                                ? getMediaUrl(auction.image)
                                : "https://placehold.co/100x100/e2e8f0/64748b?text=No+Image"
                            }
                            alt={auction.title}
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-slate-900 truncate group-hover:text-primary-600">
                              {auction.title}
                            </h3>
                            <p className="text-sm text-slate-500">
                              {t("statusLabel")}:{" "}
                              <span
                                className={`font-medium ${
                                  auction.status === "active"
                                    ? "text-green-600"
                                    : "text-slate-600"
                                }`}
                              >
                                {auction.status}
                              </span>
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-slate-600">
                              €
                              {(
                                auction.current_highest_bid ||
                                auction.starting_price ||
                                0
                              ).toLocaleString()}
                            </p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Package
                        size={48}
                        className="mx-auto text-slate-300 mb-3"
                      />
                      <p className="text-slate-500">{t("noAuctionsYet")}</p>
                      <Link
                        to="/auctions/create"
                        className="inline-block mt-3 text-primary-600 hover:text-primary-700 font-medium"
                      >
                        {t("createNew")} →
                      </Link>
                    </div>
                  )}
                </div>

                {/* Recent Bids */}
                <div className="bg-white rounded-xl shadow-md p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-slate-900">
                      {t("recentBids")}
                    </h2>
                    <button
                      onClick={() => setActiveTab("bids")}
                      className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                    >
                      {t("viewAllLink")} →
                    </button>
                  </div>
                  {recentBids.length > 0 ? (
                    <div className="space-y-3">
                      {recentBids.map((bid) => (
                        <div
                          key={bid.id}
                          className="flex items-center justify-between p-3 border border-slate-200 rounded-lg hover:border-primary-300 transition"
                        >
                          <div className="flex-1">
                            <p className="font-medium text-slate-900">
                              {bid.auction?.title || t("unknownAuction")}
                            </p>
                            <p className="text-sm text-slate-500">
                              {new Date(bid.created_at).toLocaleDateString(
                                "en-US",
                                {
                                  month: "short",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                },
                              )}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-primary-600">
                              €{bid.amount?.toLocaleString()}
                            </p>
                            <p
                              className={`text-xs font-medium ${
                                bid.is_winning
                                  ? "text-green-600"
                                  : "text-red-600"
                              }`}
                            >
                              {bid.is_winning ? t("winning") : t("outbid")}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <TrendingUp
                        size={48}
                        className="mx-auto text-slate-300 mb-3"
                      />
                      <p className="text-slate-500">{t("noBidsYet")}</p>
                      <Link
                        to="/"
                        className="inline-block mt-3 text-primary-600 hover:text-primary-700 font-medium"
                      >
                        {t("startBidding")} →
                      </Link>
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-lg font-bold text-slate-900 mb-4">
                  {t("quickActions")}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Link
                    to="/auctions/create"
                    className="flex items-center gap-4 p-4 border-2 border-dashed border-slate-300 rounded-xl hover:border-primary-500 hover:bg-primary-50 transition group"
                  >
                    <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center group-hover:bg-primary-200 transition">
                      <Package size={24} className="text-primary-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900 group-hover:text-primary-600">
                        {t("createAuction")}
                      </p>
                      <p className="text-sm text-slate-500">
                        {t("listNewItem")}
                      </p>
                    </div>
                  </Link>

                  <button
                    onClick={() => setActiveTab("my-auctions")}
                    className="flex items-center gap-4 p-4 border-2 border-dashed border-slate-300 rounded-xl hover:border-primary-500 hover:bg-primary-50 transition group"
                  >
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center group-hover:bg-blue-200 transition">
                      <Gavel size={24} className="text-blue-600" />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-slate-900 group-hover:text-primary-600">
                        {t("manageAuctions")}
                      </p>
                      <p className="text-sm text-slate-500">
                        {t("viewListings")}
                      </p>
                    </div>
                  </button>

                  <Link
                    to="/profile"
                    className="flex items-center gap-4 p-4 border-2 border-dashed border-slate-300 rounded-xl hover:border-primary-500 hover:bg-primary-50 transition group"
                  >
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center group-hover:bg-green-200 transition">
                      <User size={24} className="text-green-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900 group-hover:text-primary-600">
                        {t("editProfile")}
                      </p>
                      <p className="text-sm text-slate-500">
                        {t("updateInfo")}
                      </p>
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          )}

          {activeTab === "my-auctions" && (
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-900">
                  {t("myAuctions")}
                </h2>
                <Link
                  to="/auctions/create"
                  className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition flex items-center gap-2"
                >
                  <Package size={18} />
                  {t("createNew")}
                </Link>
              </div>
              {recentAuctions.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {recentAuctions.map((auction) => (
                    <Link
                      key={auction.id}
                      to={`/auctions/${auction.id}`}
                      className="border border-slate-200 rounded-lg overflow-hidden hover:shadow-lg transition group"
                    >
                      <img
                        src={
                          auction.image
                            ? getMediaUrl(auction.image)
                            : "https://placehold.co/400x300/e2e8f0/64748b?text=No+Image"
                        }
                        alt={auction.title}
                        className="w-full h-48 object-cover group-hover:scale-105 transition"
                      />
                      <div className="p-4">
                        <h3 className="font-semibold text-slate-900 mb-2 group-hover:text-primary-600">
                          {auction.title}
                        </h3>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-600">
                            {t("currentBidLabel")}
                          </span>
                          <span className="font-bold text-primary-600">
                            €
                            {(
                              auction.current_highest_bid ||
                              auction.starting_price ||
                              0
                            ).toLocaleString()}
                          </span>
                        </div>
                        <div className="mt-2 pt-2 border-t border-slate-200">
                          <span
                            className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                              auction.status === "active"
                                ? "bg-green-100 text-green-700"
                                : "bg-slate-100 text-slate-700"
                            }`}
                          >
                            {auction.status}
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <Package size={64} className="mx-auto text-slate-300 mb-4" />
                  <p className="text-slate-500 mb-4">{t("noAuctionsYet")}</p>
                  <Link
                    to="/auctions/create"
                    className="inline-block bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition"
                  >
                    {t("createNew")}
                  </Link>
                </div>
              )}
            </div>
          )}

          {activeTab === "bids" && (
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-6">
                {t("myBids")}
              </h2>
              {recentBids.length > 0 ? (
                <div className="space-y-4">
                  {recentBids.map((bid) => (
                    <div
                      key={bid.id}
                      className="flex items-center gap-4 p-4 border border-slate-200 rounded-lg hover:border-primary-300 transition"
                    >
                      <div className="w-20 h-20 bg-slate-100 rounded-lg overflow-hidden">
                        <img
                          src="https://placehold.co/80x80/e2e8f0/64748b?text=Bid"
                          alt="Bid"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-900">
                          {bid.auction?.title || t("unknownAuction")}
                        </h3>
                        <p className="text-sm text-slate-500">
                          {new Date(bid.created_at).toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-xl text-primary-600">
                          €{bid.amount?.toLocaleString()}
                        </p>
                        <p
                          className={`text-sm font-medium ${
                            bid.is_winning ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {bid.is_winning
                            ? `✓ ${t("winning")}`
                            : `✗ ${t("outbid")}`}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <TrendingUp
                    size={64}
                    className="mx-auto text-slate-300 mb-4"
                  />
                  <p className="text-slate-500 mb-4">{t("noBidsYet")}</p>
                  <Link
                    to="/"
                    className="inline-block bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition"
                  >
                    {t("browseAuctions")}
                  </Link>
                </div>
              )}
            </div>
          )}

          {activeTab === "watchlist" && (
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-6">
                {t("watchlist")}
              </h2>
              {watchlist.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {watchlist.map((item) => {
                    const auction = item.auction || item;
                    return (
                      <Link
                        key={item.id}
                        to={`/auctions/${auction.id}`}
                        className="border border-slate-200 rounded-lg overflow-hidden hover:shadow-lg transition group"
                      >
                        <img
                          src={
                            auction.image
                              ? getMediaUrl(auction.image)
                              : "https://placehold.co/400x300/e2e8f0/64748b?text=No+Image"
                          }
                          alt={auction.title}
                          className="w-full h-48 object-cover group-hover:scale-105 transition"
                        />
                        <div className="p-4">
                          <h3 className="font-semibold text-slate-900 mb-2 group-hover:text-primary-600">
                            {auction.title}
                          </h3>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-600">Current Bid</span>
                            <span className="font-bold text-primary-600">
                              €
                              {(
                                auction.current_highest_bid ||
                                auction.starting_price ||
                                0
                              ).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-16">
                  <Heart size={64} className="mx-auto text-slate-300 mb-4" />
                  <p className="text-slate-500 mb-4">{t("noItemsWatchlist")}</p>
                  <Link
                    to="/"
                    className="inline-block bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition"
                  >
                    {t("browseAuctions")}
                  </Link>
                </div>
              )}
            </div>
          )}

          {activeTab === "won" && (
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-6">
                {t("wonAuctionsTab")}
              </h2>
              <div className="text-center py-16">
                <Award size={64} className="mx-auto text-slate-300 mb-4" />
                <p className="text-slate-500">{t("noWonAuctions")}</p>
              </div>
            </div>
          )}

          {activeTab === "profile" && (
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-6">
                {t("profileSettings")}
              </h2>
              <Link
                to="/profile"
                className="inline-block bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition"
              >
                {t("goToProfilePage")}
              </Link>
            </div>
          )}

          {activeTab === "notifications" && (
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-6">
                {t("notifications")}
              </h2>
              <div className="text-center py-16">
                <Bell size={64} className="mx-auto text-slate-300 mb-4" />
                <p className="text-slate-500">{t("noNotifications")}</p>
              </div>
            </div>
          )}

          {activeTab === "settings" && (
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-6">
                {t("settings")}
              </h2>
              <div className="space-y-4">
                <div className="p-4 border border-slate-200 rounded-lg">
                  <h3 className="font-semibold text-slate-900 mb-2">
                    {t("accountSettingsLabel")}
                  </h3>
                  <p className="text-sm text-slate-500">
                    {t("manageAccountPrefs")}
                  </p>
                </div>
                <div className="p-4 border border-slate-200 rounded-lg">
                  <h3 className="font-semibold text-slate-900 mb-2">
                    {t("notificationPreferences")}
                  </h3>
                  <p className="text-sm text-slate-500">
                    {t("controlNotifications")}
                  </p>
                </div>
                <div className="p-4 border border-slate-200 rounded-lg">
                  <h3 className="font-semibold text-slate-900 mb-2">
                    {t("privacySecurity")}
                  </h3>
                  <p className="text-sm text-slate-500">
                    {t("managePrivacySettings")}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
