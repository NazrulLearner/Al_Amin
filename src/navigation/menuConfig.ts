import { teamsMenu } from "../modules/teams/menu";
import { membersMenu } from "../modules/members/menu";
import { financingMenu } from "../modules/financing/menu";
import { treasuryMenu } from "../modules/treasury/menu";
import { reportsMenu } from "../modules/reports/menu";
import { settingsMenu } from "../modules/settings/menu";
import { usersMenu } from "../modules/users/menu";
import { superAdminMenu } from "../modules/super-admin/menu";
import { contributionsMenu } from "../modules/contributions/menu";
import { businessMenu } from "../modules/business/menu";
import { cashierMenu } from "../modules/cashier/menu";
import { communicationMenu } from "../modules/communication/menu";
import { supportMenu } from "../modules/support/menu";
import { investmentMenu } from "../modules/Investments/menu";

// Public এবং Auth এর menu নেই (কারণ তারা sidebar এ দেখাবে না)

export const menuConfig = [
  ...teamsMenu,
  ...membersMenu,
  ...financingMenu,
  ...treasuryMenu,
  ...reportsMenu,
  ...settingsMenu,
  ...usersMenu,
  ...superAdminMenu,
  ...contributionsMenu,
  ...businessMenu,
  ...cashierMenu,
  ...communicationMenu,
  ...supportMenu,
  ...investmentMenu,
];