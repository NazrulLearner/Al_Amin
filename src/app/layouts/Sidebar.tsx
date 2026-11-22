// src/app/layouts/Sidebar.tsx
// অ্যাপের বাম পক্ষের নেভিগেশন মেনু — কম্প্যাক্ট, পরিষ্কার, মোবাইলে চাইড-নেভ ক্লিকে অটো-বন্ধ

import { cloneElement, useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Banknote,
  BriefcaseBusiness,
  Building2,
  ChevronDown,
  ChevronRight,
  DollarSign,
  FileChartLine,
  HandCoins,
  HelpCircle,
  Home,
  Landmark,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  Settings,
  Shield,
  TrendingUp,
  User,
  Users,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useAuth } from "../providers/AuthProvider";
import { menuConfig } from "../../navigation/menuConfig";
import type { UserRole } from "../../types";

interface SidebarProps {
  isOpen?: boolean;
  toggleSidebar?: () => void;
}

interface MenuItemType {
  key?: string;
  name?: string;
  label?: string;
  icon?: string | React.ReactElement;
  path?: string;
  roles?: UserRole[];
  children?: MenuItemType[];
}

const getIconComponent = (iconName: string, size = 20) => {
  const icons: Record<string, React.ReactElement> = {
    activity: <TrendingUp size={size} />,
    "arrow-down": <Banknote size={size} />,
    "arrow-right-left": <Landmark size={size} />,
    "arrow-up": <Banknote size={size} />,
    banknote: <Banknote size={size} />,
    "bar-chart": <FileChartLine size={size} />,
    "book-open": <FileChartLine size={size} />,
    building: <Building2 size={size} />,
    business: <BriefcaseBusiness size={size} />,
    chart: <FileChartLine size={size} />,
    database: <Building2 size={size} />,
    dollar: <DollarSign size={size} />,
    "file-text": <FileChartLine size={size} />,
    handcoins: <HandCoins size={size} />,
    help: <HelpCircle size={size} />,
    "help-circle": <HelpCircle size={size} />,
    home: <Home size={size} />,
    info: <HelpCircle size={size} />,
    landmark: <Landmark size={size} />,
    "layout-dashboard": <LayoutDashboard size={size} />,
    message: <MessageSquare size={size} />,
    "message-circle": <MessageSquare size={size} />,
    "message-question": <HelpCircle size={size} />,
    "plus-circle": <DollarSign size={size} />,
    settings: <Settings size={size} />,
    trending: <TrendingUp size={size} />,
    "user-check": <User size={size} />,
    "user-plus": <Users size={size} />,
    users: <Users size={size} />,
  };
  return icons[iconName] || <Home size={20} />;
};

const getMenuTone = (item: MenuItemType): string => {
  const value = `${item.key || ""} ${item.name || ""} ${item.label || ""} ${item.icon || ""}`.toLowerCase();
  if (value.includes("member") || value.includes("user")) return "text-cyan-300";
  if (value.includes("financ") || value.includes("loan")) return "text-blue-300";
  if (value.includes("contribution") || value.includes("cash") || value.includes("dollar")) return "text-emerald-300";
  if (value.includes("treasury") || value.includes("bank")) return "text-amber-300";
  if (value.includes("business")) return "text-orange-300";
  if (value.includes("investment") || value.includes("trending")) return "text-lime-300";
  if (value.includes("team")) return "text-sky-300";
  if (value.includes("report") || value.includes("chart")) return "text-violet-300";
  if (value.includes("communication") || value.includes("message")) return "text-pink-300";
  if (value.includes("support") || value.includes("help")) return "text-teal-300";
  if (value.includes("setting")) return "text-slate-300";
  return "text-emerald-300";
};

const withIconClass = (icon: React.ReactElement<{ className?: string }>, className: string) => {
  const currentClass = icon.props.className || "";
  return cloneElement(icon, {
    className: `${currentClass} ${className}`.trim(),
  });
};

const getDashboardPath = (role: string | null, isSuperAdmin: boolean): string => {
  if (isSuperAdmin) return "/super-admin";
  switch (role) {
    case "admin": return "/admin-dashboard";
    case "cashier": return "/cashier-dashboard";
    case "collector": return "/collector/dashboard";
    case "manager":
    case "accountant":
    case "member": return "/member-dashboard";
    default: return "/welcome";
  }
};

const getDashboardLabel = (role: string | null, isSuperAdmin: boolean): string => {
  if (isSuperAdmin) return "Super Admin";
  switch (role) {
    case "admin": return "Admin Dashboard";
    case "cashier": return "Cashier Dashboard";
    case "collector": return "Collector Dashboard";
    case "manager": return "Dashboard";
    case "accountant": return "Dashboard";
    case "member": return "Dashboard";
    default: return "Dashboard";
  }
};

