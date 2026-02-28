/**
 * Admin Dashboard Page - Super Modern Admin Panel
 */

import React, { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useApi";
import { apiClient } from "@/services/api";
import { useNavigate } from "react-router-dom";
import { toast } from "@/store/toastStore";
import { useAuthStore } from "@/store/authStore";
import {
  LayoutDashboard,
  Users,
  Gavel,
  FolderOpen,
  Settings,
  LogOut,
  Package,
} from "lucide-react";

interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  is_active: boolean;
  is_staff: boolean;
  is_verified: boolean;
  total_auctions: number;
  total_bids: number;
  created_at: string;
}

interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  icon: string;
  display_order?: number;
  widget_settings?: {
    background_image?: string;
    background_color?: string;
    card_size?: "small" | "medium" | "large";
  };
}

interface Auction {
  id: number;
  title: string;
  status: string;
  seller: any;
  current_bid: number;
  bid_count: number;
  created_at: string;
}

interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  totalAuctions: number;
  activeAuctions: number;
  totalBids: number;
  totalRevenue: number;
}

interface AppSettings {
  faviconUrl?: string;
  maintenanceMode: boolean;
  allowRegistrations: boolean;
  requireEmailVerification: boolean;
  enableGoogleLogin: boolean;
  enableBidding: boolean;
  enableBuyNow: boolean;
  enableWatchlist: boolean;
  showEndedAuctions: boolean;
  enableAntiSnipe: boolean;
  defaultAntiSnipeSeconds: number;
  minAuctionDurationHours: number;
  maxAuctionDurationDays: number;
  defaultBidIncrement: number;
  maxActiveAuctionsPerUser: number;
  maxImagesPerAuction: number;
  maxImageSizeMb: number;
  currency: string;
  timezone: string;
  supportEmail: string;
}

const defaultAppSettings: AppSettings = {
  faviconUrl: "",
  maintenanceMode: false,
  allowRegistrations: true,
  requireEmailVerification: false,
  enableGoogleLogin: true,
  enableBidding: true,
  enableBuyNow: true,
  enableWatchlist: true,
  showEndedAuctions: true,
  enableAntiSnipe: true,
  defaultAntiSnipeSeconds: 30,
  minAuctionDurationHours: 1,
  maxAuctionDurationDays: 30,
  defaultBidIncrement: 5,
  maxActiveAuctionsPerUser: 10,
  maxImagesPerAuction: 8,
  maxImageSizeMb: 5,
  currency: "EUR",
  timezone: "Europe/Riga",
  supportEmail: "support@example.com",
};

const extractResponseList = (response: any) =>
  response?.data?.results || response?.data || [];

const loadAppSettings = (): AppSettings => {
  try {
    const raw = localStorage.getItem("admin_app_settings");
    if (!raw) return defaultAppSettings;
    const parsed = JSON.parse(raw) as Partial<AppSettings>;
    return { ...defaultAppSettings, ...parsed };
  } catch {
    return defaultAppSettings;
  }
};

