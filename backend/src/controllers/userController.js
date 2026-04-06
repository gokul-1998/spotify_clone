const User = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/AppError");

exports.getProfile = asyncHandler(async (req, res) => {
  const targetId = req.params.id || req.user._id;
  const user = await User.findById(targetId)
    .populate("followers", "name avatar")
    .populate("followingUsers", "name avatar");

  if (!user) {
    throw new AppError("User not found", 404);
  }

  res.json({ user });
});

exports.updateProfile = asyncHandler(async (req, res) => {
  ["name", "avatar", "bio"].forEach((field) => {
    if (req.body[field] !== undefined) {
      req.user[field] = req.body[field];
    }
  });

  await req.user.save();
  res.json({ user: req.user });
});

exports.followUser = asyncHandler(async (req, res) => {
  const targetId = req.params.id;
  if (String(req.user._id) === targetId) {
    throw new AppError("You cannot follow yourself", 400);
  }

  const targetUser = await User.findById(targetId);
  if (!targetUser) {
    throw new AppError("User not found", 404);
  }

  const alreadyFollowing = req.user.followingUsers.some(
    (userId) => String(userId) === targetId
  );

  if (!alreadyFollowing) {
    req.user.followingUsers.push(targetUser._id);
    targetUser.followers.push(req.user._id);
    await Promise.all([req.user.save(), targetUser.save()]);
  }

  res.json({ message: "User followed" });
});

exports.unfollowUser = asyncHandler(async (req, res) => {
  const targetUser = await User.findById(req.params.id);

  if (!targetUser) {
    throw new AppError("User not found", 404);
  }

  req.user.followingUsers = req.user.followingUsers.filter(
    (userId) => String(userId) !== req.params.id
  );
  targetUser.followers = targetUser.followers.filter(
    (userId) => String(userId) !== String(req.user._id)
  );

  await Promise.all([req.user.save(), targetUser.save()]);
  res.json({ message: "User unfollowed" });
});
