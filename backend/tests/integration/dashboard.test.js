import request from 'supertest';
import app from '../../index.js';
import Client from '../../models/Client.js';
import Property from '../../models/Property.js';
import Simulation from '../../models/Simulation.js';
import User from '../../models/User.js';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';

describe('Dashboard API', () => {
    let token;

    beforeAll(async () => {
        // await User.deleteMany({});
    });

    beforeEach(async () => {
        await User.deleteMany({});
        await Client.deleteMany({});
        await Property.deleteMany({});
        await Simulation.deleteMany({});

        const user = new User({ username: 'testuser', password: 'password123' });
        await user.save();
        token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' });
    });

    it('should return dashboard stats', async () => {
        // Create some data
        await Client.create({
            dni: '12345678',
            nombres: 'Test',
            apellidos: 'Client',
            perfil_socioeconomico: { ingresos: 5000, carga_familiar: 0 },
            user: jwt.decode(token).id
        });

        await Property.create({
            codigo: 'P001',
            direccion: 'Test Address',
            valor_venta: 100000,
            estado: 'Terminado',
            moneda: 'PEN',
            user: jwt.decode(token).id
        });

        const res = await request(app)
            .get('/api/dashboard/stats')
            .set('Authorization', `Bearer ${token}`);

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('totalClients', 1);
        expect(res.body).toHaveProperty('totalProperties', 1);
        expect(res.body).toHaveProperty('totalSimulations', 0);
    });

    it('should return recent simulations', async () => {
        const userCount = await User.countDocuments();
        console.log('User count:', userCount);
        const client = await Client.create({
            dni: '87654321',
            nombres: 'Sim',
            apellidos: 'User',
            perfil_socioeconomico: { ingresos: 6000, carga_familiar: 1 },
            user: jwt.decode(token).id
        });

        const property = await Property.create({
            codigo: 'P002',
            direccion: 'Sim Address',
            valor_venta: 150000,
            estado: 'Terminado',
            moneda: 'PEN',
            user: jwt.decode(token).id
        });

        await Simulation.create({
            client_id: client._id,
            property_id: property._id,
            monto_prestamo: 120000,
            plazo_meses: 240,
            tasa_interes: 10,
            tipo_tasa: 'Efectiva',
            moneda: 'PEN',
            cuota_mensual: 1500,
            ingreso_minimo_requerido: 4000,
            user_id: jwt.decode(token).id
        });

        const res = await request(app)
            .get('/api/dashboard/stats')
            .set('Authorization', `Bearer ${token}`);

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('recentSimulations');
        expect(Array.isArray(res.body.recentSimulations)).toBe(true);
        expect(res.body.recentSimulations.length).toBe(1);
        // expect(res.body.recentSimulations[0]).toHaveProperty('client_id'); // populated
        // Check if client name is populated if possible, or just check structure
    });
});
