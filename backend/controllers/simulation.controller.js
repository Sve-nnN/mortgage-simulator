/**
 * Simulation Controller
 * Handles mortgage simulation calculations and persistence
 * 
 * @author Juan Carlos Angulo
 * @module controllers/simulation.controller
 */

import Simulation from '../models/Simulation.js';
import { calculateTEM, generateSchedule, calculateIndicators } from '../services/financial.service.js';
import Decimal from 'decimal.js';

/**
 * Calculate mortgage simulation without persisting to database
 * 
 * @async
 * @function calculateSimulation
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body containing simulation parameters
 * @param {number} req.body.monto_prestamo - Loan amount
 * @param {number} req.body.tasa_valor - Interest rate value
 * @param {string} req.body.tasa_tipo - Rate type: 'Nominal' or 'Efectiva'
 * @param {string} req.body.capitalizacion - Capitalization: 'Mensual' or 'Diaria'
 * @param {number} req.body.plazo_meses - Loan term in months
 * @param {string} req.body.tipo_gracia - Grace period type
 * @param {number} req.body.periodo_gracia_meses - Grace period duration
 * @param {boolean} req.body.bono_buen_pagador - Enable good payer bonus
 * @param {number} req.body.bono_buen_pagador_meses - Bonus duration in months
 * @param {number} req.body.bono_buen_pagador_percent - Bonus discount percentage
 * @param {number} req.body.seguro_desgravamen_percent - Credit life insurance rate
 * @param {number} req.body.seguro_riesgo_percent - Property insurance rate
 * @param {number} req.body.cok_percent - Cost of opportunity capital
 * @param {Array<Object>} req.body.costos_adicionales - Additional costs array
 * @param {number} req.body.valor_propiedad - Property value
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 * 
 * @description POST /api/simulate/calculate (Private)
 */
export const calculateSimulation = async (req, res) => {
    const {
        monto_prestamo,
        tasa_valor,
        tasa_tipo,
        capitalizacion,
        plazo_meses,
        tipo_gracia,
        periodo_gracia_meses,
        bono_buen_pagador,
        bono_buen_pagador_meses,
        bono_buen_pagador_percent,
        seguro_desgravamen_percent,
        seguro_riesgo_percent,
        cok_percent,
        costos_adicionales,
        valor_propiedad,
    } = req.body;

    if (!monto_prestamo || !tasa_valor || !plazo_meses) {
        return res.status(400).json({ message: 'Missing required fields: monto_prestamo, tasa_valor, plazo_meses' });
    }

    try {
        const tem = calculateTEM(tasa_valor, tasa_tipo, capitalizacion);

        let costosInicialesTotal = 0;
        if (costos_adicionales && costos_adicionales.length > 0) {
            costos_adicionales.forEach(costo => {
                if (costo.tipo === 'fijo') {
                    costosInicialesTotal += parseFloat(costo.valor);
                } else if (costo.tipo === 'porcentaje') {
                    let base = 0;
                    if (costo.base === 'monto_prestamo') {
                        base = parseFloat(monto_prestamo);
                    } else if (costo.base === 'valor_propiedad') {
                        base = parseFloat(valor_propiedad || monto_prestamo);
                    }
                    costosInicialesTotal += base * (parseFloat(costo.valor) / 100);
                }
            });
        }

        const schedule = generateSchedule({
            monto_prestamo,
            tasa_interes: tem,
            plazo_meses,
            tipo_gracia,
            periodo_gracia_meses,
            seguro_desgravamen_percent,
            seguro_riesgo_percent,
            bono_buen_pagador,
            bono_buen_pagador_meses,
            bono_buen_pagador_percent,
        });

        const flows = [parseFloat(monto_prestamo) - costosInicialesTotal];
        schedule.forEach(row => {
            flows.push(-parseFloat(row.cuota_total));
        });

        const indicators = calculateIndicators(flows, parseFloat(cok_percent) || 0);

        res.json({
            tem: tem.toFixed(6),
            schedule,
            indicators,
            costos_iniciales_total: costosInicialesTotal.toFixed(2),
        });
    } catch (error) {
        console.error(error);
        res.status(400).json({ message: error.message });
    }
};

/**
 * Save a simulation to database
 * 
 * @async
 * @function saveSimulation
 * @param {Object} req - Express request object
 * @param {Object} req.user - Authenticated user object
 * @param {Object} req.body - Simulation data to save
 * @param {string} req.body.client_id - Client ID reference
 * @param {Object} req.body.property_snapshot - Property details at simulation time
 * @param {Object} req.body.input_data - Input parameters used for simulation
 * @param {Object} req.body.output_summary - Calculated indicators
 * @param {Array} req.body.cronograma - Payment schedule
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 * 
 * @description POST /api/simulate/save (Private)
 */
export const saveSimulation = async (req, res) => {
    try {
        const {
            client_id,
            property_snapshot,
            input_data,
            output_summary,
            cronograma,
        } = req.body;

        const simulation = new Simulation({
            user_id: req.user._id,
            client_id,
            property_snapshot,
            input_data: {
                moneda: input_data.moneda,
                monto_prestamo: input_data.monto_prestamo,
                tasa_interes: input_data.tasa_interes,
                tasa_valor: input_data.tasa_valor,
                tasa_tipo: input_data.tasa_tipo,
                capitalizacion: input_data.capitalizacion,
                plazo_meses: input_data.plazo_meses,
                tipo_gracia: input_data.tipo_gracia,
                periodo_gracia_meses: input_data.periodo_gracia_meses,
                bono_buen_pagador: input_data.bono_buen_pagador,
            },
            output_summary,
            cronograma,
        });

        const createdSimulation = await simulation.save();
        res.status(201).json(createdSimulation);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

/**
 * Retrieve a simulation by ID
 * 
 * @async
 * @function getSimulationById
 * @param {Object} req - Express request object
 * @param {Object} req.params - URL parameters
 * @param {string} req.params.id - Simulation ID
 * @param {Object} req.user - Authenticated user object
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 * 
 * @description GET /api/simulate/:id (Private)
 */
export const getSimulationById = async (req, res) => {
    try {
        const simulation = await Simulation.findById(req.params.id)
            .populate('client_id')
            .populate('user_id', 'username email');

        if (!simulation) {
            return res.status(404).json({ message: 'Simulation not found' });
        }

        // Check if the simulation belongs to the user
        if (simulation.user_id._id.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        res.json(simulation);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};
