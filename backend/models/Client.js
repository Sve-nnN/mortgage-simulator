import mongoose from 'mongoose';

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