const Sidebar = ({ isOpen = true, toggleSidebar }: SidebarProps) => {
  const [expanded, setExpanded] = useState<string | null>(null);
  const location = useLocation();
  const { userData, currentMember, logout, isSuperAdmin, user } = useAuth();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close sidebar on mobile ONLY when route actually changes (not when hamburger opens it)
  const prevIsOpenRef = useRef(isOpen);
  useEffect(() => {
    prevIsOpenRef.current = isOpen;
  }, [isOpen]);

  useEffect(() => {
    if (!isMobile || !isOpen) return;
    const wasOpenBefore = prevIsOpenRef.current;
    // If we're still open but pathname changed (navigation), auto-close
    if (wasOpenBefore === isOpen && isOpen) {
      const timer = setTimeout(() => toggleSidebar?.(), 50);
      return () => clearTimeout(timer);
    }
  }, [location.pathname, isMobile]);

  const currentUserRole = user?.role || (isSuperAdmin ? "super_admin" : null);
  const dashboardPath = getDashboardPath(currentUserRole, isSuperAdmin);
  const dashboardLabel = getDashboardLabel(currentUserRole, isSuperAdmin);

  const menuItems = useMemo(() => {
    const filterMenuByRole = (items: MenuItemType[]): MenuItemType[] => {
      if (!currentUserRole) return [];
      return items
        .filter((item) => {
          if (!item.roles) return true;
          if (isSuperAdmin) return true;
          return item.roles.includes(currentUserRole as UserRole);
        })
        .map((item) => ({
          ...item,
          children: item.children ? filterMenuByRole(item.children) : undefined,
        }))
        .filter((item) => !item.children || item.children.length > 0);
    };
    return filterMenuByRole(menuConfig as MenuItemType[]);
  }, [currentUserRole, isSuperAdmin]);

  useEffect(() => {
    const activeParent = menuItems.find((item) =>
      item.children?.some((child) => child.path && location.pathname.startsWith(child.path))
    );
    if (activeParent) {
      setExpanded(activeParent.key || activeParent.label || activeParent.name || null);
    }
  }, [location.pathname, menuItems]);

  const toggleExpand = (key: string) => {
    setExpanded((current) => (current === key ? null : key));
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const getMenuItemName = (item: MenuItemType): string => item.label || item.name || "";
  const getMenuItemIcon = (item: MenuItemType): React.ReactElement => {
    if (typeof item.icon === "string") return getIconComponent(item.icon);
    return item.icon || <Home size={20} />;
  };
  const getMemberId = (): string => userData?.memberId || "";
  const profilePhoto = currentMember?.photoUrl || currentMember?.personal?.photoUrl || userData?.photoURL || "";

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === path;
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  if (!currentUserRole || !userData) {
    return (
      <aside className="flex h-screen w-16 shrink-0 items-center justify-center bg-[#1E3A3A] text-white">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-white" />
      </aside>
    );
  }

  const isSuperAdminUser = currentUserRole === "super_admin";

  return (
    <motion.aside
      layout
      animate={{ width: isOpen ? 240 : (isMobile ? 0 : 72) }}
      transition={{ duration: 0.25, ease: "easeInOut" }}
      className={`
        relative flex h-screen flex-col overflow-hidden
        bg-gradient-to-b from-[#1E3A3A] to-[#0F2A2A] text-white shadow-xl
        ${isMobile && !isOpen ? 'w-0' : ''}
        lg:flex
      `}
    >
      {/* ===== Header ===== */}
      <div className={`flex items-center px-3 py-3 ${isOpen ? "justify-between" : "justify-center"}`}>
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="open-profile"
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.18 }}
              className="flex min-w-0 flex-1 items-center gap-2"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white/10 ring-1 ring-white/10">
                {profilePhoto ? (
                  <img src={profilePhoto} alt={userData.fullName} className="h-full w-full object-cover" />
                ) : isSuperAdminUser ? (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-r from-purple-500 to-purple-600">
                    <Shield size={18} />
                  </div>
                ) : null}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-semibold leading-5">{userData.fullName}</p>
                {getMemberId() && (
                  <p className="truncate text-[10px] leading-4 text-emerald-300">{getMemberId()}</p>
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div key="closed-profile" />
          )}
        </AnimatePresence>

        <button
          type="button"
          onClick={() => toggleSidebar?.()}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-gray-300 transition-colors hover:bg-white/10 hover:text-white"
          aria-label="Toggle sidebar"
        >
          <Menu size={18} />
        </button>
      </div>

      {/* ===== Dashboard link ===== */}
      <div className="px-3 pb-2 pt-1">
        <Link
          to={dashboardPath}
          className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-colors ${
            isActive(dashboardPath) ? "bg-emerald-600 text-white shadow-lg" : "text-gray-300 hover:bg-white/10"
          }`}
        >
          <LayoutDashboard size={18} className={`shrink-0 ${isActive(dashboardPath) ? "text-white" : "text-emerald-300"}`} />
          {isOpen && <span className="truncate text-[13px] font-semibold">{dashboardLabel}</span>}
        </Link>
      </div>

      <div className="mx-3 h-px bg-white/10" />

      {/* ===== Navigation menu ===== */}
      <nav className={`min-h-0 flex-1 overflow-y-auto px-2 py-2 ${!isOpen ? 'scrollbar-hide' : ''}`}>
        <div className="space-y-0.5">
          {menuItems.map((item) => {
            const itemKey = item.key || getMenuItemName(item);
            const itemExpanded = expanded === itemKey;
            const itemName = getMenuItemName(item);
            const hasChildren = Boolean(item.children?.length);

            if (hasChildren) {
              return (
                <div key={itemKey} className="sidebar-menu-group">
                  {/* Parent module button — expand/collapse ONLY, does NOT close sidebar */}
                  <button
                    type="button"
                    onClick={() => toggleExpand(itemKey)}
                    className={`flex w-full items-center justify-between rounded-lg px-3 py-2 transition-colors ${
                      itemExpanded ? "bg-white/10 text-white" : "text-gray-300 hover:bg-white/10"
                    }`}
                    title={!isOpen ? itemName : undefined}
                  >
                    <span className="flex min-w-0 flex-1 items-center gap-3">
                      <span className={`shrink-0 ${getMenuTone(item)}`}>
                        {withIconClass(getMenuItemIcon(item), "shrink-0")}
                      </span>
                      {isOpen && <span className="truncate text-[13px] font-semibold">{itemName}</span>}
                    </span>
                    {isOpen && (
                      <span className="ml-1 shrink-0 text-gray-400">
                        {itemExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                      </span>
                    )}
                  </button>

                  <AnimatePresence initial={false}>
                    {itemExpanded && isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.18 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-1 ml-7 pl-3 border-l border-white/15">
                          <div className="space-y-0.5">
                            {item.children?.map((child) => {
                              const childPath = child.path || "#";
                              const childActive = isActive(childPath);
                              return (
                                <div key={child.key || child.label || child.name}>
                                  <Link
                                    to={childPath}
                                    className={`relative block rounded-md px-3 py-1.5 text-[12px] font-medium leading-5 transition-all duration-200 ${
                                      childActive
                                        ? "bg-emerald-500/20 text-white"
                                        : "text-gray-400 hover:bg-white/5 hover:text-white"
                                    }`}
                                  >
                                    <span
                                      className={`absolute -left-2 top-1/2 h-1 w-1 -translate-y-1/2 rounded-full ${
                                        childActive ? "bg-emerald-300" : "bg-white/30"
                                      }`}
                                    />
                                    <span className="block truncate">{child.label || child.name}</span>
                                  </Link>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            }

            return (
              <div key={itemKey} className="sidebar-menu-group">
                <Link
                  to={item.path || "#"}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-colors ${
                    isActive(item.path || "") ? "bg-emerald-600 text-white shadow-lg" : "text-gray-300 hover:bg-white/10"
                  }`}
                  title={!isOpen ? itemName : undefined}
                >
                  <span className={`shrink-0 ${isActive(item.path || "") ? "text-white" : getMenuTone(item)}`}>
                    {withIconClass(getMenuItemIcon(item), "shrink-0")}
                  </span>
                  {isOpen && <span className="truncate text-[13px] font-semibold">{itemName}</span>}
                </Link>
              </div>
            );
          })}
        </div>
      </nav>

      {/* ===== Footer ===== */}
      <div className="mt-auto border-t border-white/10 bg-[#0F2A2A]/40 px-3 pb-3 pt-2">
        <div className="space-y-0.5">
          <Link
            to="/my-profile"
            className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-colors ${
              isActive("/my-profile") ? "bg-emerald-600 text-white" : "text-gray-300 hover:bg-white/10"
            }`}
          >
            <User size={16} className="shrink-0" />
            {isOpen && <span className="truncate text-[13px] font-semibold">My Profile</span>}
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-red-300 transition-colors hover:bg-red-600/20 hover:text-red-200"
          >
            <LogOut size={16} className="shrink-0" />
            {isOpen && <span className="truncate text-[13px] font-semibold">Logout</span>}
          </button>
        </div>
      </div>
    </motion.aside>
  );
};

export default Sidebar;
