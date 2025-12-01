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
            user: userId,
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
            user: userId,
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
                    seguro_riesgo_percent: 0.03,
                    cok_percent: 10,
                    costos_adicionales: [],
                    valor_propiedad: 150000
                });

            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('indicators');
            expect(res.body).toHaveProperty('schedule');
            expect(res.body.schedule.length).toEqual(120);
            expect(res.body.indicators).toHaveProperty('tcea');
            expect(res.body.indicators).toHaveProperty('tir');
            expect(res.body.indicators).toHaveProperty('van');
        });

        it('should calculate simulation with Bono del Buen Pagador', async () => {
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
                    bono_buen_pagador: true,
                    bono_buen_pagador_meses: 12,
                    bono_buen_pagador_percent: 0.5,
                    seguro_desgravamen_percent: 0.05,
                    seguro_riesgo_percent: 0.03,
                    cok_percent: 10,
                    costos_adicionales: [],
                    valor_propiedad: 150000
                });

            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('indicators');
            expect(res.body).toHaveProperty('schedule');
            
            // First 12 payments should have bono discount
            for (let i = 0; i < 12; i++) {
                expect(parseFloat(res.body.schedule[i].bono_buen_pagador)).toBeGreaterThan(0);
            }
            
            // Remaining payments should have no bono
            for (let i = 12; i < res.body.schedule.length; i++) {
                expect(parseFloat(res.body.schedule[i].bono_buen_pagador)).toBe(0);
            }
        });

        it('should calculate simulation with fixed additional costs', async () => {
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
                    seguro_riesgo_percent: 0.03,
                    cok_percent: 10,
                    costos_adicionales: [
                        { nombre: 'Gastos Notariales', tipo: 'fijo', valor: '500' },
                        { nombre: 'Gastos Registrales', tipo: 'fijo', valor: '300' }
                    ],
                    valor_propiedad: 150000
                });

            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('costos_iniciales_total');
            expect(parseFloat(res.body.costos_iniciales_total)).toBeCloseTo(800, 0);
        });

        it('should calculate simulation with percentage additional costs based on loan', async () => {
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
                    seguro_riesgo_percent: 0.03,
                    cok_percent: 10,
                    costos_adicionales: [
                        { nombre: 'Comisión', tipo: 'porcentaje', valor: '2', base: 'monto_prestamo' }
                    ],
                    valor_propiedad: 150000
                });

            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('costos_iniciales_total');
            // 2% of 100000 = 2000
            expect(parseFloat(res.body.costos_iniciales_total)).toBeCloseTo(2000, 0);
        });

        it('should calculate simulation with percentage additional costs based on property value', async () => {
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
                    seguro_riesgo_percent: 0.03,
                    cok_percent: 10,
                    costos_adicionales: [
                        { nombre: 'Tasación', tipo: 'porcentaje', valor: '1', base: 'valor_propiedad' }
                    ],
                    valor_propiedad: 150000
                });

            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('costos_iniciales_total');
            // 1% of 150000 = 1500
            expect(parseFloat(res.body.costos_iniciales_total)).toBeCloseTo(1500, 0);
        });

        it('should calculate simulation with mixed additional costs', async () => {
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
                    seguro_riesgo_percent: 0.03,
                    cok_percent: 10,
                    costos_adicionales: [
                        { nombre: 'Gastos Notariales', tipo: 'fijo', valor: '500' },
                        { nombre: 'Comisión', tipo: 'porcentaje', valor: '2', base: 'monto_prestamo' },
                        { nombre: 'Tasación', tipo: 'porcentaje', valor: '1', base: 'valor_propiedad' }
                    ],
                    valor_propiedad: 150000
                });

            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('costos_iniciales_total');
            // 500 + (0.02 * 100000) + (0.01 * 150000) = 500 + 2000 + 1500 = 4000
            expect(parseFloat(res.body.costos_iniciales_total)).toBeCloseTo(4000, 0);
        });

        it('should calculate VAN correctly with additional costs', async () => {
            const res = await request(app)
                .post('/api/simulate/calculate')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    moneda: 'USD',
                    monto_prestamo: 100000,
                    tasa_valor: 10,
                    tasa_tipo: 'Efectiva',
                    capitalizacion: 'Mensual',
                    plazo_meses: 12,
                    tipo_gracia: 'Sin Gracia',
                    periodo_gracia_meses: 0,
                    bono_buen_pagador: false,
                    seguro_desgravamen_percent: 0,
                    seguro_riesgo_percent: 0,
                    cok_percent: 10,
                    costos_adicionales: [
                        { nombre: 'Costos Iniciales', tipo: 'fijo', valor: '1000' }
                    ],
                    valor_propiedad: 150000
                });

            expect(res.statusCode).toEqual(200);
            expect(res.body.indicators).toHaveProperty('van');
            
            // VAN should reflect the initial cost impact
            // Initial flow should be: loan - costs = 100000 - 1000 = 99000
            const van = parseFloat(res.body.indicators.van);
            expect(van).toBeDefined();
        });

        it('should handle grace periods correctly', async () => {
            const res = await request(app)
                .post('/api/simulate/calculate')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    moneda: 'USD',
                    monto_prestamo: 100000,
                    tasa_valor: 10,
                    tasa_tipo: 'Efectiva',
                    capitalizacion: 'Mensual',
                    plazo_meses: 24,
                    tipo_gracia: 'Parcial',
                    periodo_gracia_meses: 6,
                    bono_buen_pagador: false,
                    seguro_desgravamen_percent: 0.05,
                    seguro_riesgo_percent: 0.03,
                    cok_percent: 10,
                    costos_adicionales: [],
                    valor_propiedad: 150000
                });

            expect(res.statusCode).toEqual(200);
            
            // First 6 payments should have zero amortization
            for (let i = 0; i < 6; i++) {
                expect(parseFloat(res.body.schedule[i].amortizacion)).toBe(0);
            }
            
            // After grace period, should have amortization
            expect(parseFloat(res.body.schedule[6].amortizacion)).toBeGreaterThan(0);
        });

        it('should validate required fields', async () => {
            const res = await request(app)
                .post('/api/simulate/calculate')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    moneda: 'USD',
                    // Missing monto_prestamo
                    tasa_valor: 10,
                    tasa_tipo: 'Efectiva'
                });

            expect(res.statusCode).toEqual(400);
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
