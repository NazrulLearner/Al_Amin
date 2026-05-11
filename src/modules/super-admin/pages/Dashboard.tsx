
const Dashboard = () => {
  const stats = [
    { title: "Total somity", value: 12 },
    { title: "Total Members", value: 520 },
    { title: "Total Users", value: 45 },
    { title: "Total Savings", value: "৳ 2,50,000" },
  ];

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-bold">Super Admin Dashboard</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((item, index) => (
          <div key={index} className="bg-white shadow p-4 rounded">
            <h2 className="text-sm text-gray-500">{item.title}</h2>
            <p className="text-lg font-semibold">{item.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
