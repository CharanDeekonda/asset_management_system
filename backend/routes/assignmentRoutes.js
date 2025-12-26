const express = require('express');
const router = express.Router();
const assignmentController = require('../controllers/assignmentController');

router.post('/', assignmentController.assignNewAsset);

module.exports = router;