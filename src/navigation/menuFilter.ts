export interface MenuItem {
  key: string;
  label: string;
  icon?: string;
  path?: string;
  roles?: string[];
  permissions?: string[];
  children?: MenuItem[];
}

export const filterMenuByRole = (menu: MenuItem[], role: string): MenuItem[] => {
  return menu
    .filter((item) => !item.roles || item.roles.includes(role))
    .map((item) => ({
      ...item,
      children: item.children ? filterMenuByRole(item.children, role) : undefined,
    }));
};