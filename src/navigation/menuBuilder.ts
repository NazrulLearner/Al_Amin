import type { MenuItem } from "./menuFilter";

export const buildMenu = (menu: MenuItem[], role: string): MenuItem[] => {
  return menu.filter((item) =>
    !item.roles || item.roles.includes(role)
  );
};