import request from 'supertest';
import app from '../../index.js';
import User from '../../models/User.js';
import Client from '../../models/Client.js';
import Property from '../../models/Property.js';
import Simulation from '../../models/Simulation.js';
import jwt from 'jsonwebtoken';

describe('Simulation API', () => {
    let token;
    let userId;
    let clientId;
    let propertyId;

    beforeEach(async () => {
        await User.deleteMany({});
        await Client.deleteMany({});
        await Property.deleteMany({});
        await Simulation.deleteMany({});

        const user = await User.create({ username: 'testuser', password: 'password123' });
        userId = user._id;
        token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        const client = await Client.create({
            user_id: userId,
            dni: '12345678',
            nombres: 'John',
            apellidos: 'Doe',
            perfil_socioeconomico: {
                ingresos: 5000,
                carga_familiar: 2
            }
        });
        clientId = client._id;

        const property = await Property.create({
            user_id: userId,
            codigo: 'PROP001',
            direccion: '123 Main St',
            valor_venta: 150000,
            moneda: 'USD',
            estado: 'Terminado'
        });
        propertyId = property._id;
    });

    describe('POST /api/simulate/calculate', () => {
        it('should calculate simulation results', async () => {
            const res = await request(app)
                .post('/api/simulate/calculate')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    moneda: 'USD',
                    monto_prestamo: 100000,
                    tasa_valor: 10,
                    tasa_tipo: 'Efectiva',
                    capitalizacion: 'Mensual',
                    plazo_meses: 120,
                    tipo_gracia: 'Sin Gracia',
                    periodo_gracia_meses: 0,
                    bono_buen_pagador: false,
                    seguro_desgravamen_percent: 0.05,
                    seguro_riesgo_percent: 0.03
                });

            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('indicators');
            expect(res.body).toHaveProperty('schedule');
            expect(res.body.schedule.length).toEqual(120);
        });
    });

    describe('POST /api/simulate/save', () => {
        it('should save a simulation', async () => {
            // First calculate
            const calcRes = await request(app)
                .post('/api/simulate/calculate')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    moneda: 'USD',
                    monto_prestamo: 100000,
                    tasa_valor: 10,
                    tasa_tipo: 'Efectiva',
                    capitalizacion: 'Mensual',
                    plazo_meses: 120,
                    tipo_gracia: 'Sin Gracia',
                    periodo_gracia_meses: 0,
                    bono_buen_pagador: false,
                    seguro_desgravamen_percent: 0.05,
                    seguro_riesgo_percent: 0.03
                });

            const res = await request(app)
                .post('/api/simulate/save')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    client_id: clientId,
                    property_snapshot: {
                        codigo: 'PROP001',
                        direccion: '123 Main St',
                        valor_venta: 150000,
                        estado: 'Terminado'
                    },
                    input_data: {
                        moneda: 'USD',
                        monto_prestamo: 100000,
                        tasa_interes: calcRes.body.tem,
                        tasa_valor: 10,
                        tasa_tipo: 'Efectiva',
                        capitalizacion: 'Mensual',
                        plazo_meses: 120,
                        tipo_gracia: 'Sin Gracia',
                        periodo_gracia_meses: 0,
                        bono_buen_pagador: false
                    },
                    output_summary: calcRes.body.indicators,
                    cronograma: calcRes.body.schedule
                });

            expect(res.statusCode).toEqual(201);
            expect(res.body).toHaveProperty('_id');
        });
    });
});
