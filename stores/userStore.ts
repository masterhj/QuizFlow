import { create } from "zustand";
import type { SessionUser } from "@/types";

interface Notification {
  id: string;
  message: string;
  type: "success" | "error" | "info";
}

interface UserStore {
  // State
  user: SessionUser | null;
  isLoading: boolean;
  notifications: Notification[];

  // Actions
  setUser: (user: SessionUser | null) => void;
  clearUser: () => void;
  addNotification: (message: string, type: "success" | "error" | "info") => void;
  removeNotification: (id: string) => void;
  clearAllNotifications: () => void;
  updateXP: (newXP: number) => void;
  updateStreak: (newStreak: number) => void;
  setLoading: (loading: boolean) => void;
}

export const useUserStore = create<UserStore>((set, get) => ({
  // Initial state
  user: null,
  isLoading: false,
  notifications: [],

  // Actions
  setUser: (user) =>
    set({
      user,
    }),

  clearUser: () =>
    set({
      user: null,
      notifications: [],
    }),

  addNotification: (message, type) =>
    set((state) => {
      const id = Math.random().toString(36).slice(2, 11);
      const newNotification: Notification = {
        id,
        message,
        type,
      };

      // Auto-remove notification after 5 seconds
      setTimeout(() => {
        get().removeNotification(id);
      }, 5000);

      return {
        notifications: [...state.notifications, newNotification],
      };
    }),

  removeNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    })),

  clearAllNotifications: () =>
    set({
      notifications: [],
    }),

  updateXP: (newXP) =>
    set((state) => {
      if (!state.user) return state;

      return {
        user: {
          ...state.user,
          xp: newXP,
        },
      };
    }),

  updateStreak: (newStreak) =>
    set((state) => {
      if (!state.user) return state;

      return {
        user: {
          ...state.user,
          streak: newStreak,
        },
      };
    }),

  setLoading: (loading) =>
    set({
      isLoading: loading,
    }),
}));

// Alias for backward compatibility
export const userStore = useUserStore;
