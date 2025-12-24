const express = require('express');
const router = express.Router();
const assetController = require('../controllers/assetController');


router.get('/details/:typeName', assetController.getAssetDetailsByCategory);
router.post('/', assetController.addAsset);
router.get('/type/:typeId', assetController.getAssetsByType);
// -----------
router.get('/id/:assetId', assetController.getAssetDetails); 
router.get('/history/:assetId', assetController.getAssetHistory);
router.post('/reassign', assetController.reassignAsset);

module.exports = router;