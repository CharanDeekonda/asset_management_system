import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Plus, Save } from 'lucide-react';
import { useSnackbar } from '../context/SnackbarContext';
import { useConfirm } from '../context/ConfirmContext';
import { 
  Dialog, DialogTitle, DialogContent, DialogActions, 
  TextField, Button, Grid, createTheme, ThemeProvider
} from '@mui/material';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#3b82f6' },
    background: { paper: '#1f2937', default: '#111827' }
  },
});

const AssetDetails = () => {
  const { typeName } = useParams();
  const navigate = useNavigate();
  const showSnackbar = useSnackbar();
  const askConfirmation = useConfirm();

  const [assets, setAssets] = useState([]);
  const [showAssignModal, setShowAssignModal] = useState(false);
  
  const [assignData, setAssignData] = useState({
    asset_id: '', brand: '', model: '', ram: '', processor: '',
    screen_size: '', os: '', storage_capacity: '',
    employee_id: '', employee_name: '',
    from_date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => { fetchAssets(); }, [typeName]);

  const fetchAssets = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/assets/details/${typeName}`);
      setAssets(res.data);
    } catch (err) { showSnackbar("Error fetching asset details", "error"); }
  };

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    askConfirmation("Confirm Assignment", "Register and assign this hardware?", async () => {
        try {
          await axios.post('http://localhost:5000/api/assignments', { ...assignData, typeName });
          showSnackbar("Success!", "success");
          setShowAssignModal(false);
          fetchAssets();
        } catch (err) { showSnackbar("Error assigning asset", "error"); }
      }
    );
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <div className="min-h-screen bg-gray-900 text-white p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-4">
              <button onClick={() => navigate('/')} className="p-2 hover:bg-gray-800 rounded-full text-blue-500 transition">
                <ArrowLeft size={28} />
              </button>
              <h1 className="text-3xl font-bold">{typeName} Inventory</h1>
            </div>
            <button onClick={() => setShowAssignModal(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl flex items-center gap-2 shadow-lg">
              <Plus size={20} /> Assign New {typeName}
            </button>
          </div>

          <div className="bg-gray-800 rounded-2xl shadow-2xl overflow-hidden border border-gray-700">
  <table className="w-full text-left">
    <thead className="bg-gray-900/50 border-b border-gray-700 text-sm font-semibold text-gray-400">
      <tr>
        <th className="px-6 py-4">Asset ID</th>
        <th className="px-6 py-4">Brand & Model</th>
        {typeName === 'Laptop' && (
          <>
            <th className="px-6 py-4">Processor & RAM</th>
            <th className="px-6 py-4">Storage & OS</th>
            {/* Added new header column */}
            <th className="px-6 py-4">Screen Size</th>
          </>
        )}
        <th className="px-6 py-4">Assigned To</th>
        <th className="px-6 py-4 text-center">Assign Date</th>
      </tr>
    </thead>
    <tbody className="divide-y divide-gray-700">
      {assets.map((asset) => (
        <tr key={asset.asset_id} className="hover:bg-gray-700/30 transition">
          <td className="px-6 py-4 font-bold text-blue-400">
            <button 
              onClick={() => navigate(`/assets/history/${asset.asset_id}`)}
              className="hover:text-white transition-all text-left"
            >
              {asset.asset_id}
            </button>
          </td>
          <td className="px-6 py-4 text-white">
            <div className="font-medium">{asset.brand}</div>
            <div className="text-xs text-gray-500">{asset.model}</div>
          </td>

          {typeName === 'Laptop' && (
            <>
              <td className="px-6 py-4 text-sm">
                <div className="text-gray-200">{asset.processor || '-'}</div>
                <div className="text-xs text-gray-500">{asset.ram ? `${asset.ram} RAM` : '-'}</div>
              </td>
              <td className="px-6 py-4 text-sm">
                <div className="text-gray-200">{asset.storage_capacity || '-'}</div> 
                <div className="text-xs text-gray-500">{asset.os || '-'}</div>
              </td>
              {/* Added new data column */}
              <td className="px-6 py-4 text-sm text-gray-200">
                {asset.screen_size || '-'}
              </td>
            </>
          )}

          <td className="px-6 py-4">
            <div className="text-sm text-gray-200">{asset.employee_name}</div>
            <div className="text-xs text-gray-500">{asset.employee_id}</div>
          </td>
          <td className="px-6 py-4 text-center text-gray-400 text-sm">{asset.assign_date}</td>
        </tr>
      ))}
    </tbody>
  </table>
</div>

        <Dialog open={showAssignModal} onClose={() => setShowAssignModal(false)} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ fontWeight: 'bold' }}>Register & Assign {typeName}</DialogTitle>
          <DialogContent dividers>
            <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={6}><TextField fullWidth size="small" label="Asset ID" value={assignData.asset_id} onChange={e => setAssignData({...assignData, asset_id: e.target.value})} /></Grid>
                <Grid item xs={6}><TextField fullWidth size="small" label="Brand" value={assignData.brand} onChange={e => setAssignData({...assignData, brand: e.target.value})} /></Grid>
                <Grid item xs={12}><TextField fullWidth size="small" label="Model" value={assignData.model} onChange={e => setAssignData({...assignData, model: e.target.value})} /></Grid>
                
                {typeName === 'Laptop' && (
                    <>
                        
                        <Grid item xs={6}><TextField fullWidth size="small" label="Processor" value={assignData.processor} onChange={e => setAssignData({...assignData, processor: e.target.value})} /></Grid>
                        <Grid item xs={6}><TextField fullWidth size="small" label="RAM" value={assignData.ram} onChange={e => setAssignData({...assignData, ram: e.target.value})} /></Grid>
                        <Grid item xs={6}><TextField fullWidth size="small" label="Storage" value={assignData.storage_capacity} onChange={e => setAssignData({...assignData, storage_capacity: e.target.value})} /></Grid>
                        <Grid item xs={6}><TextField fullWidth size="small" label="OS" value={assignData.os} onChange={e => setAssignData({...assignData, os: e.target.value})} /></Grid>
                        <Grid item xs={12}><TextField fullWidth size="small" label="Screen Size" value={assignData.screen_size} onChange={e => setAssignData({...assignData, screen_size: e.target.value})} /></Grid>
                    </>
                )}
                
                <Grid item xs={6}><TextField fullWidth size="small" label="Emp ID" value={assignData.employee_id} onChange={e => setAssignData({...assignData, employee_id: e.target.value})} /></Grid>
                <Grid item xs={6}><TextField fullWidth size="small" label="Emp Name" value={assignData.employee_name} onChange={e => setAssignData({...assignData, employee_name: e.target.value})} /></Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setShowAssignModal(false)} color="inherit">Cancel</Button>
            <Button onClick={handleAssignSubmit} variant="contained" >Register & Assign</Button>
          </DialogActions>
        </Dialog>
      </div>
      </div>
    </ThemeProvider>
  );
};

export default AssetDetails;