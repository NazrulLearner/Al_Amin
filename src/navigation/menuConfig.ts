import { teamsMenu } from "../modules/teams/menu";
import { membersMenu } from "../modules/members/menu";
import { financingMenu } from "../modules/financing/menu";
import { treasuryMenu } from "../modules/treasury/menu";
import { contributionsMenu } from "../modules/contributions/menu";
import { businessMenu } from "../modules/business/menu";
import { investmentMenu } from "../modules/Investments/menu";
import { cashierMenu } from "../modules/cashier/menu";
import { reportsMenu } from "../modules/reports/menu";
import { communicationMenu } from "../modules/communication/menu";
import { supportMenu } from "../modules/support/menu";
import { settingsMenu } from "../modules/settings/menu";
import { usersMenu } from "../modules/users/menu";
import { superAdminMenu } from "../modules/super-admin/menu";
import { assetsMenu } from "../modules/assets/menu";

// Public এবং Auth এর menu নেই (কারণ তারা sidebar এ দেখাবে না)

export const menuConfig = [
  // Dashboard আলাদা ভাবে handle করা হবে Sidebar এ
  
  // Core Modules (সবার আগে)
  ...membersMenu,
  ...financingMenu,
  ...contributionsMenu,
  ...treasuryMenu,
  ...assetsMenu,
  
  // Financial Modules
  ...businessMenu,
  ...investmentMenu,
  ...cashierMenu,
  
  // Management Modules
  ...teamsMenu,
  ...reportsMenu,
  ...communicationMenu,
  
  // Support & Settings (সবার শেষে)
  ...supportMenu,
  ...settingsMenu,
  ...usersMenu,
  ...superAdminMenu,
];