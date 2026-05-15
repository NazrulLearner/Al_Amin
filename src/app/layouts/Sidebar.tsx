// src/components/Sidebar.tsx
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
  CheckSquare,
  TrendingUp,
  CreditCard,
  FileText
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../providers/AuthProvider";
import type { UserRole } from "../../types";

interface SidebarProps {
  isOpen?: boolean;
  toggleSidebar?: () => void;
}

// Type definitions for menu items
interface MenuItemBase {
  name: string;
  icon: React.ReactElement;
  roles: UserRole[];
}

interface MenuItemWithPath extends MenuItemBase {
  path: string;
  children?: never;
}

interface MenuItemWithChildren extends MenuItemBase {
  path?: never;
  children: MenuChildItem[];
}

type MenuItem = MenuItemWithPath | MenuItemWithChildren;

interface MenuChildItem {
  name: string;
  path: string;
  roles: UserRole[];
}

export default function Sidebar({}: SidebarProps) {
  const [open, setOpen] = useState(() => {
    const saved = localStorage.getItem("sidebar-open");
    return saved ? JSON.parse(saved) : true;
  });
  const [expanded, setExpanded] = useState<string | null>(null);
  const location = useLocation();
  const { userData, somityInfo, logout, isSuperAdmin } = useAuth();

  useEffect(() => {
    localStorage.setItem("sidebar-open", JSON.stringify(open));
  }, [open]);

  const toggleExpand = (name: string) => {
    setExpanded(expanded === name ? null : name);
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Get current user role from active somity or super admin
  const getUserRole = (): UserRole | null => {
    // Super admin check
    if (isSuperAdmin) {
      return 'super_admin';
    }
    
    if (!userData || !somityInfo) return null;
    return userData.role || null;
  };

  // Get member ID for current somity
  const getMemberId = (): string => {
    if (!userData || !somityInfo) return '';
    return userData.memberId || '';
  };

  const currentUserRole = getUserRole();
  const currentMemberId = getMemberId();

  // Role-based menu configuration
  const getMenuItems = (): MenuItem[] => {
    // SUPER ADMIN MENU
    if (currentUserRole === 'super_admin') {
      return [
        { 
          name: "Dashboard", 
          icon: <Home size={18} />, 
          path: "/super-admin",
          roles: ['super_admin'] as UserRole[]
        },
        {
           name: "Requests", 
          icon: <CheckSquare size={18} />, 
          path: "/super-admin/requests",
          roles: ['super_admin'] as UserRole[]
        },
        {
          name: "Users",
          icon: <Users size={18} />,
          path: "/super-admin/users",
          roles: ['super_admin'] as UserRole[]
        },
        {
          name: "Subscriptions",
          icon: <CreditCard size={18} />,
          path: "/super-admin/subscriptions",
          roles: ['super_admin'] as UserRole[]
        },
        { 
          name: "Usage", 
          icon: <TrendingUp size={18} />, 
          path: "/super-admin/usage",
          roles: ['super_admin'] as UserRole[]
        },
        { 
          name: "Logs", 
          icon: <FileText size={18} />, 
          path: "/super-admin/logs",
          roles: ['super_admin'] as UserRole[]
        },
        { 
          name: "Settings", 
          icon: <Settings size={18} />, 
          path: "/super-admin/settings",
          roles: ['super_admin'] as UserRole[]
        },
        { 
          name: "Support", 
          icon: <HelpCircle size={18} />, 
          path: "/support/index",
          roles: ['super_admin'] as UserRole[]
        },
      ];
    }

    if (!currentUserRole) return [];

    // REGULAR USER MENU (Admin, Cashier, Member)
    const baseMenu: MenuItem[] = [
      { 
        name: "Dashboard", 
        icon: <Home size={18} />, 
        path: currentUserRole === 'admin' ? '/admin-dashboard' : 
              currentUserRole === 'cashier' ? '/cashier-dashboard': '/member-dashboard',
        roles: ['admin', 'cashier', 'member'] as UserRole[]
      },
    ];

    // Teams - Admin & Cashier only
    if (['admin', 'cashier'].includes(currentUserRole)) {
      baseMenu.push({
        name: "Teams",
        icon: <Building2 size={18} />,
        children: [
          { name: "Team List", path: "/teams/index", roles: ['admin', 'cashier'] as UserRole[] },
          ...(currentUserRole === 'admin' ? [
            { name: "Create Team", path: "/teams/create", roles: ['admin'] as UserRole[] }
          ] : []),
          { name: "Team History", path: "/teams/teamHistory", roles: ['admin', 'cashier'] as UserRole[] },
          { name: "Team Performance", path: "/teams/performance", roles: ['admin', 'cashier'] as UserRole[] },
        ],
        roles: ['admin', 'cashier'] as UserRole[]
      });
    }

    // Members - All roles
    baseMenu.push({
      name: "Members",
      icon: <Users size={18} />,
      children: [
        { name: "Member List", path: "/members/index", roles: ['admin', 'cashier', 'member'] as UserRole[] },
        ...(['admin', 'cashier'].includes(currentUserRole) ? [
          { name: "Add Member", path: "/members/AddMember", roles: ['admin', 'cashier'] as UserRole[] }
        ] : [])
      ],
      roles: ['admin', 'cashier', 'member'] as UserRole[]
    });

    // Users - Admin only
    if (currentUserRole === 'admin') {
      baseMenu.push({
        name: "Users",
        icon: <FileChartLine size={18} />,
        children: [
          { name: "Users List", path: "/users/index", roles: ['admin'] as UserRole[] },
          { name: "Add User", path: "/users/AddUser", roles: ['admin'] as UserRole[] },
          { name: "Create Member Account", path: "/users/CreateMemberAccount", roles: ['admin'] as UserRole[] },
          { name: "User Profile", path: "/users/Profile", roles: ['admin'] as UserRole[] },
        ],
        roles: ['admin'] as UserRole[]
      });
    }

    // Contributions - Admin & Cashier only
    if (['admin', 'cashier'].includes(currentUserRole)) {
      baseMenu.push({
        name: "Contrib.",
        icon: <DollarSign size={18} />,
        children: [
          { name: "Dashboard", path: "/fees/index", roles: ['admin', 'cashier'] as UserRole[] },
          { name: "Entry", path: "/fees/entry", roles: ['admin', 'cashier'] as UserRole[] },
          { name: "History", path: "/fees/history", roles: ['admin', 'cashier'] as UserRole[] },
          { name: "Pending", path: "/fees/pending", roles: ['admin', 'cashier'] as UserRole[] },
          { name: "Reports", path: "/fees/reports", roles: ['admin', 'cashier'] as UserRole[] },
          { name: "Status", path: "/fees/collection-status", roles: ['admin', 'cashier'] as UserRole[] }
        ],
        roles: ['admin', 'cashier'] as UserRole[]
      });
    }

    // Financing - Admin & Cashier
    if (['admin', 'cashier'].includes(currentUserRole)) {
      baseMenu.push({
        name: "Financing",
        icon: <Landmark size={18} />,
        children: [
         { name: "Dashboard", path: "/loans/index", roles: ['admin', 'cashier'] as UserRole[] },
         { name: "Apply", path: "/loans/add", roles: ['admin', 'cashier', 'member'] as UserRole[] },
         { name: "Pending", path: "/loans/pending", roles: ['admin'] as UserRole[] },
         { name: "Active", path: "/loans/ActiveLoan", roles: ['admin', 'cashier'] as UserRole[] },
         { name: "List", path: "/loans/list", roles: ['admin', 'cashier', 'member'] as UserRole[] },
         { name: "History", path: "/loans/history", roles: ['admin', 'cashier'] as UserRole[] },
         { name: "Reports", path: "/loans/reports", roles: ['admin'] as UserRole[] },
        ],
        roles: ['admin', 'cashier'] as UserRole[]
      });
    }

    // Cashier - Admin & Cashier only
    if (['admin', 'cashier'].includes(currentUserRole)) {
      baseMenu.push({
        name: "Cashier",
        icon: <HandCoins size={18} />,
        children: [
          { name: "Dashboard", path: "/cashier/index", roles: ['admin', 'cashier'] as UserRole[] },
          { name: "Cash In", path: "/cashier/cashIn", roles: ['admin', 'cashier'] as UserRole[] },
          { name: "Cash Out", path: "/cashier/cashOut", roles: ['admin', 'cashier'] as UserRole[] },
          { name: "Transfer", path: "/cashier/transfer", roles: ['admin', 'cashier'] as UserRole[] },
          { name: "Ledger", path: "/cashier/ledger", roles: ['admin', 'cashier'] as UserRole[] },
          { name: "Report", path: "/cashier/report", roles: ['admin', 'cashier'] as UserRole[] },
        ],
        roles: ['admin', 'cashier'] as UserRole[]
      });
    }

    // Treasury - Admin only
    if (currentUserRole === 'admin') {
      baseMenu.push({
        name: "Treasury",
        icon: <Banknote size={18} />,
        children: [
          { name: "Dashboard", path: "/bank/index", roles: ['admin'] as UserRole[] },
          { name: "Accounts", path: "/bank/addaccount", roles: ['admin'] as UserRole[] },
          { name: "Cash Mgmt", path: "/bank/transactions", roles: ['admin'] as UserRole[] },
          { name: "Transfer", path: "/bank/transfer", roles: ['admin'] as UserRole[] },
          { name: "Ledger", path: "/bank/ledger", roles: ['admin'] as UserRole[] },
          { name: "History", path: "/bank/history", roles: ['admin'] as UserRole[] },
        ],
        roles: ['admin'] as UserRole[]
      });
    }

    // Business - Admin only
    if (currentUserRole === 'admin') {
      baseMenu.push({
        name: "Business",
        icon: <BriefcaseBusiness size={18} />,
        children: [
          { name: "Dashboard", path: "/business/index", roles: ['admin'] as UserRole[] },
          { name: "Add Business", path: "/business/addbusiness", roles: ['admin'] as UserRole[] },
          { name: "Profit Report", path: "/business/profitreport", roles: ['admin'] as UserRole[] },
          { name: "ROI Tracking", path: "/business/roitracking", roles: ['admin'] as UserRole[] },
          { name: "Ledger", path: "/business/ledger", roles: ['admin'] as UserRole[] },
          { name: "History", path: "/business/history", roles: ['admin'] as UserRole[] },
        ],
        roles: ['admin'] as UserRole[]
      });
    }

    // Reports - Admin & Cashier only
    if (['admin', 'cashier'].includes(currentUserRole)) {
      baseMenu.push({
        name: "Reports",
        icon: <FileChartLine size={18} />,
        children: [
          { name: "Overview", path: "/reports/index", roles: ['admin', 'cashier'] as UserRole[] },
          { name: "Members", path: "/reports/memberReport", roles: ['admin', 'cashier'] as UserRole[] },
          { name: "Financing", path: "/reports/loanReport", roles: ['admin', 'cashier'] as UserRole[] },
          { name: "Treasury", path: "/reports/financeReport", roles: ['admin', 'cashier'] as UserRole[] },
          ...(currentUserRole === 'admin' ? [
            { name: "Export Data", path: "/reports/exportData", roles: ['admin'] as UserRole[] }
          ] : [])
        ],
        roles: ['admin', 'cashier'] as UserRole[]
      });
    }

    // Communication - All roles
    baseMenu.push({
      name: "Communication",
      icon: <MessageSquare size={18} />,
      children: [
        { name: "Dashboard", path: "/communication/index", roles: ['admin', 'cashier', 'member'] as UserRole[] },
        { name: "Chat", path: "/communication/chat", roles: ['admin', 'cashier', 'member'] as UserRole[] },
        { name: "Committee", path: "/communication/committeemsgs", roles: ['admin', 'cashier', 'member'] as UserRole[] },
        { name: "Notices", path: "/communication/notices", roles: ['admin', 'cashier', 'member'] as UserRole[] },
      ],
      roles: ['admin', 'cashier', 'member'] as UserRole[]
    });

    // Settings
    baseMenu.push({
      name: "Settings",
      icon: <Settings size={18} />,
      children: [
        ...(currentUserRole === 'admin' ? [
          { name: "General", path: "/settings/index", roles: ['admin'] as UserRole[] },
          { name: "Roles", path: "/settings/roles", roles: ['admin'] as UserRole[] },
          { name: "System", path: "/settings/system", roles: ['admin'] as UserRole[] },
        ] : []),
        { name: "Account", path: "/settings/account", roles: ['admin', 'cashier', 'member'] as UserRole[] },
        { name: "Notifications", path: "/settings/notifications", roles: ['admin', 'cashier', 'member'] as UserRole[] },
      ],
      roles: ['admin', 'cashier', 'member'] as UserRole[]
    });

    // Support - All roles
    baseMenu.push({
      name: "Support",
      icon: <HelpCircle size={18} />,
      children: [
        { name: "Home", path: "/support/index", roles: ['admin', 'cashier', 'member', 'collector'] as UserRole[] },
        { name: "FAQ", path: "/support/faq", roles: ['admin', 'cashier', 'member', 'collector'] as UserRole[] },
        { name: "About", path: "/support/about", roles: ['admin', 'cashier', 'member', 'collector'] as UserRole[] },
      ],
      roles: ['admin', 'cashier', 'member', 'collector'] as UserRole[]
    });

    // Collector Menu - Collectors only
    if (currentUserRole === 'collector') {
      baseMenu.push({
        name: "Collections",
        icon: <HandCoins size={18} />,
        children: [
          { name: "Dashboard", path: "/collector/dashboard", roles: ['collector'] as UserRole[] },
          { name: "History", path: "/collector/history", roles: ['collector'] as UserRole[] },
          { name: "Performance", path: "/collector/performance", roles: ['collector'] as UserRole[] },
          { name: "Pending", path: "/collector/pending", roles: ['collector'] as UserRole[] },
        ],
        roles: ['collector'] as UserRole[]
      });
    }

    return baseMenu;
  };

  const menu = getMenuItems();

  // Filter menu items based on user role
  const filteredMenu = menu.filter(item => {
    if (!currentUserRole) return false;
    return item.roles.includes(currentUserRole);
  });

  // Filter children based on user role
  const filterChildren = (children: MenuChildItem[]) => {
    if (!currentUserRole) return [];
    return children.filter(child => child.roles.includes(currentUserRole));
  };

  // Check if menu item has children (type guard)
  const hasChildren = (item: MenuItem): item is MenuItemWithChildren => {
    return 'children' in item && item.children !== undefined;
  };

  // Get role display name
  const getRoleDisplayName = (role: UserRole | null): string => {
    switch(role) {
      case 'super_admin': return 'Super Admin';
      case 'admin': return 'Administrator';
      case 'cashier': return 'Cashier';
      case 'collector': return 'Collector';
      case 'member': return 'Member';
      default: return 'User';
    }
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
                  {!isSuperAdminUser && currentMemberId && ` • ID: ${currentMemberId}`}
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
        {filteredMenu.map((item) => (
          <div key={item.name}>
            {hasChildren(item) ? (
              <>
                <motion.button
                  layout
                  onClick={() => toggleExpand(item.name)}
                  className={`flex items-center justify-between w-full p-2 rounded-md hover:bg-[#2E5A5A] transition-colors ${
                    expanded === item.name ? "bg-[#2E5A5A]" : ""
                  }`}
                  transition={{ duration: 0.2 }}
                  title={open ? item.name : undefined}
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <span className="shrink-0">{item.icon}</span>
                    <AnimatePresence mode="wait">
                      {open && (
                        <motion.span
                          initial={{ opacity: 0, width: 0 }}
                          animate={{ opacity: 1, width: "auto" }}
                          exit={{ opacity: 0, width: 0 }}
                          transition={{ duration: 0.2 }}
                          className="truncate text-sm"
                        >
                          {item.name}
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
                        {expanded === item.name ? (
                          <ChevronDown size={16} />
                        ) : (
                          <ChevronRight size={16} />
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.button>

                <AnimatePresence>
                  {expanded === item.name && open && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="ml-6 mt-1 space-y-1 overflow-hidden"
                    >
                      {filterChildren(item.children).map((child) => (
                        <motion.div
                          key={child.name}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <Link
                            to={child.path}
                          className={`block p-2 rounded-md text-sm hover:bg-[#2E5A5A] transition-colors truncate ${
                              location.pathname === child.path
                                ? "bg-[#2E5A5A]"
                                : ""
                            }`}
                            title={child.name}
                          >
                            {child.name}
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
                  to={item.path || '#'}
                  className={`flex items-center gap-2 p-2 rounded-md hover:bg-[#2E5A5A] transition-colors ${
                    location.pathname === item.path ? "bg-[#2E5A5A]" : ""
                  }`}
                  title={open ? item.name : undefined}
                >
                  <span className="shrink-0">{item.icon}</span>
                  <AnimatePresence mode="wait">
                    {open && (
                      <motion.span
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: "auto" }}
                        exit={{ opacity: 0, width: 0 }}
                        transition={{ duration: 0.2 }}
                        className="truncate text-sm"
                      >
                        {item.name}
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
