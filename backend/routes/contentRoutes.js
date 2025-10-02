const express = require('express');
const {
  getTestimonials,
  addTestimonial,
  updateTestimonial,
  deleteTestimonial,
  getSeasonalEvent,
  updateSeasonalEvent,
  getAppSettings,
  updateAppSettings,
} = require('../controllers/contentController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router
  .route('/testimonials')
  .get(getTestimonials)
  .post(protect, authorize('admin'), addTestimonial);

router
  .route('/testimonials/:id')
  .put(protect, authorize('admin'), updateTestimonial)
  .delete(protect, authorize('admin'), deleteTestimonial);

router
    .route('/seasonalevent')
    .get(getSeasonalEvent)
    .put(protect, authorize('admin'), updateSeasonalEvent);

router
    .route('/settings')
    .get(getAppSettings)
    .put(protect, authorize('admin'), updateAppSettings);

module.exports = router;
