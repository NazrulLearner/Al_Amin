export const investmentMenu = [
  {
    key: "investments",
    label: "Investments",
    icon: "trending-up",
    roles: ["admin", "super_admin"],
    children: [
      { key: "investment_list", label: "All Investments", path: "/investments", icon: "list", roles: ["admin", "super_admin"] },
      { key: "investment_create", label: "New Investment", path: "/investments/create", icon: "plus", roles: ["admin", "super_admin"] },
    ],
  },
];

export default investmentMenu;
