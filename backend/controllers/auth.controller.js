/**
 * Authentication Controller
 * Handles user authentication and registration
 *
 * @author Juan Carlos Angulo
 * @module controllers/auth.controller
 */

import User from "../models/User.js";
import jwt from "jsonwebtoken";

/**
 * Generate JWT token for authenticated user
 *
 * @private
 * @param {string} id - User ID
 * @returns {string} JWT token
 */
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

/**
 * Authenticate user and return JWT token
 *
 * @async
 * @function authUser
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body
 * @param {string} req.body.username - Username
 * @param {string} req.body.password - Password
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 *
 * @description POST /api/auth/login (Public)
 */
export const authUser = async (req, res) => {
  const { username, password } = req.body;

  const user = await User.findOne({ username });

  if (user && (await user.matchPassword(password))) {
    res.json({
      _id: user._id,
      username: user.username,
      role: user.role,
      token: generateToken(user._id),
    });
  } else {
    res.status(401).json({ message: "Invalid username or password" });
  }
};

/**
 * Register a new user account
 *
 * @async
 * @function registerUser
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body
 * @param {string} req.body.username - Desired username
 * @param {string} req.body.password - Password
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 *
 * @description POST /api/auth/register (Public)
 */

export const registerUser = async (req, res) => {
  const { username, password } = req.body;

  const userExists = await User.findOne({ username });

  if (userExists) {
    res.status(400).json({ message: "User already exists" });
    return;
  }

  const user = await User.create({
    username,
    password,
  });

  if (user) {
    res.status(201).json({
      _id: user._id,
      username: user.username,
      role: user.role,
      token: generateToken(user._id),
    });
  } else {
    res.status(400).json({ message: "Invalid user data" });
  }
};
