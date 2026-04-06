const express = require("express");

const auth = require("../middleware/auth");
const userController = require("../controllers/userController");

const router = express.Router();

router.use(auth);
router.get("/me", userController.getProfile);
router.patch("/me", userController.updateProfile);
router.get("/:id", userController.getProfile);
router.post("/:id/follow", userController.followUser);
router.delete("/:id/follow", userController.unfollowUser);

module.exports = router;
