/**
 * Main App component
 */

import React, { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useApi";
import { ToastContainer } from "@/components/ToastContainer";
import { useAuthStore } from "@/store/authStore";
import { useLanguageStore } from "@/store/languageStore";

// Pages
import HomePage from "@/pages/HomePage";
import AuctionDetailPage from "@/pages/AuctionDetailPage";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import ProfilePage from "@/pages/ProfilePage";
import DashboardPage from "@/pages/DashboardPage";
import AdminDashboardPage from "@/pages/AdminDashboardPage";
import MyAuctionsPage from "@/pages/MyAuctionsPage";
import WatchlistPage from "@/pages/WatchlistPage";
import CreateAuctionPage from "@/pages/CreateAuctionPage";

// Layout
import Header from "@/components/Header";

const ACTIVITY_EVENTS = [
  "mousemove",
  "mousedown",
  "keydown",
  "scroll",
  "touchstart",
];

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Protected route wrapper
interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading...
      </div>
    );
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

function App() {
  const { t } = useLanguageStore();
  const logout = useAuthStore((state) => state.logout);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const idleTimerRef = useRef<number | null>(null);
  const warningTimerRef = useRef<number | null>(null);
  const [showIdleWarning, setShowIdleWarning] = useState(false);

  const clearIdleTimers = useCallback(() => {
    if (idleTimerRef.current) {
      window.clearTimeout(idleTimerRef.current);
      idleTimerRef.current = null;
    }
    if (warningTimerRef.current) {
      window.clearTimeout(warningTimerRef.current);
      warningTimerRef.current = null;
    }
    setShowIdleWarning(false);
  }, []);

  const getIdleTimeoutMs = useCallback(() => {
    const stored = localStorage.getItem("idle_timeout_minutes");
    const minutes = Number(stored);
    const safeMinutes = Number.isFinite(minutes) && minutes > 0 ? minutes : 5;
    return Math.max(safeMinutes, 1) * 60 * 1000;
  }, []);

  const resetIdleTimer = useCallback(() => {
    if (!isAuthenticated) {
      return;
    }

    const idleTimeoutMs = getIdleTimeoutMs();
    const warningLeadMs = 60 * 1000;

    setShowIdleWarning(false);

    if (idleTimerRef.current) {
      window.clearTimeout(idleTimerRef.current);
    }
    if (warningTimerRef.current) {
      window.clearTimeout(warningTimerRef.current);
    }

    if (idleTimeoutMs > warningLeadMs) {
      warningTimerRef.current = window.setTimeout(() => {
        setShowIdleWarning(true);
      }, idleTimeoutMs - warningLeadMs);
    }

    idleTimerRef.current = window.setTimeout(() => {
      setShowIdleWarning(false);
      logout().catch(() => {
        // Ignore logout errors for idle timeout
      });
    }, idleTimeoutMs);
  }, [getIdleTimeoutMs, isAuthenticated, logout]);

  useEffect(() => {
    if (!isAuthenticated) {
      clearIdleTimers();
      return;
    }

    ACTIVITY_EVENTS.forEach((event) => {
      window.addEventListener(event, resetIdleTimer);
    });

    resetIdleTimer();

    return () => {
      ACTIVITY_EVENTS.forEach((event) => {
        window.removeEventListener(event, resetIdleTimer);
      });
      clearIdleTimers();
    };
  }, [clearIdleTimers, isAuthenticated, resetIdleTimer]);

  return (
    <QueryClientProvider client={queryClient}>
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <div className="flex flex-col min-h-screen">
          <Header />
          <main className="flex-1">
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/auctions/:id" element={<AuctionDetailPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              {/* Protected routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/auctions/create"
                element={
                  <ProtectedRoute>
                    <CreateAuctionPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin"
                element={
                  <ProtectedRoute>
                    <AdminDashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/my-auctions"
                element={
                  <ProtectedRoute>
                    <MyAuctionsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/watchlist"
                element={
                  <ProtectedRoute>
                    <WatchlistPage />
                  </ProtectedRoute>
                }
              />

              {/* 404 */}
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </main>
        </div>
        <ToastContainer />
        {showIdleWarning && isAuthenticated && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl border border-slate-200">
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-xl">
                    ⏱️
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">
                      {t("sessionExpiring")}
                    </h3>
                    <p className="text-sm text-slate-600">
                      {t("sessionExpiringMessage")}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-end gap-3">
                  <button
                    onClick={() => {
                      setShowIdleWarning(false);
                      resetIdleTimer();
                    }}
                    className="px-4 py-2 rounded-lg bg-slate-900 text-white font-semibold hover:bg-slate-800 transition"
                  >
                    {t("stayLoggedIn")}
                  </button>
                  <button
                    onClick={() => {
                      setShowIdleWarning(false);
                      logout().catch(() => {
                        // Ignore logout errors
                      });
                    }}
                    className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 transition"
                  >
                    {t("logoutNow")}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </Router>
    </QueryClientProvider>
  );
}

export default App;
