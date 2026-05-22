import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Home,
  Users,
  Landmark,
  Building2,
  HandCoins,
  Banknote,
  BriefcaseBusiness,
  FileChartLine,
  MessageSquare,
  Settings,
  HelpCircle,
  ChevronDown,
  ChevronRight,
  Menu,
  UserCircle,
  DollarSign,
  LogOut,
  User,
  Shield,
  Globe,
  TrendingUp,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
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

const getIconComponent = (iconName: string, size = 18) => {
  const icons: Record<string, React.ReactElement> = {
    home: <Home size={size} />,
    users: <Users size={size} />,
    landmark: <Landmark size={size} />,
    building: <Building2 size={size} />,
    handcoins: <HandCoins size={size} />,
    banknote: <Banknote size={size} />,
    business: <BriefcaseBusiness size={size} />,
    chart: <FileChartLine size={size} />,
    message: <MessageSquare size={size} />,
    settings: <Settings size={size} />,
    help: <HelpCircle size={size} />,
    dollar: <DollarSign size={size} />,
    trending: <TrendingUp size={size} />,
  };
  return icons[iconName] || <Home size={size} />;
};

export default function Sidebar({}: SidebarProps) {
  const [open, setOpen] = useState(() => {
    const saved = localStorage.getItem("sidebar-open");
    return saved ? JSON.parse(saved) : true;
  });
  const [expanded, setExpanded] = useState<string | null>(null);
  const location = useLocation();
  const { userData, somityInfo, logout, isSuperAdmin, user } = useAuth();

  useEffect(() => {
    localStorage.setItem("sidebar-open", JSON.stringify(open));
  }, [open]);

  const toggleExpand = (key: string) => {
    setExpanded(expanded === key ? null : key);
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const currentUserRole = user?.role || (isSuperAdmin ? 'super_admin' : null);

  // Filter menu based on user role
  const filterMenuByRole = (items: MenuItemType[]): MenuItemType[] => {
    if (!currentUserRole) return [];
    
    return items
      .filter(item => {
        if (!item.roles) return true;
        if (isSuperAdmin) return true;
        return item.roles.includes(currentUserRole);
      })
      .map(item => ({
        ...item,
        children: item.children ? filterMenuByRole(item.children) : undefined,
      }))
      .filter(item => {
        if (item.children && item.children.length === 0) return false;
        return true;
      });
  };

  const menuItems = filterMenuByRole(menuConfig as MenuItemType[]);

  const getMenuItemName = (item: MenuItemType): string => {
    return item.label || item.name || "";
  };

  const getMenuItemIcon = (item: MenuItemType): React.ReactElement => {
    if (typeof item.icon === 'string') {
      return getIconComponent(item.icon);
    }
    return item.icon || <Home size={18} />;
  };

  const getRoleDisplayName = (role: UserRole | null | string): string => {
    switch(role) {
      case 'super_admin': return 'Super Admin';
      case 'admin': return 'Administrator';
      case 'cashier': return 'Cashier';
      case 'collector': return 'Collector';
      case 'member': return 'Member';
      default: return 'User';
    }
  };

  const getMemberId = (): string => {
    if (!userData) return '';
    return userData.memberId || '';
  };

  if (!currentUserRole || !userData) {
    return (
      <div className="bg-[#1E3A3A] text-white h-screen p-3 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }

  const isSuperAdminUser = currentUserRole === 'super_admin';

  return (
    <motion.div
      layout
      animate={{ width: open ? 240 : 65 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="bg-[#1E3A3A] text-white h-screen p-3 flex flex-col shadow-lg relative overflow-hidden"
    >
      {/* Top Section */}
      <div className="flex items-center justify-between mb-4 min-h-[48px]">
        <AnimatePresence mode="wait">
          {open ? (
            <motion.div
              key="open-profile"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-3 flex-1"
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                isSuperAdminUser ? 'bg-purple-500' : 'bg-gray-500'
              }`}>
                {isSuperAdminUser ? (
                  <Shield size={24} className="text-white" />
                ) : (
                  <UserCircle size={24} className="text-white" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm leading-none truncate">
                  {userData?.fullName}
                </p>
                <p className="text-xs text-gray-300 leading-none mt-1 truncate">
                  {getRoleDisplayName(currentUserRole)}
                  {!isSuperAdminUser && getMemberId() && ` • ID: ${getMemberId()}`}
                </p>
                {!isSuperAdminUser && somityInfo && (
                  <p className="text-xs text-emerald-300 leading-none mt-1 truncate">
                    {somityInfo.name}
                  </p>
                )}
                {isSuperAdminUser && (
                  <p className="text-xs text-purple-300 leading-none mt-1 flex items-center">
                    <Globe size={10} className="mr-1" />
                    Global Access
                  </p>
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="closed-hamburger"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex-1"
            />
          )}
        </AnimatePresence>

        <motion.div layout className="flex items-center justify-center">
          <Menu
            className="cursor-pointer text-gray-200 hover:text-white shrink-0"
            size={20}
            onClick={() => setOpen(!open)}
          />
        </motion.div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700">
        {menuItems.map((item) => (
          <div key={item.key || getMenuItemName(item)}>
            {item.children && item.children.length > 0 ? (
              <>
                <motion.button
                  layout
                  onClick={() => toggleExpand(item.key || getMenuItemName(item))}
                  className={`flex items-center justify-between w-full p-2 rounded-md hover:bg-[#2E5A5A] transition-colors ${
                    expanded === (item.key || getMenuItemName(item)) ? "bg-[#2E5A5A]" : ""
                  }`}
                  transition={{ duration: 0.2 }}
                  title={open ? getMenuItemName(item) : undefined}
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <span className="shrink-0">{getMenuItemIcon(item)}</span>
                    <AnimatePresence mode="wait">
                      {open && (
                        <motion.span
                          initial={{ opacity: 0, width: 0 }}
                          animate={{ opacity: 1, width: "auto" }}
                          exit={{ opacity: 0, width: 0 }}
                          transition={{ duration: 0.2 }}
                          className="truncate text-sm"
                        >
                          {getMenuItemName(item)}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </div>
                  <AnimatePresence mode="wait">
                    {open && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.2 }}
                      >
                        {expanded === (item.key || getMenuItemName(item)) ? (
                          <ChevronDown size={16} />
                        ) : (
                          <ChevronRight size={16} />
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.button>

                <AnimatePresence>
                  {expanded === (item.key || getMenuItemName(item)) && open && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="ml-6 mt-1 space-y-1 overflow-hidden"
                    >
                      {item.children.map((child) => (
                        <motion.div
                          key={child.key || child.label}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <Link
                            to={child.path || "#"}
                            className={`block p-2 rounded-md text-sm hover:bg-[#2E5A5A] transition-colors truncate ${
                              location.pathname === child.path ? "bg-[#2E5A5A]" : ""
                            }`}
                            title={child.label || child.name}
                          >
                            {child.label || child.name}
                          </Link>
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </>
            ) : (
              <motion.div layout transition={{ duration: 0.2 }}>
                <Link
                  to={item.path || "#"}
                  className={`flex items-center gap-2 p-2 rounded-md hover:bg-[#2E5A5A] transition-colors ${
                    location.pathname === item.path ? "bg-[#2E5A5A]" : ""
                  }`}
                  title={open ? getMenuItemName(item) : undefined}
                >
                  <span className="shrink-0">{getMenuItemIcon(item)}</span>
                  <AnimatePresence mode="wait">
                    {open && (
                      <motion.span
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: "auto" }}
                        exit={{ opacity: 0, width: 0 }}
                        transition={{ duration: 0.2 }}
                        className="truncate text-sm"
                      >
                        {getMenuItemName(item)}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </Link>
              </motion.div>
            )}
          </div>
        ))}
      </nav>

      {/* Bottom Section */}
      <div className="border-t border-[#2E5A5A] pt-3 space-y-2">
        <motion.div layout transition={{ duration: 0.2 }}>
          <Link
            to={isSuperAdminUser ? "/super-admin" : "/my-profile"}
            className={`flex items-center gap-2 p-2 rounded-md hover:bg-[#2E5A5A] transition-colors ${
              location.pathname === (isSuperAdminUser ? "/super-admin" : "/my-profile") ? "bg-[#2E5A5A]" : ""
            }`}
          >
            {isSuperAdminUser ? <Shield size={18} /> : <User size={18} />}
            <AnimatePresence mode="wait">
              {open && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.2 }}
                  className="truncate"
                >
                  {isSuperAdminUser ? "Super Admin Panel" : "My Profile"}
                </motion.span>
              )}
            </AnimatePresence>
          </Link>
        </motion.div>

        <motion.button
          layout
          onClick={handleLogout}
          className="flex items-center gap-2 w-full p-2 rounded-md hover:bg-red-600 transition-colors text-red-200 hover:text-white"
          transition={{ duration: 0.2 }}
        >
          <LogOut size={18} />
          <AnimatePresence mode="wait">
            {open && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2 }}
                className="truncate"
              >
                Logout
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </div>
    </motion.div>
  );
}