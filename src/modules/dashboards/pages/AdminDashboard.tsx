const AdminDashboard = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-blue-700 mb-2">Admin Dashboard</h1>
      <p className="text-gray-600">Welcome, dear admin  !</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        <div className="bg-white shadow rounded-xl p-4">
          <h2 className="font-semibold text-gray-700">Your Total Paid Fees</h2>
          <p className="text-3xl font-bold text-blue-600 mt-2">৳12,000</p>
        </div>

        <div className="bg-white shadow rounded-xl p-4">
          <h2 className="font-semibold text-gray-700">Current Loan Balance</h2>
          <p className="text-3xl font-bold text-blue-600 mt-2">৳3,500</p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
