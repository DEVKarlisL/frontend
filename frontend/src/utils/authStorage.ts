/**
 * Auth token storage helpers.
 *
 * Uses localStorage to persist login across tabs and browser restarts.
 * clearLegacyLocalStorageTokens() is for cleaning up any old tokens if needed.
 */

// Debug helper: log current token state
export const logTokenState = () => {
  console.log(
    "[authStorage] access_token:",
    localStorage.getItem(ACCESS_TOKEN_KEY),
  );
  console.log(
    "[authStorage] refresh_token:",
    localStorage.getItem(REFRESH_TOKEN_KEY),
  );
};

const ACCESS_TOKEN_KEY = "access_token";
const REFRESH_TOKEN_KEY = "refresh_token";

export const clearLegacyLocalStorageTokens = () => {
  try {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  } catch {
    // Ignore storage access errors
  }
};

export const getAccessToken = (): string | null => {
  try {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  } catch {
    return null;
  }
};

export const getRefreshToken = (): string | null => {
  try {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  } catch {
    return null;
  }
};

export const setTokens = (access: string, refresh: string) => {
  try {
    localStorage.setItem(ACCESS_TOKEN_KEY, access);
    localStorage.setItem(REFRESH_TOKEN_KEY, refresh);
  } catch {
    // Ignore storage access errors
  }
};

export const clearTokens = () => {
  try {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  } catch {
    // Ignore storage access errors
  }
};
