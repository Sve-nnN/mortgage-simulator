import mongoose from 'mongoose';

const simulationSchema = mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    client_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Client',
        required: true,
    },
    property_snapshot: {
        codigo: String,
        direccion: String,
        valor_venta: mongoose.Schema.Types.Decimal128,
        estado: String,
    },
    input_data: {
        moneda: {
            type: String,
            enum: ['PEN', 'USD'],
            default: 'PEN',
        },
        monto_prestamo: mongoose.Schema.Types.Decimal128,
        tasa_interes: mongoose.Schema.Types.Decimal128,
        tasa_valor: mongoose.Schema.Types.Decimal128,
        tasa_tipo: String,
        capitalizacion: String,
        plazo_meses: Number,
        tipo_gracia: {
            type: String,
            enum: ['Sin Gracia', 'Total', 'Parcial'],
            default: 'Sin Gracia',
        },
        periodo_gracia_meses: {
            type: Number,
            default: 0,
        },
        bono_buen_pagador: {
            type: Boolean,
            default: false,
        },
    },
    output_summary: {
        van: mongoose.Schema.Types.Decimal128,
        tir: mongoose.Schema.Types.Decimal128,
        tcea: mongoose.Schema.Types.Decimal128,
    },
    cronograma: [{
        nro_cuota: Number,
        fecha: Date,
        amortizacion: mongoose.Schema.Types.Decimal128,
        interes: mongoose.Schema.Types.Decimal128,
        cuota_total: mongoose.Schema.Types.Decimal128,
        saldo_final: mongoose.Schema.Types.Decimal128,
        seguro_desgravamen: mongoose.Schema.Types.Decimal128,
        seguro_riesgo: mongoose.Schema.Types.Decimal128,
    }],
}, {
    timestamps: true,
});

const Simulation = mongoose.model('Simulation', simulationSchema);
export default Simulation;
