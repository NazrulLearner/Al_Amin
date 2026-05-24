export const financingPermissions = {
  // সবার জন্য (সবাই আবেদন করতে পারবে)
  canApplyForFinancing: ['admin', 'cashier', 'member', 'collector', 'super_admin'],
  
  // নিজের আবেদন/লোন দেখতে পারবে
  canViewOwnFinancing: ['member', 'collector'],
  
  // সব লোন দেখতে পারবে (ক্যাশিয়ার, অ্যাডমিন, কালেক্টর?)
  canViewAllFinancing: ['admin', 'cashier', 'super_admin'],  // collector নয়
  
  // পেন্ডিং অ্যাপ্লিকেশন দেখতে পারবে
  canViewPendingApplications: ['admin', 'cashier', 'super_admin'],  // collector নয়
  
  // অ্যাপ্রুভ করতে পারবে (শুধু অ্যাডমিন)
  canApproveFinancing: ['admin', 'super_admin'],  // collector না, cashier না
  
  // রিজেক্ট করতে পারবে
  canRejectFinancing: ['admin', 'super_admin'],  // collector না, cashier না
  
  // ডিসবার্স করতে পারবে (টাকা দেওয়া)
  canDisburseFinancing: ['admin', 'cashier', 'super_admin'],  // collector না
  
  // লোন একটিভ করতে পারবে
  canActivateFinancing: ['admin', 'cashier', 'super_admin'],  // collector না
  
  // লোন ক্লোজ করতে পারবে (শেষ করা)
  canCloseFinancing: ['admin', 'super_admin'],  // collector না, cashier না
  
  // এডিট করতে পারবে
  canEditFinancing: ['admin', 'super_admin'],  // collector না, cashier না
  
  // ডিলিট করতে পারবে (শুধু সুপার অ্যাডমিন)
  canDeleteFinancing: ['super_admin'],  // শুধু সুপার এডমিন
  
  // রিপোর্ট দেখতে পারবে
  canViewReports: ['admin', 'super_admin'],  // collector না, cashier না, member না
  
  // হিস্ট্রি দেখতে পারবে
  canViewHistory: ['admin', 'cashier', 'super_admin'],  // collector না
  
  // পেমেন্ট নিতে পারবে
  canReceivePayment: ['admin', 'cashier', 'super_admin'],  // collector না
};

export default financingPermissions;