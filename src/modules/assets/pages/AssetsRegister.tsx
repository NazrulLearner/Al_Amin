import React from 'react';
import { Home, Car, Drill, Plus } from 'lucide-react';

const AssetsRegister = () => {
  const assets = [
    { name: 'Society Building', type: 'building', value: 5000000, purchaseDate: '2020-01-01' },
    { name: 'Microbus', type: 'vehicle', value: 1200000, purchaseDate: '2022-06-15' },
    { name: 'Computer Set', type: 'equipment', value: 150000, purchaseDate: '2023-03-10' },
  ];

  const getIcon = (type: string) => {
    switch(type) {
      case 'building': return <Home size={18} />;
      case 'vehicle': return <Car size={18} />;
      default: return <Drill size={18} />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Assets Register</h1>
          <p className="text-gray-500 mt-1">Fixed assets of the society</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl">
          <Plus size={18} />
          Add Asset
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {assets.map((asset, i) => (
          <div key={i} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                {getIcon(asset.type)}
              </div>
              <div>
                <h3 className="font-semibold">{asset.name}</h3>
                <p className="text-xs text-gray-400 capitalize">{asset.type}</p>
              </div>
            </div>
            <p className="text-xl font-bold">৳ {asset.value.toLocaleString()}</p>
            <p className="text-sm text-gray-500 mt-1">Purchase: {asset.purchaseDate}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AssetsRegister;