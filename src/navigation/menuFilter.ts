export interface MenuItem {
  label: string;
  path: string;
  roles?: string[];
  icon?: any;
  children?: MenuItem[];
}

export const filterMenuByRole = (menu: MenuItem[], role: string): MenuItem[] => {
  return menu.filter((item) =>
    !item.roles || item.roles.includes(role)
  );
};