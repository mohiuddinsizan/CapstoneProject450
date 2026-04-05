const express = require('express');
const discoveryController = require('../controllers/discovery.controller');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

router.get('/locations', authMiddleware, discoveryController.getLocations);
router.get('/lockers', authMiddleware, discoveryController.getLockers);
router.get('/lockers/:id', authMiddleware, discoveryController.getLockerDetails);

module.exports = router;