/**
 * Client Model
 * Defines client schema for mortgage applicants
 * 
 * @author Juan Carlos Angulo
 * @module models/Client
 */

import mongoose from 'mongoose';

/**
 * Client Schema
 * @typedef {Object} ClientSchema
 * @property {string} dni - National ID number (unique)
 * @property {ObjectId} user - Reference to User who created this client
 * @property {string} nombres - First name(s)
 * @property {string} apellidos - Last name(s)
 * @property {Object} perfil_socioeconomico - Socioeconomic profile
 * @property {Decimal128} perfil_socioeconomico.ingresos - Monthly income
 * @property {number} perfil_socioeconomico.carga_familiar - Number of dependents
 * @property {Date} createdAt - Creation timestamp
 * @property {Date} updatedAt - Last update timestamp
 */
const clientSchema = mongoose.Schema({
    dni: {
        type: String,
        required: true,
        unique: true,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    nombres: {
        type: String,
        required: true,
    },
    apellidos: {
        type: String,
        required: true,
    },
    perfil_socioeconomico: {
        ingresos: {
            type: mongoose.Schema.Types.Decimal128,
            required: true,
        },
        carga_familiar: {
            type: Number,
            default: 0,
        },
    },
}, {
    timestamps: true,
});

const Client = mongoose.model('Client', clientSchema);
export default Client;
