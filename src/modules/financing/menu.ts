export const financingMenu = [
  {
    key: "financing",
    label: "Financing",
    icon: "handcoins",
    roles: ["admin", "cashier", "member", "collector", "super_admin"],  // সবাই দেখবে
    children: [
      {
        key: "financing_dashboard",
        label: "Overview",
        path: "/financing",
        icon: "layout-dashboard",
        roles: ["admin", "cashier", "member", "collector", "super_admin"],
      },
      {
        key: "apply_financing",
        label: "Apply for Loan",
        path: "/financing/create",
        icon: "file-plus",
        roles: ["admin", "cashier", "member", "collector", "super_admin"],  // সবাই
      },
      {
        key: "my_financing",
        label: "My Loans",
        path: "/financing/my-loans",
        icon: "user",
        roles: ["member", "collector"],  // শুধু member আর collector
      },
      // বাকি গুলো collector দেখবে না
      {
        key: "all_financing",
        label: "Loans List",
        path: "/financing/list",
        icon: "list",
        roles: ["admin", "cashier", "super_admin"],
      },
      {
        key: "pending_applications",
        label: "Pending Applications",
        path: "/financing/applications/pending",
        icon: "clock",
        roles: ["admin", "cashier", "super_admin"],
      },
      {
        key: "active_loans",
        label: "Active Loans",
        path: "/financing/active",
        icon: "trending-up",
        roles: ["admin", "cashier", "super_admin"], 
      },
      {
        key: "completed_loans",
        label: "Completed Loans",
        path: "/financing/completed",
        icon: "check-circle",
        roles: ["admin", "cashier", "super_admin"], 
      },
      {
        key: "loan_history",
        label: "Loan History",
        path: "/financing/history",
        icon: "history",
        roles: ["admin", "cashier", "super_admin"], 
      },
      {
        key: "financing_reports",
        label: "Reports",
        path: "/financing/reports",
        icon: "file-chart",
        roles: ["admin", "super_admin"],
      },
    ],
  },
];