const User = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/AppError");
const generateToken = require("../utils/generateToken");

const sanitizeUser = (user) => ({
  id: user._id,
  email: user.email,
  name: user.name,
  avatar: user.avatar,
  bio: user.bio,
  followersCount: user.followers.length,
  followingCount: user.followingUsers.length
});

exports.signup = asyncHandler(async (req, res) => {
  const { email, password, name, avatar, bio } = req.body;

  if (!email || !password || !name) {
    throw new AppError("Name, email, and password are required", 400);
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new AppError("Email already in use", 409);
  }

  const user = await User.create({ email, password, name, avatar, bio });
  const token = generateToken(user._id);

  res.status(201).json({
    token,
    user: sanitizeUser(user)
  });
});

exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new AppError("Email and password are required", 400);
  }

  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await user.comparePassword(password))) {
    throw new AppError("Invalid credentials", 401);
  }

  const token = generateToken(user._id);

  res.json({
    token,
    user: sanitizeUser(user)
  });
});

exports.getMe = asyncHandler(async (req, res) => {
  res.json({ user: sanitizeUser(req.user) });
});
