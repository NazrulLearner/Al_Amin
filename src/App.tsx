import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./app/providers/AuthProvider";
import { SomitySettingsProvider } from './app/providers/SomitySettingsProvider';

// 🔹 Layout
import DashboardLayout from "./app/layouts/DashboardLayout";

// 🔹 Welcome Page
import Welcome from "./modules/public/pages/WelcomePage";

// 🔹 Auth Pages
import Login from "./modules/auth/pages/Login";
import ForgotPassword from "./modules/auth/pages/ForgotPassword";
import CreateAdmin from "./modules/auth/pages/CreateAdmin";

// 🔹 Dashboard - Role Based
import AdminDashboard from "./modules/dashboards/pages/AdminDashboard";
import CashierDashboard from "./modules/dashboards/pages/CashierDashboard";
import MemberDashboard from "./modules/dashboards/pages/MemberDashboard";
import CollectorDashboard from "./modules/dashboards/pages/CollectorDashboard";

// 🔹 Super Admin Pages
import SuperAdminDashboard from './modules/super-admin/pages/Dashboard';
import FirestoreInspector from './modules/super-admin/pages/FirestoreInspector';
import Requests from './modules/super-admin/pages/Requests';
import UsageTracking from './modules/super-admin/pages/UsageTracking';
import Logs from './modules/super-admin/pages/Logs';
import Settings from './modules/super-admin/pages/settings';

// 🔹 Teams
import TeamList from "./modules/teams/pages/index";
import CreateTeam from "./modules/teams/pages/create";
import TeamHistory from "./modules/teams/pages/teamHistory";
import TeamPerformance from "./modules/teams/pages/performance";

// 🔹 Members
import MemberList from "./modules/members/pages/MembersPage";
import AddMember from "./modules/members/pages/AddMember";
import MemberProfile from "./modules/members/pages/MemberProfilePage";

// 🔹 My Profile
import MyProfile from "./modules/members/pages/my-profile";

// 🔹 Users
import UserList from "./modules/users/pages";
import AddUser from "./modules/users/pages/AddUser";
import UserProfile from "./modules/users/pages/UserProfile";
import CreateMemberAccount from "./modules/users/pages/CreateMemberAccount";

// 🔹 Fees Management
import FeesDashboard from "./modules/contributions/pages";
import FeeEntry from "./modules/contributions/pages/ContributionEntry";
import FeeHistory from "./modules/contributions/pages/ContributionHistory";
import FeeReports from "./modules/contributions/pages/ContributionReports";
import PendingFees from "./modules/contributions/pages/PendingContribution";
import Receipt from "./modules/contributions/pages/Receipt";
import CollectionStatusReport from './modules/contributions/pages/CollectionStatusReport';

// 🔹 Loans
import LoansDashboard from "./modules/financing/pages/FinancingDashboardPage";
import LoanList from "./modules/financing/pages/FinancingListPage";
import AddLoan from "./modules/financing/pages/CreateFinancingPage";
import ActiveLoan from "./modules/financing/pages/ActiveFinancingPage";
import LoanHistory from "./modules/financing/pages/FinancingHistoryPage";
import LoanReport from "./modules/financing/pages/FinancingReportPage";
import LoanApplicationPage from "./modules/financing/pages/PendingFinancingApplicationsPage";

// 🔹 Cashier
import CashierHome from "./modules/cashier/pages/index";
import CashIn from "./modules/cashier/pages/cashIn";
import CashOut from "./modules/cashier/pages/cashOut";
import Transfer from "./modules/cashier/pages/transfer";
import Ledger from "./modules/cashier/pages/ledger";
import CashierReport from "./modules/cashier/pages/report";

// 🔹 Bank
import BankDashboard from "./modules/treasury/pages";
import AddBank from "./modules/treasury/pages/bankAccounts";
import Transactions from "./modules/treasury/pages/cashManagement";
import FundTransfer from "./modules/treasury/pages/FundTransfer";
import BankLedger from "./modules/treasury/pages/bankLedger";
import BankHistory from "./modules/treasury/pages/TransactionHistory";

