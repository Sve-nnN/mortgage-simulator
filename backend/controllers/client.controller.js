/**
 * Client Controller
 * Handles CRUD operations for client management
 * 
 * @author Juan Carlos Angulo
 * @module controllers/client.controller
 */

import Client from '../models/Client.js';

/**
 * Get all clients for authenticated user
 * 
 * @async
 * @function getClients
 * @param {Object} req - Express request object
 * @param {Object} req.user - Authenticated user object
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 * 
 * @description GET /api/clients (Private)
 */
export const getClients = async (req, res) => {
    try {
        const clients = await Client.find({ user: req.user._id });
        res.json(clients);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * Create a new client
 * 
 * @async
 * @function createClient
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body
 * @param {string} req.body.dni - Client ID number
 * @param {string} req.body.nombres - First name(s)
 * @param {string} req.body.apellidos - Last name(s)
 * @param {Object} req.body.perfil_socioeconomico - Socioeconomic profile
 * @param {Object} req.user - Authenticated user object
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 * 
 * @description POST /api/clients (Private)
 */
export const createClient = async (req, res) => {
    const { dni, nombres, apellidos, perfil_socioeconomico } = req.body;

    try {
        const client = new Client({
            dni,
            nombres,
            apellidos,
            perfil_socioeconomico,
            user: req.user._id,
        });

        const createdClient = await client.save();
        res.status(201).json(createdClient);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

/**
 * Update existing client information
 * 
 * @async
 * @function updateClient
 * @param {Object} req - Express request object
 * @param {Object} req.params - URL parameters
 * @param {string} req.params.id - Client ID
 * @param {Object} req.body - Updated client data
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 * 
 * @description PUT /api/clients/:id (Private)
 */
export const updateClient = async (req, res) => {
    try {
        const client = await Client.findById(req.params.id);

        if (!client) {
            return res.status(404).json({ message: 'Client not found' });
        }

        const updatedClient = await Client.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
        });

        res.json(updatedClient);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

/**
 * Delete a client from database
 * 
 * @async
 * @function deleteClient
 * @param {Object} req - Express request object
 * @param {Object} req.params - URL parameters
 * @param {string} req.params.id - Client ID
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 * 
 * @description DELETE /api/clients/:id (Private)
 */
export const deleteClient = async (req, res) => {
    try {
        const client = await Client.findById(req.params.id);

        if (!client) {
            return res.status(404).json({ message: 'Client not found' });
        }

        await client.deleteOne();
        res.json({ message: 'Client removed' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
