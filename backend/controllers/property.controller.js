/**
 * Property Controller
 * Handles CRUD operations for property management
 * 
 * @author Juan Carlos Angulo
 * @module controllers/property.controller
 */

import Property from '../models/Property.js';

/**
 * Get all properties for authenticated user
 * 
 * @async
 * @function getProperties
 * @param {Object} req - Express request object
 * @param {Object} req.user - Authenticated user object
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 * 
 * @description GET /api/properties (Private)
 */
export const getProperties = async (req, res) => {
    try {
        const properties = await Property.find({ user: req.user._id });
        res.json(properties);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * Create a new property listing
 * 
 * @async
 * @function createProperty
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body
 * @param {string} req.body.codigo - Property code
 * @param {string} req.body.direccion - Property address
 * @param {number} req.body.valor_venta - Sale price
 * @param {string} req.body.estado - Property status
 * @param {string} req.body.moneda - Currency
 * @param {Object} req.user - Authenticated user object
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 * 
 * @description POST /api/properties (Private)
 */
export const createProperty = async (req, res) => {
    const { codigo, direccion, valor_venta, estado, moneda } = req.body;

    try {
        const property = new Property({
            codigo,
            direccion,
            valor_venta,
            estado,
            moneda,
            user: req.user._id,
        });

        const createdProperty = await property.save();
        res.status(201).json(createdProperty);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

/**
 * Update existing property information
 * 
 * @async
 * @function updateProperty
 * @param {Object} req - Express request object
 * @param {Object} req.params - URL parameters
 * @param {string} req.params.id - Property ID
 * @param {Object} req.body - Updated property data
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 * 
 * @description PUT /api/properties/:id (Private)
 */
export const updateProperty = async (req, res) => {
    try {
        const property = await Property.findById(req.params.id);

        if (!property) {
            return res.status(404).json({ message: 'Property not found' });
        }

        const updatedProperty = await Property.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
        });

        res.json(updatedProperty);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

/**
 * Delete a property from database
 * 
 * @async
 * @function deleteProperty
 * @param {Object} req - Express request object
 * @param {Object} req.params - URL parameters
 * @param {string} req.params.id - Property ID
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 * 
 * @description DELETE /api/properties/:id (Private)
 */
export const deleteProperty = async (req, res) => {
    try {
        const property = await Property.findById(req.params.id);

        if (!property) {
            return res.status(404).json({ message: 'Property not found' });
        }

        await property.deleteOne();
        res.json({ message: 'Property removed' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