// 🔹 Business
import BusinessDashboard from "./modules/business/pages";
import AddBusiness from "./modules/business/pages/addbusiness";
import ProfitReport from "./modules/business/pages/profitreport";
import ROITracking from "./modules/business/pages/roitracking";
import BusinessLedger from "./modules/business/pages/ledger";
import BusinessHistory from "./modules/business/pages/history";

// 🔹 Reports
import ReportsHome from "./modules/reports/pages";
import MemberReport from "./modules/reports/pages/memberReport";
import LoanReports from "./modules/reports/pages/loanReports";
import FinanceReport from "./modules/reports/pages/financeReport";
import ExportData from "./modules/reports/pages/exportData";

// 🔹 Communication
import CommunicationDashboard from "./modules/communication/pages";
import Chat from "./modules/communication/pages/chat";
import CommitteeMsgs from "./modules/communication/pages/committeemsgs";
import Notices from "./modules/communication/pages/notices";

// 🔹 Settings
import SettingsHome from "./modules/settings/pages";
import AccountSettings from "./modules/settings/pages/account";
import RolesPermissions from "./modules/settings/pages/roles";
import SystemSettings from "./modules/settings/pages/system";
import Notifications from "./modules/settings/pages/notifications";

// 🔹 Support
import SupportHome from "./modules/support/pages";
import FAQ from "./modules/support/pages/faq";
import About from "./modules/support/pages/about";

// 🔹 Components
import ProtectedRoute from "./app/routes/ProtectedRoute";
import DashboardRedirect from "./app/routes/DashboardRedirect";
import Users from "./modules/super-admin/pages/Users";
import { Toaster } from "sonner";
import PendingApplications from "./modules/financing/pages/PendingFinancingApplicationsPage";
import LoanApplicationDetails from "./modules/financing/pages/FinancingApplicationDetailsPage";
import LoanDetails from "./modules/financing/pages/FinancingDetailsPage";

