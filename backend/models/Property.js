/**
 * Property Model
 * Defines schema for real estate properties
 * 
 * @author Juan Carlos Angulo
 * @module models/Property
 */

import mongoose from 'mongoose';

/**
 * Property Schema
 * @typedef {Object} PropertySchema
 * @property {string} codigo - Unique property code
 * @property {ObjectId} user - Reference to User who created this property
 * @property {string} direccion - Property address
 * @property {Decimal128} valor_venta - Sale price
 * @property {string} moneda - Currency: 'PEN' or 'USD'
 * @property {string} estado - Construction status: 'Planos', 'Construcción', or 'Terminado'
 * @property {Date} createdAt - Creation timestamp
 * @property {Date} updatedAt - Last update timestamp
 */
const propertySchema = mongoose.Schema({
    codigo: {
        type: String,
        required: true,
        unique: true,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    direccion: {
        type: String,
        required: true,
    },
    valor_venta: {
        type: mongoose.Schema.Types.Decimal128,
        required: true,
    },
    moneda: {
        type: String,
        enum: ['PEN', 'USD'],
        default: 'PEN',
        required: true,
    },
    estado: {
        type: String,
        enum: ['Planos', 'Construcción', 'Terminado'],
        required: true,
    },
}, {
    timestamps: true,
});

const Property = mongoose.model('Property', propertySchema);
export default Property;
