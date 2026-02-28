/**
 * Language switcher component
 */

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLanguageStore } from "@/store/languageStore";

type LanguageOption = {
  code: "lv" | "en" | "ru";
  label: string;
  src: string;
};

const makeDataUri = (svg: string) =>
  `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;

const flagLv = makeDataUri(`
  <svg xmlns="http://www.w3.org/2000/svg" width="60" height="40" viewBox="0 0 60 40">
    <rect width="60" height="40" fill="#9E1B32" />
    <rect y="15" width="60" height="10" fill="#FFFFFF" />
  </svg>
`);

const flagRu = makeDataUri(`
  <svg xmlns="http://www.w3.org/2000/svg" width="60" height="40" viewBox="0 0 60 40">
    <rect width="60" height="40" fill="#FFFFFF" />
    <rect y="13.33" width="60" height="13.34" fill="#0039A6" />
    <rect y="26.66" width="60" height="13.34" fill="#D52B1E" />
  </svg>
`);

const flagGb = makeDataUri(`
  <svg xmlns="http://www.w3.org/2000/svg" width="60" height="40" viewBox="0 0 60 40">
    <rect width="60" height="40" fill="#012169" />
    <line x1="0" y1="0" x2="60" y2="40" stroke="#FFFFFF" stroke-width="12" stroke-linecap="square" />
    <line x1="0" y1="40" x2="60" y2="0" stroke="#FFFFFF" stroke-width="12" stroke-linecap="square" />
    <line x1="0" y1="0" x2="60" y2="40" stroke="#C8102E" stroke-width="6" stroke-linecap="square" />
    <line x1="0" y1="40" x2="60" y2="0" stroke="#C8102E" stroke-width="6" stroke-linecap="square" />
    <rect x="24" width="12" height="40" fill="#FFFFFF" />
    <rect y="14" width="60" height="12" fill="#FFFFFF" />
    <rect x="26" width="8" height="40" fill="#C8102E" />
    <rect y="16" width="60" height="8" fill="#C8102E" />
  </svg>
`);

const options: LanguageOption[] = [
  { code: "lv", label: "Latviešu", src: flagLv },
  { code: "en", label: "English", src: flagGb },
  { code: "ru", label: "Русский", src: flagRu },
];

interface LanguageSwitcherProps {
  compact?: boolean;
}

const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  compact = false,
}) => {
  const { language, setLanguage } = useLanguageStore();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const activeOption = useMemo(
    () => options.find((option) => option.code === language) ?? options[0],
    [language],
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!containerRef.current) {
        return;
      }
      if (!containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (compact) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-1 rounded bg-white p-0.5 hover:bg-slate-50 transition border border-slate-200"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-label={activeOption.label}
        title={activeOption.label}
        style={{ minWidth: 32 }}
      >
        <img
          src={activeOption.src}
          alt={activeOption.label}
          className="h-4 w-6 rounded-sm object-cover"
          loading="lazy"
        />
        {isOpen && (
          <div className="absolute right-0 mt-2 bg-white rounded shadow border border-gray-200 z-50 flex flex-col">
            {options
              .filter((option) => option.code !== language)
              .map((option) => (
                <button
                  key={option.code}
                  type="button"
                  onClick={() => {
                    setLanguage(option.code);
                    setIsOpen(false);
                  }}
                  className="flex items-center gap-2 px-2 py-1 hover:bg-slate-100 text-sm"
                  aria-label={option.label}
                  title={option.label}
                  role="menuitem"
                >
                  <img
                    src={option.src}
                    alt={option.label}
                    className="h-4 w-6 rounded-sm object-cover"
                    loading="lazy"
                  />
                  <span>{option.label}</span>
                </button>
              ))}
          </div>
        )}
      </button>
    );
  }
  return (
    <div
      ref={containerRef}
      className="flex items-center gap-1 rounded-full bg-slate-100 p-1"
    >
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-1 rounded-full bg-white p-1 shadow-sm hover:bg-slate-50 transition"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-label={activeOption.label}
        title={activeOption.label}
      >
        <img
          src={activeOption.src}
          alt={activeOption.label}
          className="h-4 w-6 rounded-sm object-cover"
          loading="lazy"
        />
      </button>

      {isOpen && (
        <div className="flex items-center gap-1" role="menu">
          {options
            .filter((option) => option.code !== language)
            .map((option) => (
              <button
                key={option.code}
                type="button"
                onClick={() => {
                  setLanguage(option.code);
                  setIsOpen(false);
                }}
                className="p-1 rounded-full hover:bg-slate-50 transition"
                aria-label={option.label}
                title={option.label}
                role="menuitem"
              >
                <img
                  src={option.src}
                  alt={option.label}
                  className="h-4 w-6 rounded-sm object-cover"
                  loading="lazy"
                />
              </button>
            ))}
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher;
