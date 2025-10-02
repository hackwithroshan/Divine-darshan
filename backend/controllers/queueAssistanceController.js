const QueueAssistancePackage = require('../models/QueueAssistancePackage');
const QueueAssistanceAddOn = require('../models/QueueAssistanceAddOn');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');

// --- Package Controllers ---

// @desc      Get all queue assistance packages
// @route     GET /api/queue-assistance/packages
// @access    Public
exports.getPackages = asyncHandler(async (req, res, next) => {
  // If the user is not an admin, only return active packages
  const query = req.user?.role === 'admin' ? {} : { active: true };
  const packages = await QueueAssistancePackage.find(query).sort('order');
  res.status(200).json({ success: true, count: packages.length, data: packages });
});

// @desc      Create a queue assistance package
// @route     POST /api/queue-assistance/packages
// @access    Private/Admin
exports.createPackage = asyncHandler(async (req, res, next) => {
  const newPackage = await QueueAssistancePackage.create(req.body);
  res.status(201).json({ success: true, data: newPackage });
});

// @desc      Update a queue assistance package
// @route     PUT /api/queue-assistance/packages/:id
// @access    Private/Admin
exports.updatePackage = asyncHandler(async (req, res, next) => {
  let pkg = await QueueAssistancePackage.findById(req.params.id);
  if (!pkg) {
    return next(new ErrorResponse(`Package not found with id of ${req.params.id}`, 404));
  }
  pkg = await QueueAssistancePackage.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({ success: true, data: pkg });
});

// @desc      Delete a queue assistance package
// @route     DELETE /api/queue-assistance/packages/:id
// @access    Private/Admin
exports.deletePackage = asyncHandler(async (req, res, next) => {
  const pkg = await QueueAssistancePackage.findById(req.params.id);
  if (!pkg) {
    return next(new ErrorResponse(`Package not found with id of ${req.params.id}`, 404));
  }
  await pkg.deleteOne();
  res.status(200).json({ success: true, data: {} });
});


// --- Add-on Controllers ---

// @desc      Get all queue assistance add-ons
// @route     GET /api/queue-assistance/addons
// @access    Public
exports.getAddOns = asyncHandler(async (req, res, next) => {
  const query = req.user?.role === 'admin' ? {} : { active: true };
  const addOns = await QueueAssistanceAddOn.find(query);
  res.status(200).json({ success: true, count: addOns.length, data: addOns });
});

// @desc      Create a queue assistance add-on
// @route     POST /api/queue-assistance/addons
// @access    Private/Admin
exports.createAddOn = asyncHandler(async (req, res, next) => {
  const newAddOn = await QueueAssistanceAddOn.create(req.body);
  res.status(201).json({ success: true, data: newAddOn });
});

// @desc      Update a queue assistance add-on
// @route     PUT /api/queue-assistance/addons/:id
// @access    Private/Admin
exports.updateAddOn = asyncHandler(async (req, res, next) => {
  let addOn = await QueueAssistanceAddOn.findById(req.params.id);
  if (!addOn) {
    return next(new ErrorResponse(`Add-on not found with id of ${req.params.id}`, 404));
  }
  addOn = await QueueAssistanceAddOn.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({ success: true, data: addOn });
});

// @desc      Delete a queue assistance add-on
// @route     DELETE /api/queue-assistance/addons/:id
// @access    Private/Admin
exports.deleteAddOn = asyncHandler(async (req, res, next) => {
  const addOn = await QueueAssistanceAddOn.findById(req.params.id);
  if (!addOn) {
    return next(new ErrorResponse(`Add-on not found with id of ${req.params.id}`, 404));
  }
  await addOn.deleteOne();
  res.status(200).json({ success: true, data: {} });
});