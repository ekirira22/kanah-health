"use client"

// This file contains client-side utilities for authentication

// Sync localStorage auth state with cookies for middleware
export function syncAuthWithCookies() {
  const userId = localStorage.getItem("auth_user_id")

  if (userId) {
    // Set cookie for middleware
    document.cookie = `auth_user_id=${userId}; path=/; max-age=604800` // 7 days
  } else {
    // Clear cookie
    document.cookie = "auth_user_id=; path=/; max-age=0"
  }
}

// Initialize auth sync on client side
export function initAuthSync() {
  if (typeof window !== "undefined") {
    // Initial sync
    syncAuthWithCookies()

    // Set up storage event listener
    window.addEventListener("storage", (event) => {
      if (event.key === "auth_user_id") {
        syncAuthWithCookies()
      }
    })
  }
}
