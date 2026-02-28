/**
 * Header component
 */

import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useApi";
import { useAuthStore } from "@/store/authStore";
import { getMediaUrl } from "@/services/api";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useLanguageStore } from "@/store/languageStore";

const Header: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { t } = useLanguageStore();
  const logout = useAuthStore((state) => state.logout);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const profileBtnRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  // Close dropdown on outside click
  useEffect(() => {
    if (!isDropdownOpen) return;
    const handleClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        profileBtnRef.current &&
        !profileBtnRef.current.contains(target) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(target)
      ) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [isDropdownOpen]);

  const getUserAvatarFallback = () =>
    `https://ui-avatars.com/api/?name=${
      user?.first_name || user?.username
    }&background=random`;

  const getUserAvatarSrc = () =>
    user?.avatar ? getMediaUrl(user.avatar as string) : getUserAvatarFallback();

  const handleLogout = async () => {
    await logout();
    setIsDropdownOpen(false);
    window.location.href = "/";
  };

  return (
    <header className="bg-white shadow sticky top-0 z-50">
      <div className="container-fluid px-6 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            {/* Logo */}
            <Link
              to="/"
              className="flex items-center gap-3"
              onClick={() => {
                // Force navigation to homepage and reset any filters
                window.location.href = "/";
              }}
            >
              <div className="w-10 h-10 bg-primary-500 rounded flex items-center justify-center text-white font-bold text-lg">
                L
              </div>
              <div>
                <div className="font-bold text-lg tracking-tight">LATVIJAS</div>
                <div className="text-xs tracking-widest text-slate-500">
                  IZSOLE
                </div>
              </div>
            </Link>
          </div>

          {/* Auth Buttons */}
          <div className="flex items-center space-x-4">
            {isLoading ? (
              <div className="flex items-center space-x-3">
                <div className="h-10 w-24 rounded-md skeleton" />
                <div className="h-10 w-28 rounded-md skeleton" />
              </div>
            ) : isAuthenticated && user ? (
              <>
                <LanguageSwitcher />
                <div className="relative">
                  {/* Profile Picture with Username */}
                  <button
                    ref={profileBtnRef}
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center space-x-3 hover:opacity-80 transition"
                  >
                    <img
                      src={getUserAvatarSrc()}
                      alt={user.username}
                      className="w-10 h-10 rounded-full border-2 border-primary-500 object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          getUserAvatarFallback();
                      }}
                    />
                  </button>

                  {/* Dropdown Menu */}
                  {isDropdownOpen && (
                    <div
                      ref={dropdownRef}
                      className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50"
                    >
                      <Link
                        to="/dashboard"
                        onClick={() => setIsDropdownOpen(false)}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 border-b border-gray-100 rounded-t-lg"
                      >
                        <div className="flex items-center gap-2">
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-3zM14 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1h-4a1 1 0 01-1-1v-3z"
                            />
                          </svg>
                          {t("dashboard")}
                        </div>
                      </Link>
                      {user?.is_staff && (
                        <Link
                          to="/admin"
                          onClick={() => setIsDropdownOpen(false)}
                          className="block px-4 py-2 text-sm text-purple-700 hover:bg-purple-50 border-b border-gray-100"
                        >
                          <div className="flex items-center gap-2">
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                              />
                            </svg>
                            👑 {t("adminPanel")}
                          </div>
                        </Link>
                      )}
                      <Link
                        to="/profile"
                        onClick={() => setIsDropdownOpen(false)}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 border-b border-gray-100"
                      >
                        <div className="flex items-center gap-2">
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                          </svg>
                          {t("accountSettings")}
                        </div>
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-b-lg flex items-center gap-2"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                          />
                        </svg>
                        {t("logout")}
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <LanguageSwitcher />
                <Link
                  to="/register"
                  className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded hover:bg-gray-50 font-medium"
                >
                  {t("register")}
                </Link>
                <Link
                  to="/login"
                  className="px-4 py-2 bg-primary-500 text-white rounded hover:bg-primary-600 font-medium"
                >
                  {t("login")}
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
