export const financingMenu = [
  {
    key: "financing",
    label: "Financing",
    icon: "handcoins",
    roles: ["admin", "cashier", "member", "collector", "super_admin"],  // সবাই দেখবে
    children: [
      {
        key: "financing_dashboard",
        label: "Dashboard",
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
        label: "All Loans",
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
        key: "receive_payment",
        label: "Receive Payment",
        path: "/financing/payments",
        icon: "dollar-sign",
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