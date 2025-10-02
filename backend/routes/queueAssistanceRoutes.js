const express = require('express');
const {
  getPackages,
  createPackage,
  updatePackage,
  deletePackage,
  getAddOns,
  createAddOn,
  updateAddOn,
  deleteAddOn,
} = require('../controllers/queueAssistanceController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// Public routes to get active packages and addons
router.get('/packages', getPackages);
router.get('/addons', getAddOns);

// Admin-only routes for management
router.use(protect);
router.use(authorize('admin'));

router.route('/packages').post(createPackage);
router.route('/packages/:id').put(updatePackage).delete(deletePackage);

router.route('/addons').post(createAddOn);
router.route('/addons/:id').put(updateAddOn).delete(deleteAddOn);

module.exports = router;