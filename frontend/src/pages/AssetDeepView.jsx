import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Wrench, History, UserMinus, ShieldCheck, Cpu, UserPlus } from 'lucide-react';
import { useSnackbar } from '../context/SnackbarContext';
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    TextField, Button, Box, Typography
} from '@mui/material';

const AssetDeepView = () => {
    const { assetId, empId } = useParams();
    const navigate = useNavigate();
    const showSnackbar = useSnackbar();

    const [details, setDetails] = useState(null);
    const [repairs, setRepairs] = useState([]);
    const [isUpdating, setIsUpdating] = useState(false);

    const [showRepairModal, setShowRepairModal] = useState(false);
    const [showEndAssignment, setShowEndAssignment] = useState(false);

    const [endRemarks, setEndRemarks] = useState('');
    const [repairForm, setRepairForm] = useState({
        date_reported: new Date().toISOString().split('T')[0],
        issue_reported: '',
        amount: '',
        resolver_comments: ''
    });

    const [reassignForm, setReassignForm] = useState({
        new_employee_id: '',
        new_employee_name: '',
        remarks: ''
    });

    const fetchFullDetails = async () => {
        try {
            const res = await axios.get(`http://localhost:5000/api/assets/id/${assetId}`);
            setDetails(res.data);
            const repairRes = await axios.get(`http://localhost:5000/api/assets/repairs/${assetId}`);
            setRepairs(repairRes.data);
        } catch (err) {
            console.error("Fetch error:", err);
        }
    };

    useEffect(() => {
        fetchFullDetails();
    }, [assetId]);

    const handleEndAssignment = async () => {
        if (!endRemarks.trim()) {
            showSnackbar("Please provide remarks to end assignment", "error");
            return;
        }
        try {
            const res = await axios.post('http://localhost:5000/api/assets/end-assignment', {
                asset_id: assetId,
                employee_id: empId,
                remarks: endRemarks
            });
            showSnackbar(res.data.message, "success");
            setShowEndAssignment(false);
            setEndRemarks('');
            fetchFullDetails();
        } catch (err) {
            showSnackbar("Failed to end assignment", "error");
        }
    };

    const handleRepairSubmit = async () => {
        try {
            const res = await axios.post('http://localhost:5000/api/assets/add-repair', {
                asset_id: assetId,
                ...repairForm
            });
            showSnackbar(res.data.message, "success");
            setShowRepairModal(false);
            setRepairForm({
                date_reported: new Date().toISOString().split('T')[0],
                issue_reported: '',
                amount: '',
                resolver_comments: ''
            });
            fetchFullDetails();
        } catch (err) {
            showSnackbar("Error adding repair record", "error");
        }
    };

    const handleReassignSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:5000/api/assets/reassign', {
                asset_id: assetId,
                old_employee_id: empId,
                new_employee_id: reassignForm.new_employee_id,
                new_employee_name: reassignForm.new_employee_name,
                remarks: reassignForm.remarks
            });

            showSnackbar(response.data.message, "success");
            setReassignForm({ new_employee_id: '', new_employee_name: '', remarks: '' });
            setIsUpdating(false);
            fetchFullDetails();
            setTimeout(() => navigate(`/assets/history/${assetId}`), 1500);
        } catch (err) {
            showSnackbar(err.response?.data?.error || "Reassignment failed", "error");
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white p-8 font-sans">
            <div className="max-w-7xl mx-auto">
                <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-blue-400 hover:text-blue-300 mb-8 transition-all group">
                    <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> Back to History
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">
                        <div className="bg-gray-800 border border-gray-700 rounded-3xl p-8 shadow-2xl">
                            <h2 className="text-2xl font-black mb-8 flex items-center gap-3 text-blue-400 uppercase tracking-tight">
                                <ShieldCheck /> Device Information
                            </h2>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-y-8 gap-x-4 mb-10">
                                <div><p className="text-gray-500 text-[10px] uppercase font-bold mb-1">Asset ID</p><p className="text-xl font-bold">{details?.asset_id}</p></div>
                                <div><p className="text-gray-500 text-[10px] uppercase font-bold mb-1">Brand</p><p className="text-xl font-bold">{details?.brand}</p></div>
                                <div><p className="text-gray-500 text-[10px] uppercase font-bold mb-1">Model</p><p className="text-xl font-bold">{details?.model}</p></div>
                            </div>
                            {details?.asset_id?.startsWith('LPT') && (
                                <>
                                    <h2 className="text-2xl font-black mb-8 flex items-center gap-3 text-purple-400 uppercase tracking-tight border-t border-gray-700 pt-8">
                                        <Cpu /> Configuration Details
                                    </h2>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-y-8 gap-x-4">
                                        <div><p className="text-gray-500 text-[10px] uppercase font-bold mb-1">Processor</p><p className="font-semibold">{details?.processor || '---'}</p></div>
                                        <div><p className="text-gray-500 text-[10px] uppercase font-bold mb-1">RAM</p><p className="font-semibold">{details?.ram || '---'}</p></div>
                                        <div><p className="text-gray-500 text-[10px] uppercase font-bold mb-1">Storage</p><p className="font-semibold">{details?.storage_capacity || '---'}</p></div>
                                        <div><p className="text-gray-500 text-[10px] uppercase font-bold mb-1">Screen Size</p><p className="font-semibold">{details?.screen_size || '---'}</p></div>
                                        <div><p className="text-gray-500 text-[10px] uppercase font-bold mb-1">OS</p><p className="font-semibold">{details?.os || '---'}</p></div>
                                    </div>
                                </>
                            )}
                        </div>
                        <div className="bg-gray-800 border border-gray-700 rounded-3xl shadow-2xl overflow-hidden">
                            <div className="p-6 border-b border-gray-700 flex justify-between items-center bg-gray-900/40">
                                <h2 className="text-xl font-bold flex items-center gap-3"><Wrench size={20} className="text-orange-500" /> Repair History</h2>
                                <button onClick={() => setShowRepairModal(true)} className="bg-orange-600 hover:bg-orange-700 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all">
                                    Add Repair Record
                                </button>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-gray-900/60 text-gray-500 text-[10px] uppercase font-bold tracking-widest">
                                        <tr>
                                            <th className="px-6 py-4">Reported</th>
                                            <th className="px-6 py-4">Issue</th>
                                            <th className="px-6 py-4">Amount</th>
                                            <th className="px-6 py-4">Resolver Comments</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-700/50">
                                        {repairs.map((r, i) => (
                                            <tr key={i} className="hover:bg-gray-700/20 transition">
                                                <td className="px-6 py-4 font-mono text-xs text-gray-400">{r.date_reported}</td>
                                                <td className="px-6 py-4 font-bold text-white">{r.issue_reported}</td>
                                                <td className="px-6 py-4 text-green-400 font-bold">₹{r.amount}</td>
                                                <td className="px-6 py-4 text-sm text-gray-300 italic">{r.resolver_comments || "No comments provided"}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {repairs.length === 0 && <p className="p-10 text-center text-gray-500 italic text-sm">No repair records found.</p>}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        {!isUpdating ? (
                            <div className="bg-blue-600/10 border border-blue-500/30 p-8 rounded-3xl shadow-xl transition-all">
                                <h3 className="text-xl font-bold mb-4 text-blue-400 uppercase tracking-tighter flex items-center gap-2">
                                    <History size={20} /> Reassignment Flow
                                </h3>
                                <p className="text-sm text-gray-400 leading-relaxed mb-6">
                                    Close the current assignment for <b>{empId}</b> and transfer this asset to a new employee.
                                </p>
                                <button
                                    onClick={() => setIsUpdating(true)}
                                    className="w-full bg-blue-600 hover:bg-blue-700 py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-lg"
                                >
                                    Update Assignment
                                </button>
                            </div>
                        ) : (
                            <div className="bg-gray-800 border border-blue-500/50 p-8 rounded-3xl shadow-2xl">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-xl font-bold text-blue-400 uppercase tracking-tighter">New Assignment</h3>
                                    <button onClick={() => setIsUpdating(false)} className="text-gray-500 hover:text-white text-xs underline">Cancel</button>
                                </div>
                                <form onSubmit={handleReassignSubmit} className="space-y-4">
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Remarks for {empId} *</label>
                                        <textarea
                                            required
                                            className="w-full bg-gray-900 border border-gray-700 rounded-xl p-3 text-sm text-white focus:ring-1 focus:ring-blue-500 outline-none"
                                            value={reassignForm.remarks}
                                            onChange={(e) => setReassignForm({ ...reassignForm, remarks: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">New Employee ID *</label>
                                        <input
                                            required
                                            type="text"
                                            className="w-full bg-gray-900 border border-gray-700 rounded-xl p-3 text-sm text-white focus:ring-1 focus:ring-blue-500 outline-none"
                                            value={reassignForm.new_employee_id}
                                            onChange={(e) => setReassignForm({ ...reassignForm, new_employee_id: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">New Employee Name *</label>
                                        <input
                                            required
                                            type="text"
                                            className="w-full bg-gray-900 border border-gray-700 rounded-xl p-3 text-sm text-white focus:ring-1 focus:ring-blue-500 outline-none"
                                            value={reassignForm.new_employee_name}
                                            onChange={(e) => setReassignForm({ ...reassignForm, new_employee_name: e.target.value })}
                                        />
                                    </div>
                                    <button type="submit" className="w-full bg-green-600 hover:bg-green-700 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg mt-2">
                                        Confirm Reassignment
                                    </button>
                                </form>
                            </div>
                        )}

                        {!isUpdating && (
                            <div className="bg-red-600/10 border border-red-500/30 p-6 rounded-3xl shadow-xl">
                                <h3 className="text-lg font-bold mb-4 flex items-center gap-3 text-red-400 uppercase tracking-tighter">
                                    <UserMinus size={20} /> End Assignment
                                </h3>
                                <button
                                    onClick={() => setShowEndAssignment(true)}
                                    className="w-full bg-red-600 hover:bg-red-700 py-3 rounded-xl font-bold transition-all shadow-lg text-sm uppercase"
                                >
                                    End User Assignment
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <Dialog open={showEndAssignment} onClose={() => setShowEndAssignment(false)} fullWidth maxWidth="xs">
                <DialogTitle sx={{ bgcolor: '#1f2937', color: 'white', fontWeight: 'bold' }}>End User Assignment</DialogTitle>
                <DialogContent sx={{ bgcolor: '#1f2937', pt: 2 }}>
                    <Typography variant="body2" sx={{ color: '#9ca3af', mb: 2 }}>Provide remarks regarding the device condition.</Typography>
                    <TextField
                        fullWidth multiline rows={3} label="Closing Remarks" variant="outlined" value={endRemarks}
                        onChange={(e) => setEndRemarks(e.target.value)}
                        sx={{ '& .MuiOutlinedInput-root': { color: 'white', '& fieldset': { borderColor: '#374151' } }, '& .MuiInputLabel-root': { color: '#9ca3af' } }}
                    />
                </DialogContent>
                <DialogActions sx={{ bgcolor: '#1f2937', p: 2 }}>
                    <Button onClick={() => setShowEndAssignment(false)} sx={{ color: '#9ca3af' }}>Cancel</Button>
                    <Button onClick={handleEndAssignment} variant="contained" color="error">Confirm End</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={showRepairModal} onClose={() => setShowRepairModal(false)} fullWidth maxWidth="sm">
                <DialogTitle sx={{ bgcolor: '#1f2937', color: 'white', fontWeight: 'bold' }}>Add Repair Record</DialogTitle>
                <DialogContent sx={{ bgcolor: '#1f2937', display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <TextField
                            label="Date Reported" type="date" fullWidth InputLabelProps={{ shrink: true }} value={repairForm.date_reported}
                            onChange={(e) => setRepairForm({ ...repairForm, date_reported: e.target.value })}
                            sx={{ '& .MuiOutlinedInput-root': { color: 'white', '& fieldset': { borderColor: '#374151' } }, '& .MuiInputLabel-root': { color: '#9ca3af' } }}
                        />
                        <TextField
                            label="Amount" type="number" fullWidth value={repairForm.amount}
                            onChange={(e) => setRepairForm({ ...repairForm, amount: e.target.value })}
                            sx={{ '& .MuiOutlinedInput-root': { color: 'white', '& fieldset': { borderColor: '#374151' } }, '& .MuiInputLabel-root': { color: '#9ca3af' } }}
                        />
                    </Box>
                    <TextField
                        label="Issue Reported" fullWidth multiline rows={2} value={repairForm.issue_reported}
                        onChange={(e) => setRepairForm({ ...repairForm, issue_reported: e.target.value })}
                        sx={{ '& .MuiOutlinedInput-root': { color: 'white', '& fieldset': { borderColor: '#374151' } }, '& .MuiInputLabel-root': { color: '#9ca3af' } }}
                    />
                    <TextField
                        label="Resolver Comments" fullWidth multiline rows={2} value={repairForm.resolver_comments}
                        onChange={(e) => setRepairForm({ ...repairForm, resolver_comments: e.target.value })}
                        sx={{ '& .MuiOutlinedInput-root': { color: 'white', '& fieldset': { borderColor: '#374151' } }, '& .MuiInputLabel-root': { color: '#9ca3af' } }}
                    />
                </DialogContent>
                <DialogActions sx={{ bgcolor: '#1f2937', p: 2 }}>
                    <Button onClick={() => setShowRepairModal(false)} sx={{ color: '#9ca3af' }}>Cancel</Button>
                    <Button onClick={handleRepairSubmit} variant="contained" color="warning">Save Record</Button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default AssetDeepView;