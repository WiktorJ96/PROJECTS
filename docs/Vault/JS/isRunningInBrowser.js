// isRunningInBrowser.js
export function isRunningInBrowser() {
  return (
    typeof window !== "undefined" && typeof window.indexedDB !== "undefined"
  );
}
