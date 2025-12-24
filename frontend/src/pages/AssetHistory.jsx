import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, History, Monitor, Cpu, Layers, UserPlus, CheckCircle } from 'lucide-react';
import { useSnackbar } from '../context/SnackbarContext'; 
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from '@mui/material';

const AssetHistory = () => {
    const { assetId } = useParams();
    const navigate = useNavigate();
    const showSnackbar = useSnackbar();
    const [history, setHistory] = useState([]);
    const [details, setDetails] = useState(null);

    const [isAssigning, setIsAssigning] = useState(false);
    const [showConfirmDialog, setShowConfirmDialog] = useState(false); 
    const [newAssignForm, setNewAssignForm] = useState({
        employee_id: '',
        employee_name: '',
        from_date: new Date().toISOString().split('T')[0]
    });

    const fetchAssetData = async () => {
        try {
            const detRes = await axios.get(`http://localhost:5000/api/assets/id/${assetId}`);
            setDetails(detRes.data);
            const histRes = await axios.get(`http://localhost:5000/api/assets/history/${assetId}`);
            setHistory(histRes.data);
        } catch (err) {
            console.error("Error loading asset data:", err);
        }
    };

    useEffect(() => {
        fetchAssetData();
    }, [assetId]);

    const isAssetFree = history.length === 0 || (history[0] && history[0].to_date !== null && history[0].to_date !== "-");
    const handleFormSubmit = (e) => {
        e.preventDefault();
        setShowConfirmDialog(true);
    };
    const processAssignment = async () => {
        try {
            const response = await axios.post('http://localhost:5000/api/assets/reassign', {
                asset_id: assetId,
                new_employee_id: newAssignForm.employee_id,
                new_employee_name: newAssignForm.employee_name,
                remarks: "Initial Assignment",
                old_employee_id: null
            });
            showSnackbar(response.data.message, "success");
            setShowConfirmDialog(false);
            setIsAssigning(false);
            fetchAssetData();
        } catch (err) {
            showSnackbar("Assignment failed", "error");
            setShowConfirmDialog(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white p-8">
            <div className="max-w-6xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-800 rounded-full text-blue-500 transition">
                            <ArrowLeft size={28} />
                        </button>
                        <h1 className="text-3xl font-bold">Asset History</h1>
                    </div>
                </div>

                <div className="bg-gray-800 border border-gray-700 rounded-2xl p-8 mb-8 shadow-2xl relative overflow-hidden">
                    <div className="relative z-10">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <p className="text-blue-400 font-mono text-sm uppercase tracking-widest mb-1">Asset ID</p>
                                <h2 className="text-5xl font-black">{assetId}</h2>
                            </div>
                            <div className="text-right">
                                <p className="text-gray-400 text-sm mb-1 uppercase font-bold tracking-tighter">Current Device</p>
                                <h3 className="text-2xl font-bold text-white">{details?.brand} {details?.model}</h3>
                            </div>
                        </div>

                        {details?.ram && (
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-6 mt-6 pt-6 border-t border-gray-700/50">
                                <div className="flex items-center gap-3">
                                    <Cpu className="text-blue-500" size={20} />
                                    <div>
                                        <p className="text-[10px] text-gray-500 uppercase font-bold">Processor</p>
                                        <p className="text-sm font-semibold text-gray-200">{details.processor || '-'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Layers className="text-purple-500" size={20} />
                                    <div>
                                        <p className="text-[10px] text-gray-500 uppercase font-bold">Memory</p>
                                        <p className="text-sm font-semibold text-gray-200">{details.ram || '-'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-orange-500 text-lg">💾</span>
                                    <div>
                                        <p className="text-[10px] text-gray-500 uppercase font-bold">Storage</p>
                                        <p className="text-sm font-semibold text-gray-200">{details.storage_capacity || '-'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Monitor className="text-green-500" size={20} />
                                    <div>
                                        <p className="text-[10px] text-gray-500 uppercase font-bold">Display</p>
                                        <p className="text-sm font-semibold text-gray-200">{details.screen_size || '-'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-yellow-500 text-lg">⚙️</span>
                                    <div>
                                        <p className="text-[10px] text-gray-500 uppercase font-bold">OS</p>
                                        <p className="text-sm font-semibold text-gray-200">{details.os || '-'}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {details && isAssetFree && !isAssigning && (
                    <div className="mb-6 flex justify-end">
                        <button
                            onClick={() => setIsAssigning(true)}
                            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg"
                        >
                            <UserPlus size={20} /> Assign Asset to New Employee
                        </button>
                    </div>
                )}

                {isAssigning && (
                    <div className="bg-gray-800 border border-green-500/50 p-8 rounded-3xl shadow-2xl mb-8 animate-in fade-in zoom-in">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-green-400 uppercase tracking-tighter">New Assignment</h3>
                            <button onClick={() => setIsAssigning(false)} className="text-gray-500 hover:text-white text-xs underline">Cancel</button>
                        </div>
                        <form onSubmit={handleFormSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <input
                                required
                                placeholder="Employee ID"
                                className="bg-gray-900 border border-gray-700 rounded-xl p-3 text-sm text-white outline-none focus:ring-1 focus:ring-green-500"
                                onChange={(e) => setNewAssignForm({ ...newAssignForm, employee_id: e.target.value })}
                            />
                            <input
                                required
                                placeholder="Employee Name"
                                className="bg-gray-900 border border-gray-700 rounded-xl p-3 text-sm text-white outline-none focus:ring-1 focus:ring-green-500"
                                onChange={(e) => setNewAssignForm({ ...newAssignForm, employee_name: e.target.value })}
                            />
                            <button type="submit" className="bg-green-600 hover:bg-green-700 rounded-xl font-bold text-xs uppercase tracking-widest">
                                Confirm Assignment
                            </button>
                        </form>
                    </div>
                )}

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
                                <tr key={index}
                                    onClick={() => navigate(`/assets/deep-view/${assetId}/${entry.employee_id}`)}
                                    className="hover:bg-gray-700/50 cursor-pointer transition-all border-b border-gray-700/50"
                                >
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

            <Dialog open={showConfirmDialog} onClose={() => setShowConfirmDialog(false)}>
                <DialogTitle sx={{ bgcolor: '#111827', color: 'white', display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CheckCircle className="text-green-500" /> Confirm Assignment
                </DialogTitle>
                <DialogContent sx={{ bgcolor: '#111827', color: '#9ca3af' }}>
                    <Typography variant="body1">
                        Check Any user is Currently assigned! If yes, the previous assignment will be closed.
                        Are you sure you want to assign asset <b>{assetId}</b> to <b>{newAssignForm.employee_name} ({newAssignForm.employee_id})</b>?
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ bgcolor: '#111827', p: 2 }}>
                    <Button onClick={() => setShowConfirmDialog(false)} sx={{ color: '#9ca3af' }}>Cancel</Button>
                    <Button onClick={processAssignment} variant="contained" color="success" sx={{ fontWeight: 'bold' }}>
                        Yes, Confirm
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default AssetHistory;