export default function App() {
  return (
    <AuthProvider>
      <SomitySettingsProvider>
      <Router>
         <Toaster position="top-right" richColors />  {/* 👈 এটা যোগ করো */}
        <Routes>
          {/* 🔓 Public Routes */}
          <Route path="/" element={<Welcome />} />
          <Route path="/welcome" element={<Welcome />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/create-admin" element={<CreateAdmin />} />
          
          {/* 🏢 Super Admin Routes */}
      <Route path="/super-admin" element={
        <ProtectedRoute allowedRoles={['super_admin']}>
          <DashboardLayout /></ProtectedRoute>}>
         <Route index element={<SuperAdminDashboard />} />
         <Route path="requests" element={<Requests />} />
         <Route path="users" element={<Users />} />
         <Route path="usage" element={<UsageTracking />} />
         <Route path="logs" element={<Logs />} />
         <Route path="settings" element={<Settings />} />
         <Route path="firestore" element={<FirestoreInspector />} />
      </Route>

          {/* 🛡️ Protected Routes with Role-based access */}
          <Route path="/*" element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }>
            {/* 🔹 Dashboard Routes - Role Specific */}
            <Route path="admin-dashboard" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="cashier-dashboard" element={
              <ProtectedRoute allowedRoles={['cashier', 'admin']}>
                <CashierDashboard />
              </ProtectedRoute>
            } />
            <Route path="member-dashboard" element={
              <ProtectedRoute allowedRoles={['member',]}>
                <MemberDashboard />
              </ProtectedRoute>
            } />
            <Route path="collector/dashboard" element={
              <ProtectedRoute allowedRoles={['collector']}>
                <CollectorDashboard />
              </ProtectedRoute>
            } />
            
            {/* Default dashboard redirect - Role based */}
            <Route path="dashboard" element={<DashboardRedirect />} />
            <Route index element={<DashboardRedirect />} />

            {/* 👤 Profile Routes */}
            <Route path="my-profile" element={<MyProfile />} />
            <Route path="members/profile/:id" element={
              <ProtectedRoute allowedRoles={['admin', 'cashier', 'member']}>
                <MemberProfile />
              </ProtectedRoute>
            } />

            {/* 🏛️ Teams - Admin & Cashier only */}
            <Route path="teams" element={
              <ProtectedRoute allowedRoles={['admin', 'cashier']}>
                <TeamList />
              </ProtectedRoute>
            } />
            <Route path="teams/index" element={
              <ProtectedRoute allowedRoles={['admin', 'cashier']}>
                <TeamList />
              </ProtectedRoute>
            } />
            <Route path="teams/create" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <CreateTeam />
              </ProtectedRoute>
            } />
            <Route path="teams/teamHistory" element={
              <ProtectedRoute allowedRoles={['admin', 'cashier']}>
                <TeamHistory />
              </ProtectedRoute>
            } />
            <Route path="teams/performance" element={
              <ProtectedRoute allowedRoles={['admin', 'cashier']}>
                <TeamPerformance />
              </ProtectedRoute>
            } />

            {/* 👥 Members - All roles */}
            <Route path="members" element={
              <ProtectedRoute allowedRoles={['admin', 'cashier', 'member']}>
                <MemberList />
              </ProtectedRoute>
            } />
            <Route path="members/index" element={
              <ProtectedRoute allowedRoles={['admin', 'cashier', 'member']}>
                <MemberList />
              </ProtectedRoute>
            } />
            <Route path="members/AddMember" element={
              <ProtectedRoute allowedRoles={['admin', 'cashier']}>
                <AddMember />
              </ProtectedRoute>
            } />
            <Route path="members/edit/:id" element={
              <ProtectedRoute allowedRoles={['admin', 'cashier']}>
                <AddMember />
              </ProtectedRoute>
            } />

            {/* 👨‍💼 Users - Admin only */}
            <Route path="users/index" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <UserList />
              </ProtectedRoute>
            } />
            <Route path="users/AddUser" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AddUser />
              </ProtectedRoute>
            } />
            <Route path="users/Profile" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <UserProfile />
              </ProtectedRoute>
            } />
            <Route path="users/CreateMemberAccount" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <CreateMemberAccount />
              </ProtectedRoute>
            } />

            {/* 💰 Fees Management */}
            <Route path="fees/index" element={
              <ProtectedRoute allowedRoles={['admin', 'cashier']}>
                <FeesDashboard />
              </ProtectedRoute>
            } />
            <Route path="fees/entry" element={
              <ProtectedRoute allowedRoles={['admin', 'cashier']}>
                <FeeEntry />
              </ProtectedRoute>
            } />
            <Route path="fees/history" element={
              <ProtectedRoute allowedRoles={['admin', 'cashier']}>
                <FeeHistory />
              </ProtectedRoute>
            } />
            <Route path="fees/reports" element={
              <ProtectedRoute allowedRoles={['admin', 'cashier']}>
                <FeeReports />
              </ProtectedRoute>
            } />
            <Route path="fees/pending" element={
              <ProtectedRoute allowedRoles={['admin', 'cashier']}>
                <PendingFees />
              </ProtectedRoute>
            } />
            
           <Route path="fees/receipt/:id" element={
              <ProtectedRoute allowedRoles={['admin', 'cashier']}>
                <Receipt />
              </ProtectedRoute>
            } />

            <Route path="fees/collection-status" element={
              <ProtectedRoute allowedRoles={['admin', 'cashier']}>
                <CollectionStatusReport />
              </ProtectedRoute>
            } />

           {/* All Rols can view but admin & cashier can manage */}

           {/* Loans */}
            <Route path="loans/index" element={ // Loan Dashboard
              <ProtectedRoute allowedRoles={['admin', 'cashier']}>
                <LoansDashboard />
              </ProtectedRoute>
            } />
            <Route path="loans/add" element={ // Add Loan
              <ProtectedRoute allowedRoles={['admin', 'cashier', 'member']}>
              <AddLoan />
            </ProtectedRoute>
            } />
            <Route path="loans/PendingApplications" element={ // Loan Application Page
              <ProtectedRoute allowedRoles={['admin']}>
              <LoanApplicationPage />
            </ProtectedRoute>
            } />
            <Route path="loans/pending" element={ // Pending Loan Applications
              <ProtectedRoute allowedRoles={['admin']}>
              <PendingApplications />
            </ProtectedRoute>
            } />
            <Route path="loans/ActiveLoan" element={ // Active Loans
              <ProtectedRoute allowedRoles={['admin', 'cashier']}>
               <ActiveLoan />
             </ProtectedRoute>
            } />
            <Route path="loans/list" element={ // Loan List - All loans with search & filter
              <ProtectedRoute allowedRoles={['admin', 'cashier', 'member']}>
                <LoanList />
              </ProtectedRoute>
            } />
            <Route path="loans/history" element={ // Loan History - Completed Loans
              <ProtectedRoute allowedRoles={['admin', 'cashier']}>
               <LoanHistory />
              </ProtectedRoute>
            } />
            <Route path="loans/reports" element={ // Loan Reports - Charts & Analytics
              <ProtectedRoute allowedRoles={['admin']}>
               <LoanReport />
             </ProtectedRoute>
            } />
            <Route path="loans/details/:id" element={
               <ProtectedRoute allowedRoles={['admin', 'cashier', 'member']}>
                 <LoanDetails />
               </ProtectedRoute>
            } />
            <Route path="loans/application/:id" element={
               <ProtectedRoute allowedRoles={['admin']}>
                 <LoanApplicationDetails />
               </ProtectedRoute>
            } />

            {/* 💵 Cashier */}
            <Route path="cashier/index" element={
              <ProtectedRoute allowedRoles={['admin', 'cashier']}>
                <CashierHome />
              </ProtectedRoute>
            } />
            <Route path="cashier/cashIn" element={
              <ProtectedRoute allowedRoles={['admin', 'cashier']}>
                <CashIn />
              </ProtectedRoute>
            } />
            <Route path="cashier/cashOut" element={
              <ProtectedRoute allowedRoles={['admin', 'cashier']}>
                <CashOut />
              </ProtectedRoute>
            } />
            <Route path="cashier/transfer" element={
              <ProtectedRoute allowedRoles={['admin', 'cashier']}>
                <Transfer />
              </ProtectedRoute>
            } />
            <Route path="cashier/ledger" element={
              <ProtectedRoute allowedRoles={['admin', 'cashier']}>
                <Ledger />
              </ProtectedRoute>
            } />
            <Route path="cashier/report" element={
              <ProtectedRoute allowedRoles={['admin', 'cashier']}>
                <CashierReport />
              </ProtectedRoute>
            } />

            {/* 🏦 Bank - Admin only */}
            <Route path="bank/index" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <BankDashboard />
              </ProtectedRoute>
            } />
            <Route path="bank/addaccount" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AddBank />
              </ProtectedRoute>
            } />
            <Route path="bank/transactions" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <Transactions />
              </ProtectedRoute>
            } />

            <Route path="bank/transfer" element={
             <ProtectedRoute allowedRoles={['admin']}>
                <FundTransfer />
              </ProtectedRoute>
            } />



            <Route path="bank/ledger" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AddBank />
              </ProtectedRoute>
            } />
            <Route path="bank/ledger/:id" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <BankLedger />
              </ProtectedRoute>
            } />
            <Route path="bank/history" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <BankHistory />
              </ProtectedRoute>
            } />

            <Route path="finance" element={<Navigate to="/bank/index" replace />} />
            <Route path="finance/addaccount" element={<Navigate to="/bank/addaccount" replace />} />
            <Route path="finance/transfer" element={<Navigate to="/bank/transfer" replace />} />
            <Route path="finance/history" element={<Navigate to="/bank/history" replace />} />
            <Route path="finance/ledger" element={<Navigate to="/bank/ledger" replace />} />
            <Route path="finance/ledger/:id" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <BankLedger />
              </ProtectedRoute>
            } />

            {/* 🏢 Business - Admin only */}
            <Route path="business/index" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <BusinessDashboard />
              </ProtectedRoute>
            } />
            <Route path="business/addbusiness" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AddBusiness />
              </ProtectedRoute>
            } />
            <Route path="business/profitreport" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <ProfitReport />
              </ProtectedRoute>
            } />
            <Route path="business/roitracking" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <ROITracking />
              </ProtectedRoute>
            } />
            <Route path="business/ledger" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <BusinessLedger />
              </ProtectedRoute>
            } />
            <Route path="business/history" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <BusinessHistory />
              </ProtectedRoute>
            } />

            {/* 📑 Reports */}
            <Route path="reports/index" element={
              <ProtectedRoute allowedRoles={['admin', 'cashier']}>
                <ReportsHome />
              </ProtectedRoute>
            } />
            <Route path="reports/memberReport" element={
              <ProtectedRoute allowedRoles={['admin', 'cashier']}>
                <MemberReport />
              </ProtectedRoute>
            } />
            <Route path="reports/loanReport" element={
              <ProtectedRoute allowedRoles={['admin', 'cashier']}>
                <LoanReports />
              </ProtectedRoute>
            } />
            <Route path="reports/financeReport" element={
              <ProtectedRoute allowedRoles={['admin', 'cashier']}>
                <FinanceReport />
              </ProtectedRoute>
            } />
            <Route path="reports/exportData" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <ExportData />
              </ProtectedRoute>
            } />

            {/* 💬 Communication - All roles */}
            <Route path="communication/index" element={<CommunicationDashboard />} />
            <Route path="communication/chat" element={<Chat />} />
            <Route path="communication/committeemsgs" element={<CommitteeMsgs />} />
            <Route path="communication/notices" element={<Notices />} />

            {/* ⚙️ Settings */}
            <Route path="settings/index" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <SettingsHome />
              </ProtectedRoute>
            } />
            <Route path="settings/account" element={
              <ProtectedRoute allowedRoles={['admin', 'cashier', 'member']}>
                <AccountSettings />
              </ProtectedRoute>
            } />
            <Route path="settings/roles" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <RolesPermissions />
              </ProtectedRoute>
            } />
            <Route path="settings/system" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <SystemSettings />
              </ProtectedRoute>
            } />
            <Route path="settings/notifications" element={
              <ProtectedRoute allowedRoles={['admin', 'cashier', 'member']}>
                <Notifications />
              </ProtectedRoute>
            } />

            {/* 🆘 Support - All roles */}
            <Route path="support/index" element={<SupportHome />} />
            <Route path="support/faq" element={<FAQ />} />
            <Route path="support/about" element={<About />} />

            {/* 🏪 Collector Routes */}
            <Route path="collector/history" element={
              <ProtectedRoute allowedRoles={['collector']}>
                <FeeHistory />
              </ProtectedRoute>
            } />
            <Route path="collector/performance" element={
              <ProtectedRoute allowedRoles={['collector']}>
                <FeeReports />
              </ProtectedRoute>
            } />
            <Route path="collector/pending" element={
              <ProtectedRoute allowedRoles={['collector']}>
                <PendingFees />
              </ProtectedRoute>
            } />

            {/* 404 Fallback */}
            <Route path="*" element={<Navigate to="/member-dashboard" replace />} />
          </Route>
        </Routes>
      </Router>
      </SomitySettingsProvider>
    </AuthProvider>
  );
}
