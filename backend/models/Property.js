import mongoose from 'mongoose';

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
