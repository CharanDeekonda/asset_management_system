import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, History, Monitor } from 'lucide-react';

const AssetHistory = () => {
  const { assetId } = useParams();
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [details, setDetails] = useState(null);

  useEffect(() => {
    const fetchAssetData = async () => {
      try {
        // Fetch specific asset hardware specs
        const detRes = await axios.get(`http://localhost:5000/api/assets/id/${assetId}`);
        setDetails(detRes.data);
        
        // Fetch assignment logs
        const histRes = await axios.get(`http://localhost:5000/api/assets/history/${assetId}`);
        setHistory(histRes.data);
      } catch (err) {
        console.error("Error loading asset data:", err);
      }
    };
    fetchAssetData();
  }, [assetId]);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-6xl mx-auto">
        {/* Navigation Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate(-1)} 
              className="p-2 hover:bg-gray-800 rounded-full text-blue-500 transition"
            >
              <ArrowLeft size={28} />
            </button>
            <h1 className="text-3xl font-bold">Asset Lifecycle</h1>
        
          </div>
        </div>
        <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6 mb-8 flex justify-between items-center shadow-2xl">
          <div>
            <p className="text-blue-400 font-mono text-sm uppercase tracking-widest mb-1">Asset ID</p>
            <h2 className="text-4xl font-black">{assetId}</h2>
          </div>
          <div className="text-right">
            <p className="text-gray-400 text-sm mb-1">Device Model</p>
            <h3 className="text-xl font-bold">{details?.brand} {details?.model}</h3>
          </div>
        </div>

        {/* History Table Container */}
        <div className="bg-gray-800 rounded-2xl shadow-2xl overflow-hidden border border-gray-700">
          <div className="p-6 border-b border-gray-700 flex items-center gap-2">
            <History size={20} className="text-blue-500" />
            <span className="font-bold">Assignment History</span>
          </div>
          
          <table className="w-full text-left">
            <thead className="bg-gray-900/50 text-sm font-semibold text-gray-400">
              <tr>
                <th className="px-6 py-4">Employee Name</th>
                <th className="px-6 py-4">Employee ID</th>
                <th className="px-6 py-4">From Date</th>
                <th className="px-6 py-4">To Date</th>
                <th className="px-6 py-4">Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
            {history.map((entry, index) => (
                <tr key={index} className="hover:bg-gray-700/30 transition">
                <td className="px-6 py-4 font-medium text-white">{entry.employee_name}</td>
                <td className="px-6 py-4 text-gray-400 font-mono text-sm">{entry.employee_id}</td>
                <td className="px-6 py-4 text-gray-300">{entry.from_date}</td>
                <td className="px-6 py-4 text-gray-300">
                    {entry.to_date ? (
                    entry.to_date
                    ) : (
                    <span className="text-green-500 font-bold px-2 py-1 bg-green-500/10 rounded">
                        Active / Present
                    </span>
                    )}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500 italic">
                    {entry.remarks || "-"}
                </td>
                </tr>
            ))}
            </tbody>
            
          </table>
        </div>
      </div>
    </div>
  );
};

export default AssetHistory;