import Simulation from '../models/Simulation.js';
import { calculateTEM, generateSchedule, calculateIndicators } from '../services/financial.service.js';
import Decimal from 'decimal.js';

// @desc    Calculate simulation (stateless)
// @route   POST /api/simulate/calculate
// @access  Private
export const calculateSimulation = async (req, res) => {
    const {
        monto_prestamo,
        tasa_valor, // Value of the rate (e.g., 10)
        tasa_tipo, // 'Nominal' or 'Efectiva'
        capitalizacion, // 'Diaria' or 'Mensual' (only for Nominal)
        plazo_meses,
        tipo_gracia,
        periodo_gracia_meses,
        bono_buen_pagador,
        seguro_desgravamen_percent,
        seguro_riesgo_percent,
    } = req.body;

    console.log('Calculate Simulation Request Body:', req.body);

    if (!monto_prestamo || !tasa_valor || !plazo_meses) {
        return res.status(400).json({ message: 'Missing required fields: monto_prestamo, tasa_valor, plazo_meses' });
    }

    try {
        // 1. Calculate TEM
        const tem = calculateTEM(tasa_valor, tasa_tipo, capitalizacion);

        // 2. Generate Schedule
        const schedule = generateSchedule({
            monto_prestamo,
            tasa_interes: tem,
            plazo_meses,
            tipo_gracia,
            periodo_gracia_meses,
            seguro_desgravamen_percent,
            seguro_riesgo_percent,
        });

        // 3. Calculate Indicators
        // Extract flows for indicators
        // Flow 0: +Loan Amount
        // Flows 1..n: -CuotaTotal
        const flows = [-parseFloat(monto_prestamo)];
        schedule.forEach(row => {
            flows.push(parseFloat(row.cuota_total));
        });


        const indicators = calculateIndicators(flows);

        res.json({
            tem: tem.toFixed(6),
            schedule,
            indicators,
        });
    } catch (error) {
        console.error(error);
        res.status(400).json({ message: error.message });
    }
};

// @desc    Save simulation
// @route   POST /api/simulate/save
// @access  Private
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

// @desc    Get simulation by ID
// @route   GET /api/simulate/:id
// @access  Private
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
