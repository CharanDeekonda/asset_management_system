const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/google', authController.googleLogin);
router.post('/logout', authController.logout);
router.get('/me', authController.getMe);

module.exports = router;