/**
 * User Model
 * Defines user schema and authentication methods
 *
 * @author Juan Carlos Angulo
 * @module models/User
 */

import mongoose from "mongoose";
import bcrypt from "bcryptjs";

/**
 * User Schema
 * @typedef {Object} UserSchema
 * @property {string} username - Unique username
 * @property {string} password - Hashed password
 * @property {string} role - User role (default: 'user')
 * @property {Date} createdAt - Creation timestamp
 * @property {Date} updatedAt - Last update timestamp
 */
const userSchema = mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      default: "user",
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Compare entered password with hashed password
 * @method matchPassword
 * @param {string} enteredPassword - Plain text password to verify
 * @returns {Promise<boolean>} True if passwords match
 */
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

const User = mongoose.model("User", userSchema);
export default User;