const AdminDashboardPage: React.FC = () => {
  const navItems = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "users", label: "Users", icon: Users },
    { id: "auctions", label: "Auctions", icon: Gavel },
    { id: "categories", label: "Categories", icon: FolderOpen },
    { id: "settings", label: "Settings", icon: Settings },
  ];
  // Favicon upload state
  const [faviconFile, setFaviconFile] = useState<File | null>(null);
  const [faviconPreview, setFaviconPreview] = useState<string>("");

  // Handle favicon file selection
  const handleFaviconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFaviconFile(file);
    if (file) {
      setFaviconPreview(URL.createObjectURL(file));
    } else {
      setFaviconPreview("");
    }
  };

  // Upload favicon to backend
  const uploadFavicon = async () => {
    if (!faviconFile) return;
    const formData = new FormData();
    formData.append("favicon", faviconFile);
    try {
      const response = await apiClient.put("admin/settings/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Favicon updated!");
      setAppSettings((prev) => ({
        ...prev,
        faviconUrl: response.data.favicon,
      }));
      // Dynamically update favicon in HTML head
      if (response.data.favicon) {
        let link = document.querySelector("link[rel~='icon']");
        if (!link) {
          link = document.createElement("link");
          link.rel = "icon";
          document.head.appendChild(link);
        }
        link.href = response.data.favicon;
      }
    } catch (err) {
      toast.error("Failed to upload favicon");
    }
  };
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<
    "overview" | "users" | "auctions" | "categories" | "settings"
  >("overview");

  // Data states
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    activeUsers: 0,
    totalAuctions: 0,
    activeAuctions: 0,
    totalBids: 0,
    totalRevenue: 0,
  });
  const [users, setUsers] = useState<User[]>([]);
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [draggedCategoryId, setDraggedCategoryId] = useState<number | null>(
    null,
  );
  const [isReorderingCategories, setIsReorderingCategories] = useState(false);

  // UI states
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [idleTimeoutMinutes, setIdleTimeoutMinutes] = useState<number>(() => {
    const stored = localStorage.getItem("idle_timeout_minutes");
    const minutes = Number(stored);
    return Number.isFinite(minutes) && minutes > 0 ? minutes : 5;
  });
  const [appSettings, setAppSettings] = useState<AppSettings>(loadAppSettings);
  const [auctionDataHash, setAuctionDataHash] = useState<string>("");
  const [categoryForm, setCategoryForm] = useState({
    name: "",
    slug: "",
    description: "",
    icon: "",
    icon_image: "",
    background_image: "",
    background_color: "#1e40af",
    text_color: "#ffffff",
    timer_color: "#fbbf24",
    card_size: "medium" as "small" | "medium" | "large",
  });

  useEffect(() => {
    // Wait for auth to finish loading before checking
    if (authLoading) {
      return;
    }

    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    if (!user?.is_staff) {
      navigate("/");
      return;
    }

    fetchAllData();

    // Poll for auction updates every 1 second, only update if data changed
    const interval = setInterval(async () => {
      await fetchAuctionsQuiet();
    }, 1000);

    return () => clearInterval(interval);
  }, [isAuthenticated, user, authLoading]);

  const fetchAllData = async () => {
    setIsLoading(true);
    try {
      await Promise.all([
        fetchStats(),
        fetchUsers(),
        fetchAuctions(),
        fetchCategories(),
      ]);
    } catch (error) {
      console.error("Error fetching admin data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const [usersRes, auctionsRes, bidsRes] = await Promise.all([
        apiClient.get("/users/users/"),
        apiClient.get("/auctions/auctions/"),
        apiClient.get("/bidding/bids/"),
      ]);

      const allUsers = extractResponseList(usersRes);
      const allAuctions = extractResponseList(auctionsRes);
      const allBids = extractResponseList(bidsRes);

      setStats({
        totalUsers: allUsers.length,
        activeUsers: allUsers.filter((u: any) => u.is_active).length,
        totalAuctions: allAuctions.length,
        activeAuctions: allAuctions.filter((a: any) => a.status === "active")
          .length,
        totalBids: allBids.length,
        totalRevenue: allBids.reduce(
          (sum: number, bid: any) => sum + (bid.amount || 0),
          0,
        ),
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await apiClient.get("/users/users/");
      const userData = extractResponseList(response);
      setUsers(Array.isArray(userData) ? userData : []);
    } catch (error) {
      console.error("Error fetching users:", error);
      setUsers([]);
    }
  };

  const fetchAuctions = async () => {
    try {
      const response = await apiClient.get("/auctions/auctions/");
      const auctionData = extractResponseList(response);
      setAuctions(Array.isArray(auctionData) ? auctionData : []);
    } catch (error) {
      console.error("Error fetching auctions:", error);
      setAuctions([]);
    }
  };

  // Fetch auctions quietly, only update if data changed
  const fetchAuctionsQuiet = async () => {
    try {
      const response = await apiClient.get("/auctions/auctions/");
      const auctionData = extractResponseList(response);

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
          if (
            prevAuction.current_bid !== newAuctionData.current_bid ||
            prevAuction.title !== newAuctionData.title ||
            prevAuction.end_time !== newAuctionData.end_time ||
            prevAuction.status !== newAuctionData.status
          ) {
            hasChanges = true;
            return {
              ...prevAuction,
              ...newAuctionData,
            };
          }

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

  const sortCategories = (items: Category[]) => {
    return [...items].sort((a, b) => {
      const orderA = Number.isFinite(a.display_order) ? a.display_order! : 0;
      const orderB = Number.isFinite(b.display_order) ? b.display_order! : 0;

      if (orderA !== orderB) {
        return orderA - orderB;
      }

      return a.name.localeCompare(b.name);
    });
  };

  const reorderCategories = (
    items: Category[],
    sourceId: number,
    targetId: number,
  ) => {
    const sourceIndex = items.findIndex((item) => item.id === sourceId);
    const targetIndex = items.findIndex((item) => item.id === targetId);

    if (sourceIndex < 0 || targetIndex < 0) {
      return items;
    }

    const updated = [...items];
    const [moved] = updated.splice(sourceIndex, 1);
    updated.splice(targetIndex, 0, moved);
    return updated;
  };

  const saveCategoryOrder = async (ordered: Category[]) => {
    setIsReorderingCategories(true);
    try {
      await apiClient.post("/auctions/categories/reorder/", {
        ordered_ids: ordered.map((category) => category.id),
      });
      toast.success("Category order updated");
    } catch (error) {
      console.error("Error updating category order:", error);
      toast.error("Failed to update category order");
      throw error;
    } finally {
      setIsReorderingCategories(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await apiClient.get("/auctions/categories/");
      const categoryData = extractResponseList(response);
      const normalized = Array.isArray(categoryData) ? categoryData : [];
      setCategories(sortCategories(normalized));
    } catch (error) {
      console.error("Error fetching categories:", error);
      setCategories([]);
    }
  };

  const handleSaveIdleTimeout = () => {
    const clamped = Math.min(Math.max(Math.round(idleTimeoutMinutes), 1), 240);
    localStorage.setItem("idle_timeout_minutes", String(clamped));
    setIdleTimeoutMinutes(clamped);
    toast.success("Session timeout updated");
  };

  const handleSaveAppSettings = () => {
    localStorage.setItem("admin_app_settings", JSON.stringify(appSettings));
    toast.success("App settings saved");
  };

  const handleBanUser = async (userId: number, currentStatus: boolean) => {
    if (
      !confirm(
        `Are you sure you want to ${currentStatus ? "unban" : "ban"} this user?`,
      )
    ) {
      return;
    }

    try {
      await apiClient.patch(`/users/users/${userId}/`, {
        is_active: !currentStatus,
      });
      await fetchUsers();
      toast.success(
        !currentStatus ? "Lietotājs aktivizēts" : "Lietotājs bloķēts",
      );
    } catch (error) {
      console.error("Error banning/unbanning user:", error);
      toast.error("Neizdevās atjaunināt lietotāja statusu");
    }
  };

  const handleToggleAdmin = async (userId: number, currentStatus: boolean) => {
    if (
      !confirm(
        `Are you sure you want to ${currentStatus ? "revoke admin rights from" : "make"} this user ${currentStatus ? "" : "an admin"}?`,
      )
    ) {
      return;
    }

    try {
      await apiClient.patch(`/users/users/${userId}/`, {
        is_staff: !currentStatus,
        is_superuser: !currentStatus,
      });
      await fetchUsers();
      toast.success(
        !currentStatus
          ? "Admina tiesības pievienotas"
          : "Admina tiesības noņemtas",
      );
    } catch (error) {
      console.error("Error updating admin status:", error);
      toast.error("Neizdevās atjaunināt admina statusu");
    }
  };

  const handleDeleteAuction = async (auctionId: number) => {
    if (!confirm("Are you sure you want to delete this auction?")) {
      return;
    }

    try {
      await apiClient.delete(`/auctions/auctions/${auctionId}/`);
      await fetchAuctions();
      toast.success("Izsole izdzēsta");
    } catch (error) {
      console.error("Error deleting auction:", error);
      toast.error("Neizdevās izdzēst izsoli");
    }
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const categoryData = {
        name: categoryForm.name,
        slug:
          categoryForm.slug ||
          categoryForm.name.toLowerCase().replace(/\s+/g, "-"),
        description: categoryForm.description,
        icon: categoryForm.icon,
        widget_settings: {
          icon_image: categoryForm.icon_image || "",
          background_image: categoryForm.background_image || "",
          background_color: categoryForm.background_color || "#1e40af",
          text_color: categoryForm.text_color || "#ffffff",
          timer_color: categoryForm.timer_color || "#fbbf24",
          card_size: categoryForm.card_size || "medium",
        },
      };

      if (editingCategory) {
        await apiClient.post(
          `/auctions/categories/${editingCategory.id}/update/`,
          categoryData,
        );
      } else {
        await apiClient.post("/auctions/categories/", categoryData);
      }

      setShowCategoryModal(false);
      setEditingCategory(null);
      setCategoryForm({
        name: "",
        slug: "",
        description: "",
        icon: "",
        icon_image: "",
        background_image: "",
        background_color: "#1e40af",
        text_color: "#ffffff",
        timer_color: "#fbbf24",
        card_size: "medium",
      });
      await fetchCategories();
      toast.success(
        editingCategory ? "Kategorija saglabāta" : "Kategorija izveidota",
      );
    } catch (error: any) {
      console.error("Error saving category:", error);
      const errorMessage =
        error.response?.data?.detail ||
        error.response?.data?.message ||
        error.message ||
        "Failed to save category";
      toast.error(`Neizdevās saglabāt kategoriju: ${errorMessage}`);
    }
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setCategoryForm({
      name: category.name,
      slug: category.slug,
      description: category.description,
      icon: category.icon,
      icon_image: category.widget_settings?.icon_image || "",
      background_image: category.widget_settings?.background_image || "",
      background_color: category.widget_settings?.background_color || "#1e40af",
      text_color: category.widget_settings?.text_color || "#ffffff",
      timer_color: category.widget_settings?.timer_color || "#fbbf24",
      card_size: category.widget_settings?.card_size || "medium",
    });
    setShowCategoryModal(true);
  };

  const handleDeleteCategory = async (categoryId: number) => {
    if (!confirm("Are you sure you want to delete this category?")) {
      return;
    }

    try {
      await apiClient.delete(`/auctions/categories/${categoryId}/`);
      await fetchCategories();
      toast.success("Kategorija izdzēsta");
    } catch (error) {
      console.error("Error deleting category:", error);
      toast.error("Neizdevās izdzēst kategoriju");
    }
  };

  const handleCategoryDragStart = (categoryId: number) => {
    setDraggedCategoryId(categoryId);
  };

  const handleCategoryDrop = async (targetId: number) => {
    if (draggedCategoryId === null || draggedCategoryId === targetId) {
      setDraggedCategoryId(null);
      return;
    }

    const previous = categories;
    const updated = reorderCategories(previous, draggedCategoryId, targetId);
    setCategories(updated);
    setDraggedCategoryId(null);

    try {
      await saveCategoryOrder(updated);
    } catch {
      setCategories(previous);
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading admin dashboard...</p>
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
        {/* Admin Profile Section */}
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <div className={`${isSidebarOpen ? "block" : "hidden"}`}>
              <h3 className="font-bold text-slate-900 truncate">
                {user?.first_name || user?.username}
              </h3>
              <p className="text-sm text-slate-500 truncate">Admin Panel</p>
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
            <button
              onClick={() => navigate("/auctions/create")}
              className="w-full bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition flex items-center justify-center gap-2 font-medium"
            >
              <Package size={18} />
              Create Auction
            </button>
          )}
        </div>

        {/* Navigation Menu */}
        <nav className="p-4">
          {navItems.map((item: any) => {
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
                  <span className="flex-1 text-left">{item.label}</span>
                )}
              </button>
            );
          })}

          {/* Divider */}
          <div className="my-4 border-t border-slate-200"></div>

          {/* Additional Links */}
          <div className="space-y-1">
            <button
              onClick={() => navigate("/")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition text-slate-600 hover:bg-slate-100`}
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
                  d="M3 12l2-3m0 0l7-4 7 4M5 9v10a1 1 0 001 1h2.05a1 1 0 01.82.47l2.84 4.27a1 1 0 001.64 0l2.84-4.27a1 1 0 01.82-.47H19a1 1 0 001-1V9m-9 4h4"
                />
              </svg>
              {isSidebarOpen && (
                <span className="flex-1 text-left">Website</span>
              )}
            </button>
            <button
              onClick={() => {
                useAuthStore.getState().logout();
                navigate("/login");
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition text-red-600 hover:bg-red-50`}
            >
              <LogOut size={20} />
              {isSidebarOpen && (
                <span className="flex-1 text-left">Logout</span>
              )}
            </button>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <div
        className={`${isSidebarOpen ? "ml-64" : "ml-20"} flex-1 transition-all duration-300`}
      >
        <div className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-20">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-indigo-600 bg-clip-text text-transparent">
                  Admin Dashboard
                </h1>
                <p className="text-gray-600 mt-1">
                  Manage your auction platform
                </p>
              </div>
              <div className="px-4 py-2 bg-primary-100 text-primary-700 rounded-lg font-semibold">
                👑 Super Admin
              </div>
            </div>
          </div>
        </div>
        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Total Users */}
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100 text-sm font-medium">
                        Total Users
                      </p>
                      <p className="text-4xl font-bold mt-2">
                        {stats.totalUsers}
                      </p>
                      <p className="text-blue-100 text-xs mt-1">
                        {stats.activeUsers} active
                      </p>
                    </div>
                    <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center text-3xl">
                      👥
                    </div>
                  </div>
                </div>

                {/* Total Auctions */}
                <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-100 text-sm font-medium">
                        Total Auctions
                      </p>
                      <p className="text-4xl font-bold mt-2">
                        {stats.totalAuctions}
                      </p>
                      <p className="text-purple-100 text-xs mt-1">
                        {stats.activeAuctions} active
                      </p>
                    </div>
                    <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center text-3xl">
                      🔨
                    </div>
                  </div>
                </div>

                {/* Total Bids */}
                <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-100 text-sm font-medium">
                        Total Bids
                      </p>
                      <p className="text-4xl font-bold mt-2">
                        {stats.totalBids}
                      </p>
                      <p className="text-green-100 text-xs mt-1">
                        €{stats.totalRevenue.toLocaleString()} total
                      </p>
                    </div>
                    <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center text-3xl">
                      💰
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Users */}
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h3 className="text-xl font-bold mb-4">Recent Users</h3>
                  <div className="space-y-3">
                    {users.slice(0, 5).map((user) => (
                      <div
                        key={user.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-bold">
                            {user.username.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium">{user.username}</p>
                            <p className="text-xs text-gray-500">
                              {user.email}
                            </p>
                          </div>
                        </div>
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded ${
                            user.is_active
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {user.is_active ? "Active" : "Banned"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent Auctions */}
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h3 className="text-xl font-bold mb-4">Recent Auctions</h3>
                  <div className="space-y-3">
                    {auctions.slice(0, 5).map((auction) => (
                      <div
                        key={auction.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div>
                          <p className="font-medium">{auction.title}</p>
                          <p className="text-xs text-gray-500">
                            {auction.bid_count} bids
                          </p>
                        </div>
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded ${
                            auction.status === "active"
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {auction.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Users Tab */}
          {activeTab === "users" && (
            <div className="space-y-6">
              {/* Search Bar */}
              <div className="bg-white rounded-2xl shadow-lg p-4">
                <input
                  type="text"
                  placeholder="Search users by username or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              {/* Users Table */}
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                          User
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                          Email
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                          Auctions
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                          Bids
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                          Status
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {users
                        .filter(
                          (u) =>
                            u.username
                              .toLowerCase()
                              .includes(searchTerm.toLowerCase()) ||
                            u.email
                              .toLowerCase()
                              .includes(searchTerm.toLowerCase()),
                        )
                        .map((user) => (
                          <tr key={user.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-bold">
                                  {user.username.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <p className="font-medium">{user.username}</p>
                                  <p className="text-xs text-gray-500">
                                    {user.first_name} {user.last_name}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600">
                              {user.email}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600">
                              {user.total_auctions}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600">
                              {user.total_bids}
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <span
                                  className={`px-3 py-1 text-xs font-medium rounded-full ${
                                    user.is_active
                                      ? "bg-green-100 text-green-700"
                                      : "bg-red-100 text-red-700"
                                  }`}
                                >
                                  {user.is_active ? "Active" : "Banned"}
                                </span>
                                {user.is_verified && (
                                  <span
                                    className="text-blue-500"
                                    title="Verified"
                                  >
                                    ✓
                                  </span>
                                )}
                                {user.is_staff && (
                                  <span
                                    className="text-purple-500"
                                    title="Staff"
                                  >
                                    👑
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex gap-2">
                                <button
                                  onClick={() =>
                                    handleBanUser(user.id, user.is_active)
                                  }
                                  className={`px-4 py-2 text-sm font-medium rounded-lg transition ${
                                    user.is_active
                                      ? "bg-red-100 text-red-700 hover:bg-red-200"
                                      : "bg-green-100 text-green-700 hover:bg-green-200"
                                  }`}
                                >
                                  {user.is_active ? "Ban" : "Unban"}
                                </button>
                                <button
                                  onClick={() =>
                                    handleToggleAdmin(user.id, user.is_staff)
                                  }
                                  className={`px-4 py-2 text-sm font-medium rounded-lg transition ${
                                    user.is_staff
                                      ? "bg-purple-100 text-purple-700 hover:bg-purple-200"
                                      : "bg-blue-100 text-blue-700 hover:bg-blue-200"
                                  }`}
                                  title={
                                    user.is_staff
                                      ? "Revoke Admin"
                                      : "Make Admin"
                                  }
                                >
                                  {user.is_staff
                                    ? "👑 Remove Admin"
                                    : "👑 Make Admin"}
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Auctions Tab */}
          {activeTab === "auctions" && (
            <div className="space-y-6">
              {/* Search Bar */}
              <div className="bg-white rounded-2xl shadow-lg p-4">
                <input
                  type="text"
                  placeholder="Search auctions by title..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              {/* Auctions Table */}
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                          Auction
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                          Seller
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                          Current Bid
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                          Bids
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                          Status
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {auctions
                        .filter((a) =>
                          a.title
                            .toLowerCase()
                            .includes(searchTerm.toLowerCase()),
                        )
                        .map((auction) => (
                          <tr key={auction.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4">
                              <p className="font-medium">{auction.title}</p>
                              <p className="text-xs text-gray-500">
                                ID: {auction.id}
                              </p>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600">
                              {auction.seller?.username || "Unknown"}
                            </td>
                            <td className="px-6 py-4 text-sm font-semibold text-primary-600">
                              €{auction.current_bid?.toLocaleString() || "0"}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600">
                              {auction.bid_count}
                            </td>
                            <td className="px-6 py-4">
                              <span
                                className={`px-3 py-1 text-xs font-medium rounded-full ${
                                  auction.status === "active"
                                    ? "bg-green-100 text-green-700"
                                    : auction.status === "draft"
                                      ? "bg-yellow-100 text-yellow-700"
                                      : "bg-gray-100 text-gray-700"
                                }`}
                              >
                                {auction.status}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <button
                                onClick={() => handleDeleteAuction(auction.id)}
                                className="px-4 py-2 text-sm font-medium bg-red-100 text-red-700 hover:bg-red-200 rounded-lg transition"
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Categories Tab */}
          {activeTab === "categories" && (
            <div className="space-y-6">
              {/* Create Category Button */}
              <div className="flex justify-end">
                <button
                  onClick={() => {
                    setEditingCategory(null);
                    setCategoryForm({
                      name: "",
                      slug: "",
                      description: "",
                      icon: "",
                      background_image: "",
                      background_color: "#1e40af",
                      card_size: "medium",
                    });
                    setShowCategoryModal(true);
                  }}
                  className="px-6 py-3 bg-primary-500 text-white rounded-xl font-semibold hover:bg-primary-600 transition shadow-lg hover:shadow-xl flex items-center gap-2"
                >
                  <span>+</span> Create New Category
                </button>
              </div>

              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>Drag categories to reorder.</span>
                {isReorderingCategories && (
                  <span className="text-primary-600 font-medium">
                    Saving order...
                  </span>
                )}
              </div>

              {/* Categories Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categories.map((category) => (
                  <div
                    key={category.id}
                    draggable
                    onDragStart={() => handleCategoryDragStart(category.id)}
                    onDragOver={(event) => event.preventDefault()}
                    onDrop={() => handleCategoryDrop(category.id)}
                    onDragEnd={() => setDraggedCategoryId(null)}
                    className={`bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition cursor-move ${
                      draggedCategoryId === category.id
                        ? "opacity-70 ring-2 ring-primary-300"
                        : ""
                    }`}
                  >
                    <div
                      className="h-32 flex items-center justify-center text-4xl relative"
                      style={{
                        backgroundColor:
                          category.widget_settings?.background_color ||
                          "#1e40af",
                        backgroundImage: category.widget_settings
                          ?.background_image
                          ? `url(${category.widget_settings.background_image})`
                          : "none",
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                      }}
                    >
                      <span className="absolute top-2 right-2 text-white/80 text-xs bg-black/30 px-2 py-1 rounded">
                        Drag
                      </span>
                      {category.icon}
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-bold mb-2">
                        {category.name}
                      </h3>
                      <p className="text-sm text-gray-600 mb-4">
                        {category.description}
                      </p>
                      <div className="flex items-center gap-2 mb-4">
                        <span className="px-3 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full">
                          {category.slug}
                        </span>
                        <span className="px-3 py-1 text-xs font-medium bg-primary-100 text-primary-700 rounded-full">
                          {category.widget_settings?.card_size || "medium"}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditCategory(category)}
                          className="flex-1 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg font-medium hover:bg-blue-200 transition"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(category.id)}
                          className="flex-1 px-4 py-2 bg-red-100 text-red-700 rounded-lg font-medium hover:bg-red-200 transition"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {/* Settings Tab */}
          {activeTab === "settings" && (
            <div className="space-y-6">
              {/* Favicon Upload */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <h3 className="text-xl font-bold">Favicon</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Upload a new favicon for your website.
                    </p>
                  </div>
                  <span className="px-3 py-1 text-xs font-semibold rounded-full bg-yellow-50 text-yellow-700">
                    Branding
                  </span>
                </div>
                <div className="mt-5 space-y-4">
                  <input
                    type="file"
                    accept="image/x-icon,image/png,image/jpeg"
                    onChange={handleFaviconChange}
                  />
                  {faviconPreview && (
                    <img
                      src={faviconPreview}
                      alt="Favicon Preview"
                      style={{ width: 32, height: 32, marginTop: 8 }}
                    />
                  )}
                  <button
                    onClick={uploadFavicon}
                    disabled={!faviconFile}
                    className="btn bg-primary-600 text-white px-4 py-2 rounded-lg mt-2"
                  >
                    Upload Favicon
                  </button>
                  {appSettings.faviconUrl && (
                    <div style={{ marginTop: 8 }}>
                      <span>Current favicon:</span>
                      <img
                        src={appSettings.faviconUrl}
                        alt="Current Favicon"
                        style={{ width: 32, height: 32, marginLeft: 8 }}
                      />
                    </div>
                  )}
                </div>
              </div>
              {/* ...existing code... */}
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">
                    Settings
                  </h2>
                  <p className="text-sm text-slate-600">
                    Centralized controls for platform behavior.
                  </p>
                </div>
                <button
                  onClick={handleSaveAppSettings}
                  className="px-5 py-2.5 rounded-xl bg-primary-600 text-white font-semibold hover:bg-primary-700 transition"
                >
                  Save All Settings
                </button>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <h3 className="text-xl font-bold">Session Management</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Configure user inactivity timeout and warnings.
                    </p>
                  </div>
                  <span className="px-3 py-1 text-xs font-semibold rounded-full bg-indigo-50 text-indigo-700">
                    Security
                  </span>
                </div>

                <div className="mt-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-gray-800">
                      Auto-logout after inactivity
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Users will be warned 1 minute before logout.
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={1}
                        max={240}
                        value={idleTimeoutMinutes}
                        onChange={(e) =>
                          setIdleTimeoutMinutes(Number(e.target.value))
                        }
                        className="w-24 px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                      <span className="text-sm text-gray-600">minutes</span>
                    </div>
                    <button
                      onClick={handleSaveIdleTimeout}
                      className="px-4 py-2 rounded-lg bg-primary-600 text-white font-semibold hover:bg-primary-700 transition"
                    >
                      Save
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <h3 className="text-xl font-bold">Platform Controls</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      System-wide switches for access and onboarding.
                    </p>
                  </div>
                  <span className="px-3 py-1 text-xs font-semibold rounded-full bg-amber-50 text-amber-700">
                    Access
                  </span>
                </div>

                <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    {
                      label: "Maintenance mode",
                      value: appSettings.maintenanceMode,
                      onChange: (val: boolean) =>
                        setAppSettings((prev) => ({
                          ...prev,
                          maintenanceMode: val,
                        })),
                      helper: "Show a maintenance banner and block writes.",
                    },
                    {
                      label: "Allow registrations",
                      value: appSettings.allowRegistrations,
                      onChange: (val: boolean) =>
                        setAppSettings((prev) => ({
                          ...prev,
                          allowRegistrations: val,
                        })),
                      helper: "Enable new user sign-ups.",
                    },
                    {
                      label: "Require email verification",
                      value: appSettings.requireEmailVerification,
                      onChange: (val: boolean) =>
                        setAppSettings((prev) => ({
                          ...prev,
                          requireEmailVerification: val,
                        })),
                      helper: "Block actions until email is verified.",
                    },
                    {
                      label: "Enable Google login",
                      value: appSettings.enableGoogleLogin,
                      onChange: (val: boolean) =>
                        setAppSettings((prev) => ({
                          ...prev,
                          enableGoogleLogin: val,
                        })),
                      helper: "Show Google OAuth sign-in option.",
                    },
                  ].map((item) => (
                    <label
                      key={item.label}
                      className="flex items-start justify-between gap-4 rounded-xl border border-slate-200 p-4"
                    >
                      <div>
                        <p className="text-sm font-semibold text-slate-900">
                          {item.label}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          {item.helper}
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={item.value}
                        onChange={(e) => item.onChange(e.target.checked)}
                        className="h-5 w-5 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                      />
                    </label>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <h3 className="text-xl font-bold">Marketplace Features</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Control which modules are active for users.
                    </p>
                  </div>
                  <span className="px-3 py-1 text-xs font-semibold rounded-full bg-emerald-50 text-emerald-700">
                    Features
                  </span>
                </div>

                <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    {
                      label: "Enable bidding",
                      value: appSettings.enableBidding,
                      onChange: (val: boolean) =>
                        setAppSettings((prev) => ({
                          ...prev,
                          enableBidding: val,
                        })),
                      helper: "Allow users to place bids.",
                    },
                    {
                      label: "Enable Buy Now",
                      value: appSettings.enableBuyNow,
                      onChange: (val: boolean) =>
                        setAppSettings((prev) => ({
                          ...prev,
                          enableBuyNow: val,
                        })),
                      helper: "Show Buy Now price on auctions.",
                    },
                    {
                      label: "Enable watchlist",
                      value: appSettings.enableWatchlist,
                      onChange: (val: boolean) =>
                        setAppSettings((prev) => ({
                          ...prev,
                          enableWatchlist: val,
                        })),
                      helper: "Allow users to save auctions.",
                    },
                    {
                      label: "Show ended auctions",
                      value: appSettings.showEndedAuctions,
                      onChange: (val: boolean) =>
                        setAppSettings((prev) => ({
                          ...prev,
                          showEndedAuctions: val,
                        })),
                      helper: "Display completed auctions in listings.",
                    },
                  ].map((item) => (
                    <label
                      key={item.label}
                      className="flex items-start justify-between gap-4 rounded-xl border border-slate-200 p-4"
                    >
                      <div>
                        <p className="text-sm font-semibold text-slate-900">
                          {item.label}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          {item.helper}
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={item.value}
                        onChange={(e) => item.onChange(e.target.checked)}
                        className="h-5 w-5 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                      />
                    </label>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                      <h3 className="text-xl font-bold">Auction Rules</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        Defaults for auction creation limits.
                      </p>
                    </div>
                    <span className="px-3 py-1 text-xs font-semibold rounded-full bg-slate-100 text-slate-700">
                      Auctions
                    </span>
                  </div>
                  <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-slate-600">
                        Min duration (hours)
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={168}
                        value={appSettings.minAuctionDurationHours}
                        onChange={(e) =>
                          setAppSettings((prev) => ({
                            ...prev,
                            minAuctionDurationHours: Number(e.target.value),
                          }))
                        }
                        className="mt-2 w-full px-3 py-2 rounded-lg border border-slate-200"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-600">
                        Max duration (days)
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={365}
                        value={appSettings.maxAuctionDurationDays}
                        onChange={(e) =>
                          setAppSettings((prev) => ({
                            ...prev,
                            maxAuctionDurationDays: Number(e.target.value),
                          }))
                        }
                        className="mt-2 w-full px-3 py-2 rounded-lg border border-slate-200"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-600">
                        Default bid increment
                      </label>
                      <input
                        type="number"
                        min={1}
                        step={1}
                        value={appSettings.defaultBidIncrement}
                        onChange={(e) =>
                          setAppSettings((prev) => ({
                            ...prev,
                            defaultBidIncrement: Number(e.target.value),
                          }))
                        }
                        className="mt-2 w-full px-3 py-2 rounded-lg border border-slate-200"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-600">
                        Max active auctions/user
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={100}
                        value={appSettings.maxActiveAuctionsPerUser}
                        onChange={(e) =>
                          setAppSettings((prev) => ({
                            ...prev,
                            maxActiveAuctionsPerUser: Number(e.target.value),
                          }))
                        }
                        className="mt-2 w-full px-3 py-2 rounded-lg border border-slate-200"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                      <h3 className="text-xl font-bold">Bidding Protection</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        Anti-snipe and bid control settings.
                      </p>
                    </div>
                    <span className="px-3 py-1 text-xs font-semibold rounded-full bg-red-50 text-red-700">
                      Bidding
                    </span>
                  </div>
                  <div className="mt-5 space-y-4">
                    <label className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 p-4">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">
                          Enable anti-snipe
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          Extend auctions when bids are placed near end.
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={appSettings.enableAntiSnipe}
                        onChange={(e) =>
                          setAppSettings((prev) => ({
                            ...prev,
                            enableAntiSnipe: e.target.checked,
                          }))
                        }
                        className="h-5 w-5 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                      />
                    </label>
                    <div>
                      <label className="text-xs font-semibold text-slate-600">
                        Default anti-snipe seconds
                      </label>
                      <input
                        type="number"
                        min={0}
                        max={300}
                        value={appSettings.defaultAntiSnipeSeconds}
                        onChange={(e) =>
                          setAppSettings((prev) => ({
                            ...prev,
                            defaultAntiSnipeSeconds: Number(e.target.value),
                          }))
                        }
                        className="mt-2 w-full px-3 py-2 rounded-lg border border-slate-200"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                      <h3 className="text-xl font-bold">Media Limits</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        Image upload constraints.
                      </p>
                    </div>
                    <span className="px-3 py-1 text-xs font-semibold rounded-full bg-purple-50 text-purple-700">
                      Uploads
                    </span>
                  </div>
                  <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-slate-600">
                        Max images per auction
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={20}
                        value={appSettings.maxImagesPerAuction}
                        onChange={(e) =>
                          setAppSettings((prev) => ({
                            ...prev,
                            maxImagesPerAuction: Number(e.target.value),
                          }))
                        }
                        className="mt-2 w-full px-3 py-2 rounded-lg border border-slate-200"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-600">
                        Max image size (MB)
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={50}
                        value={appSettings.maxImageSizeMb}
                        onChange={(e) =>
                          setAppSettings((prev) => ({
                            ...prev,
                            maxImageSizeMb: Number(e.target.value),
                          }))
                        }
                        className="mt-2 w-full px-3 py-2 rounded-lg border border-slate-200"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                      <h3 className="text-xl font-bold">Localization</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        Default currency, timezone and contact.
                      </p>
                    </div>
                    <span className="px-3 py-1 text-xs font-semibold rounded-full bg-blue-50 text-blue-700">
                      Locale
                    </span>
                  </div>
                  <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-slate-600">
                        Currency
                      </label>
                      <input
                        type="text"
                        value={appSettings.currency}
                        onChange={(e) =>
                          setAppSettings((prev) => ({
                            ...prev,
                            currency: e.target.value.toUpperCase(),
                          }))
                        }
                        className="mt-2 w-full px-3 py-2 rounded-lg border border-slate-200"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-600">
                        Timezone
                      </label>
                      <input
                        type="text"
                        value={appSettings.timezone}
                        onChange={(e) =>
                          setAppSettings((prev) => ({
                            ...prev,
                            timezone: e.target.value,
                          }))
                        }
                        className="mt-2 w-full px-3 py-2 rounded-lg border border-slate-200"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="text-xs font-semibold text-slate-600">
                        Support email
                      </label>
                      <input
                        type="email"
                        value={appSettings.supportEmail}
                        onChange={(e) =>
                          setAppSettings((prev) => ({
                            ...prev,
                            supportEmail: e.target.value,
                          }))
                        }
                        className="mt-2 w-full px-3 py-2 rounded-lg border border-slate-200"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <h3 className="text-xl font-bold">Helpful Links</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Quick access to key areas of the platform.
                    </p>
                  </div>
                  <span className="px-3 py-1 text-xs font-semibold rounded-full bg-emerald-50 text-emerald-700">
                    Navigation
                  </span>
                </div>
                <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-3">
                  <button
                    onClick={() => navigate("/dashboard")}
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 text-slate-700 font-semibold hover:bg-slate-100 transition"
                  >
                    📈 User Dashboard
                  </button>
                  <button
                    onClick={() => navigate("/watchlist")}
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 text-slate-700 font-semibold hover:bg-slate-100 transition"
                  >
                    ⭐ Watchlist
                  </button>
                  <button
                    onClick={() => navigate("/my-auctions")}
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 text-slate-700 font-semibold hover:bg-slate-100 transition"
                  >
                    🧾 My Auctions
                  </button>
                  <button
                    onClick={() => navigate("/auctions/create")}
                    className="w-full px-4 py-3 rounded-xl bg-indigo-50 text-indigo-700 font-semibold hover:bg-indigo-100 transition"
                  >
                    ➕ Create Auction
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Category Modal */}
        {showCategoryModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-2xl font-bold">
                  {editingCategory ? "Edit Category" : "Create New Category"}
                </h2>
              </div>
              <form onSubmit={handleSaveCategory} className="p-6 space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Category Name *
                    </label>
                    <input
                      type="text"
                      value={categoryForm.name}
                      onChange={(e) =>
                        setCategoryForm({
                          ...categoryForm,
                          name: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Slug
                    </label>
                    <input
                      type="text"
                      value={categoryForm.slug}
                      onChange={(e) =>
                        setCategoryForm({
                          ...categoryForm,
                          slug: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="auto-generated"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={categoryForm.description}
                    onChange={(e) =>
                      setCategoryForm({
                        ...categoryForm,
                        description: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Icon (emoji or text)
                  </label>
                  <input
                    type="text"
                    value={categoryForm.icon}
                    onChange={(e) =>
                      setCategoryForm({ ...categoryForm, icon: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="🚗"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Icon Image URL (optional - overrides emoji)
                  </label>
                  <input
                    type="url"
                    value={categoryForm.icon_image}
                    onChange={(e) =>
                      setCategoryForm({
                        ...categoryForm,
                        icon_image: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="https://example.com/icon.png"
                  />
                </div>

                {/* Widget Settings */}
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-bold mb-4">Widget Settings</h3>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Background Color
                      </label>
                      <input
                        type="color"
                        value={categoryForm.background_color}
                        onChange={(e) =>
                          setCategoryForm({
                            ...categoryForm,
                            background_color: e.target.value,
                          })
                        }
                        className="w-full h-12 border border-gray-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Text Color
                      </label>
                      <input
                        type="color"
                        value={categoryForm.text_color}
                        onChange={(e) =>
                          setCategoryForm({
                            ...categoryForm,
                            text_color: e.target.value,
                          })
                        }
                        className="w-full h-12 border border-gray-300 rounded-lg"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mt-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Timer Color
                      </label>
                      <input
                        type="color"
                        value={categoryForm.timer_color}
                        onChange={(e) =>
                          setCategoryForm({
                            ...categoryForm,
                            timer_color: e.target.value,
                          })
                        }
                        className="w-full h-12 border border-gray-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Card Size
                      </label>
                      <select
                        value={categoryForm.card_size}
                        onChange={(e) =>
                          setCategoryForm({
                            ...categoryForm,
                            card_size: e.target.value as any,
                          })
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      >
                        <option value="small">Small</option>
                        <option value="medium">Medium</option>
                        <option value="large">Large</option>
                      </select>
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Background Image URL
                    </label>
                    <input
                      type="url"
                      value={categoryForm.background_image}
                      onChange={(e) =>
                        setCategoryForm({
                          ...categoryForm,
                          background_image: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="https://picsum.photos/seed/category/300/300"
                    />
                  </div>

                  {/* Preview */}
                  <div className="mt-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Preview
                    </label>
                    <div
                      className="h-32 rounded-lg flex flex-col items-center justify-center relative overflow-hidden"
                      style={{
                        backgroundColor: categoryForm.background_color,
                        backgroundImage: categoryForm.background_image
                          ? `url(${categoryForm.background_image})`
                          : "none",
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                      }}
                    >
                      {categoryForm.background_image && (
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent"></div>
                      )}
                      <div className="relative z-10">
                        {categoryForm.icon_image ? (
                          <img
                            src={categoryForm.icon_image}
                            alt="Category icon"
                            className="w-12 h-12 object-contain"
                          />
                        ) : (
                          <span className="text-4xl">{categoryForm.icon}</span>
                        )}
                      </div>
                      <p
                        className="relative z-10 font-bold mt-2"
                        style={{ color: categoryForm.text_color }}
                      >
                        {categoryForm.name || "Category Name"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCategoryModal(false)}
                    className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-primary-500 text-white rounded-lg font-semibold hover:bg-primary-600 transition"
                  >
                    {editingCategory ? "Save Changes" : "Create Category"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboardPage;
