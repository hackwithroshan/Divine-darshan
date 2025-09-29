const User = require('../models/User');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');

// @desc      Get all users
// @route     GET /api/users
// @access    Private/Admin
exports.getUsers = asyncHandler(async (req, res, next) => {
  const users = await User.find();

  res.status(200).json({
    success: true,
    count: users.length,
    data: users,
  });
});

// @desc      Get single user
// @route     GET /api/users/:id
// @access    Private/Admin
exports.getUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(
      new ErrorResponse(`User not found with id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({ success: true, data: user });
});

// @desc      Create user
// @route     POST /api/users
// @access    Private/Admin
exports.createUser = asyncHandler(async (req, res, next) => {
  const user = await User.create(req.body);
  res.status(201).json({ success: true, data: user });
});

// @desc      Update user
// @route     PUT /api/users/:id
// @access    Private/Admin
exports.updateUser = asyncHandler(async (req, res, next) => {
  const userId = req.params.id;
  const { name, email, mobile, role, password, assignedTempleId } = req.body;

  let user = await User.findById(userId);

  if (!user) {
    return next(new ErrorResponse(`User not found with id of ${userId}`, 404));
  }
  
  // Update fields from request body
  user.name = name;
  user.email = email;
  user.mobile = mobile;
  user.role = role;

  // Conditionally set assignedTempleId. If role is not temple_manager, it should be cleared.
  if (role === 'temple_manager' && assignedTempleId) {
    user.assignedTempleId = assignedTempleId;
  } else {
    user.assignedTempleId = undefined;
  }

  // If a new password is provided, it will be hashed by the pre-save hook
  if (password) {
    user.password = password;
  }

  await user.save();
  
  // Fetch again to exclude password from the response
  const updatedUser = await User.findById(userId);

  res.status(200).json({ success: true, data: updatedUser });
});


// @desc      Delete user
// @route     DELETE /api/users/:id
// @access    Private/Admin
exports.deleteUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  
  if (!user) {
    return next(
      new ErrorResponse(`User not found with id of ${req.params.id}`, 404)
    );
  }
  
  await user.deleteOne();

  res.status(200).json({ success: true, data: {} });
});