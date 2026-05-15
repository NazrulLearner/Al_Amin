
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();
  const stats = [
    { title: "Total somity", value: 12 },
    { title: "Total Members", value: 520 },
    { title: "Total Users", value: 45 },
    { title: "Total Savings", value: "৳ 2,50,000" },
  ];

  return (
    <div className="p-4 space-y-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-xl font-bold">Super Admin Dashboard</h1>
          <p className="text-sm text-gray-500">Firestore data inspector দেখার জন্য নিচের বোতনে ক্লিক করুন।</p>
        </div>
        <button
          onClick={() => navigate('/super-admin/firestore')}
          className="rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700"
        >
          Firestore Inspector
        </button>
      </div>

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
