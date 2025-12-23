import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Plus, Save } from 'lucide-react';
import { useSnackbar } from '../context/SnackbarContext';
import { useConfirm } from '../context/ConfirmContext';
import { 
  Dialog, DialogTitle, DialogContent, DialogActions, 
  TextField, Button, Grid 
} from '@mui/material';

const AssetDetails = () => {
  const { typeName } = useParams();
  const navigate = useNavigate();
  const showSnackbar = useSnackbar();
  const askConfirmation = useConfirm();

  const [assets, setAssets] = useState([]);
  const [showAssignModal, setShowAssignModal] = useState(false);
  
  const [assignData, setAssignData] = useState({
    asset_id: '',
    brand: '',
    model: '',
    ram: '',
    processor: '',
    screen_size: '',
    os: '',
    storage_capacity: '',
    employee_id: '',
    employee_name: '',
    from_date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchAssets();
  }, [typeName]);

  const fetchAssets = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/assets/details/${typeName}`);
      setAssets(res.data);
    } catch (err) {
      showSnackbar("Error fetching asset details", "error");
    }
  };

  const handleAssignSubmit = async (e) => {
    if (e) e.preventDefault();

    if (!assignData.asset_id || !assignData.brand || !assignData.employee_id) {
      showSnackbar("Please fill required fields", "warning");
      return;
    }

    askConfirmation(
      "Create & Assign Asset",
      `Register ${assignData.asset_id} and assign to ${assignData.employee_name}. Proceed?`,
      async () => {
        try {
          await axios.post('http://localhost:5000/api/assignments', {
            ...assignData,
            typeName: typeName
          });
          
          showSnackbar("Asset registered and assigned!", "success");
          setShowAssignModal(false);
          setAssignData({
            asset_id: '', brand: '', model: '', ram: '', processor: '',
            screen_size: '', os: '', storage_capacity: '',
            employee_id: '', employee_name: '',
            from_date: new Date().toISOString().split('T')[0]
          });
          fetchAssets();
        } catch (err) {
          showSnackbar(err.response?.data?.error || "Assignment failed", "error");
        }
      }
    );
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/')} className="p-2 hover:bg-gray-100 rounded-full transition">
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{typeName} Inventory</h1>
          </div>
        </div>
        <button 
          onClick={() => setShowAssignModal(true)}
          className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-lg transition-all"
        >
          <Plus size={20} /> Assign New {typeName}
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 border-b text-sm font-semibold text-gray-600">
            <tr>
              <th className="px-6 py-4">Asset ID</th>
              <th className="px-6 py-4">Device Specs</th>
              <th className="px-6 py-4">Employee ID</th>
              <th className="px-6 py-4">Employee Name</th>
              <th className="px-6 py-4">Assign Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {assets.map((asset) => (
              <tr key={asset.asset_id} className="hover:bg-gray-50 transition">
                <td className="px-6 py-4 font-bold text-blue-600">{asset.asset_id}</td>
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-800">{asset.brand} {asset.model}</div>
                  {typeName === 'Laptop' && asset.processor && (
                    <div className="text-xs text-gray-500 mt-1">
                       {asset.processor} | {asset.ram} | {asset.os}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 text-sm text-gray-700">{asset.employee_id}</td>
                <td className="px-6 py-4 text-sm text-gray-700 font-medium">{asset.employee_name}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{asset.assign_date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={showAssignModal} onClose={() => setShowAssignModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold' }}>Register & Assign New {typeName}</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}><p className="text-xs font-bold text-gray-400 uppercase">General Info</p></Grid>
            <Grid item xs={6}><TextField fullWidth label="Asset ID" value={assignData.asset_id} onChange={(e) => setAssignData({...assignData, asset_id: e.target.value})} /></Grid>
            <Grid item xs={6}><TextField fullWidth label="Brand" value={assignData.brand} onChange={(e) => setAssignData({...assignData, brand: e.target.value})} /></Grid>
            <Grid item xs={12}><TextField fullWidth label="Model" value={assignData.model} onChange={(e) => setAssignData({...assignData, model: e.target.value})} /></Grid>
            {typeName === 'Laptop' && (
              <>
                <Grid item xs={12} sx={{ mt: 1 }}><p className="text-xs font-bold text-gray-400 uppercase">Technical Specs</p></Grid>
                <Grid item xs={6}><TextField fullWidth label="RAM" value={assignData.ram} onChange={(e) => setAssignData({...assignData, ram: e.target.value})} /></Grid>
                <Grid item xs={6}><TextField fullWidth label="Processor" value={assignData.processor} onChange={(e) => setAssignData({...assignData, processor: e.target.value})} /></Grid>
                <Grid item xs={4}><TextField fullWidth label="Screen Size" value={assignData.screen_size} onChange={(e) => setAssignData({...assignData, screen_size: e.target.value})} /></Grid>
                <Grid item xs={4}><TextField fullWidth label="OS" value={assignData.os} onChange={(e) => setAssignData({...assignData, os: e.target.value})} /></Grid>
                <Grid item xs={4}><TextField fullWidth label="Storage" value={assignData.storage_capacity} onChange={(e) => setAssignData({...assignData, storage_capacity: e.target.value})} /></Grid>
              </>
            )}

            <Grid item xs={12} sx={{ mt: 1 }}><p className="text-xs font-bold text-gray-400 uppercase">Assignment</p></Grid>
            <Grid item xs={6}><TextField fullWidth label="Employee ID" value={assignData.employee_id} onChange={(e) => setAssignData({...assignData, employee_id: e.target.value})} /></Grid>
            <Grid item xs={6}><TextField fullWidth label="Employee Name" value={assignData.employee_name} onChange={(e) => setAssignData({...assignData, employee_name: e.target.value})} /></Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setShowAssignModal(false)} color="inherit">Cancel</Button>
          <Button onClick={handleAssignSubmit} variant="contained" color="secondary" startIcon={<Save />}>Register & Assign</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default AssetDetails;