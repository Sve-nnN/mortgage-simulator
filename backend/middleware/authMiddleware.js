/**
 * Authentication Middleware
 * Protects routes by verifying JWT tokens
 * 
 * @author Juan Carlos Angulo
 * @module middleware/authMiddleware
 */

import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/**
 * Middleware to protect routes requiring authentication
 * Verifies JWT token and attaches user object to request
 * 
 * @async
 * @function protect
 * @param {Object} req - Express request object
 * @param {Object} req.headers - Request headers
 * @param {string} req.headers.authorization - Authorization header with Bearer token
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 * 
 * @throws {401} If token is missing, invalid, or user not found
 * 
 * @example
 * // Usage in routes
 * router.get('/protected', protect, (req, res) => {
 *   // req.user is now available
 * });
 */
const protect = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            token = req.headers.authorization.split(' ')[1];

            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            req.user = await User.findById(decoded.id).select('-password');

            if (!req.user) {
                return res.status(401).json({ message: 'User not found' });
            }

            next();
        } catch (error) {
            console.error(error);
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};

export { protect };
