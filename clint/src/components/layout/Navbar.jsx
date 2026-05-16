import { useEffect, useRef, useState } from "react";
import { Bell, Menu, Search, LogOut, CheckCheck } from "lucide-react";
import api from "../../services/api";
import { useAuth } from "../../context/useAuth";
import Button from "../ui/Button";

function Navbar({ onMenuClick }) {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const panelRef = useRef(null);

  const fetchUnreadCount = async () => {
    try {
      const response = await api.get("/notifications/unread-count");
      setUnreadCount(response?.data?.data?.count ?? 0);
    } catch {
      setUnreadCount(0);
    }
  };

  const fetchNotifications = async () => {
    setLoadingNotifications(true);
    try {
      const response = await api.get("/notifications/me");
      const list = response?.data?.data?.notifications ?? [];
      setNotifications(list);
      setUnreadCount(list.filter((item) => !item.isRead).length);
    } catch {
      setNotifications([]);
    } finally {
      setLoadingNotifications(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await api.patch(`/notifications/${notificationId}/read`);
      setNotifications((prev) =>
        prev.map((item) =>
          item._id === notificationId ? { ...item, isRead: true } : item
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch {
      // Keep UI stable if request fails.
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.patch("/notifications/read-all");
      setNotifications((prev) => prev.map((item) => ({ ...item, isRead: true })));
      setUnreadCount(0);
    } catch {
      // Keep UI stable if request fails.
    }
  };

  useEffect(() => {
    fetchUnreadCount();

    const intervalId = setInterval(() => {
      fetchUnreadCount();
    }, 30000);

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleBellClick = async () => {
    const nextOpenState = !menuOpen;
    setMenuOpen(nextOpenState);

    if (nextOpenState) {
      await fetchNotifications();
    }
  };

  const formatTimestamp = (isoDate) => {
    try {
      return new Date(isoDate).toLocaleString([], {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "";
    }
  };

  return (
    <header className="sticky top-0 z-20 border-b border-white/10 bg-slate-950/75 backdrop-blur-xl">
      <div className="flex items-center gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={onMenuClick}
          className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-slate-200 transition hover:bg-white/10 lg:hidden"
          aria-label="Open navigation"
        >
          <Menu size={18} />
        </button>

        <div className="hidden max-w-md flex-1 items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-slate-400 shadow-sm sm:flex">
          <Search size={16} />
          <span className="text-sm">Search complaints, people, districts, departments</span>
        </div>

        <div className="ml-auto flex items-center gap-3">
          <div className="relative" ref={panelRef}>
            <button
              type="button"
              onClick={handleBellClick}
              className="relative inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-slate-200 transition hover:bg-white/10"
              aria-label="Notifications"
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span className="absolute -right-1 -top-1 min-w-5 rounded-full border border-slate-950 bg-cyan-400 px-1.5 text-center text-[10px] font-bold text-slate-950">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>

            {menuOpen && (
              <div className="absolute right-0 z-30 mt-2 w-80 rounded-2xl border border-white/10 bg-slate-900/95 p-3 shadow-2xl backdrop-blur-xl">
                <div className="mb-2 flex items-center justify-between px-1">
                  <p className="text-sm font-semibold text-white">Notifications</p>
                  <button
                    type="button"
                    onClick={markAllAsRead}
                    disabled={!notifications.some((item) => !item.isRead)}
                    className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-xs font-medium text-slate-200 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <CheckCheck size={13} />
                    Mark all read
                  </button>
                </div>

                <div className="max-h-80 space-y-2 overflow-y-auto pr-1">
                  {loadingNotifications && (
                    <p className="rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-sm text-slate-300">
                      Loading notifications...
                    </p>
                  )}

                  {!loadingNotifications && notifications.length === 0 && (
                    <p className="rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-sm text-slate-300">
                      No notifications yet.
                    </p>
                  )}

                  {!loadingNotifications &&
                    notifications.map((item) => (
                      <button
                        key={item._id}
                        type="button"
                        onClick={() => {
                          if (!item.isRead) {
                            markAsRead(item._id);
                          }
                        }}
                        className={`w-full rounded-xl border px-3 py-2.5 text-left transition ${
                          item.isRead
                            ? "border-white/8 bg-white/[0.03]"
                            : "border-cyan-400/25 bg-cyan-400/10"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-semibold text-white">{item.title}</p>
                          {!item.isRead && (
                            <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-cyan-300" />
                          )}
                        </div>
                        <p className="mt-1 text-xs leading-5 text-slate-300">{item.message}</p>
                        <p className="mt-1 text-[11px] text-slate-400">
                          {formatTimestamp(item.createdAt)}
                        </p>
                      </button>
                    ))}
                </div>
              </div>
            )}
          </div>

          <div className="hidden items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-3 py-2.5 md:flex">
            <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 text-sm font-bold text-slate-950">
              {user?.avatar?.url ? (
                <img src={user.avatar.url} alt="Avatar" className="h-full w-full object-cover" />
              ) : (
                <span>{user?.name?.[0]?.toUpperCase() || "U"}</span>
              )}
            </div>

            <div className="leading-tight">
              <p className="text-sm font-semibold text-white">{user?.name || "CityHelp user"}</p>
              <p className="text-xs text-slate-400">{user?.role || "User"}</p>
            </div>
          </div>

          <Button
            variant="secondary"
            size="sm"
            onClick={logout}
            leadingIcon={<LogOut size={15} />}
            className="hidden md:inline-flex"
          >
            Logout
          </Button>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
