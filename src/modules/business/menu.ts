export const businessMenu = [
  {
    key: "business",
    label: "Business",
    icon: "briefcase",
    roles: ["admin"],
    permissions: ["business.view"],
    children: [
      {
        key: "business_list",
        label: "Business List",
        path: "/business",
        icon: "list",
        roles: ["admin"],
        permissions: ["business.view"],
      },
      {
        key: "business_create",
        label: "Create Business",
        path: "/business/create",
        icon: "plus",
        roles: ["admin"],
        permissions: ["business.create"],
      },
    ],
  },
];

export default businessMenu;
