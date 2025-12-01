/**
 * Dashboard Controller
 * Provides aggregated statistics and metrics for dashboard view
 * 
 * @author Juan Carlos Angulo
 * @module controllers/dashboard.controller
 */

import Client from '../models/Client.js';
import Property from '../models/Property.js';
import Simulation from '../models/Simulation.js';

/**
 * Get dashboard statistics including counts and recent activity
 * 
 * @async
 * @function getDashboardStats
 * @param {Object} req - Express request object
 * @param {Object} req.user - Authenticated user object
 * @param {Object} res - Express response object
 * @returns {Promise<void>} Returns statistics object with totals, recent simulations, and chart data
 * 
 * @description GET /api/dashboard/stats (Private)
 */
export const getDashboardStats = async (req, res) => {
    try {
        const totalClients = await Client.countDocuments({ user: req.user._id });

        const totalProperties = await Property.countDocuments({});
        const totalSimulations = await Simulation.countDocuments({ user_id: req.user._id });

        // Recent simulations
        const recentSimulations = await Simulation.find({ user_id: req.user._id })
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('client_id', 'nombres apellidos dni');

        // Chart data: Simulations per month (last 6 months)
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const simulationsPerMonth = await Simulation.aggregate([
            {
                $match: {
                    user_id: req.user._id,
                    createdAt: { $gte: sixMonthsAgo }
                }
            },
            {
                $group: {
                    _id: {
                        month: { $month: "$createdAt" },
                        year: { $year: "$createdAt" }
                    },
                    count: { $sum: 1 }
                }
            },
            { $sort: { "_id.year": 1, "_id.month": 1 } }
        ]);

        // Format chart data for frontend
        const chartData = simulationsPerMonth.map(item => {
            const date = new Date(item._id.year, item._id.month - 1);
            return {
                name: date.toLocaleString('default', { month: 'short' }),
                simulations: item.count
            };
        });

        res.json({
            totalClients,
            totalProperties,
            totalSimulations,
            recentSimulations,
            chartData
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};
