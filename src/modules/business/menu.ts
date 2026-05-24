export const businessMenu = [
  {
    key: "business",
    label: "Business",
    icon: "briefcase",
    roles: ["admin", "super_admin"],
    children: [
      {
        key: "business_list",
        label: "Business List",
        path: "/business",  // Full path with slash (this is correct for navigation)
        icon: "list",
        roles: ["admin", "super_admin"],
      },
      {
        key: "business_create",
        label: "Create Business",
        path: "/business/create",
        icon: "plus",
        roles: ["admin", "super_admin"],
      },
    ],
  },
];

export default businessMenu;