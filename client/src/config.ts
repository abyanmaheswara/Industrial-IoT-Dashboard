const getBaseUrl = () => {
  const url = import.meta.env.VITE_API_URL || "http://localhost:3001";
  return url.endsWith("/") ? url.slice(0, -1) : url;
};

export const API_URL = getBaseUrl();
