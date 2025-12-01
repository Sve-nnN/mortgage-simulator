import request from 'supertest';
import app from '../../index.js';
import User from '../../models/User.js';
import Client from '../../models/Client.js';
import jwt from 'jsonwebtoken';

describe('Client API', () => {
    let token;
    let userId;

    beforeEach(async () => {
        await User.deleteMany({});
        await Client.deleteMany({});

        // Create a user and get token
        const user = await User.create({ username: 'testuser', password: 'password123' });
        userId = user._id;
        token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    });

    describe('POST /api/clients', () => {
        it('should create a new client', async () => {
            const res = await request(app)
                .post('/api/clients')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    dni: '12345678',
                    nombres: 'John',
                    apellidos: 'Doe',
                    perfil_socioeconomico: {
                        ingresos: 5000,
                        carga_familiar: 2
                    }
                });

            expect(res.statusCode).toEqual(201);
            expect(res.body).toHaveProperty('_id');
            expect(res.body.dni).toEqual('12345678');
        });

        it('should fail without auth token', async () => {
            const res = await request(app)
                .post('/api/clients')
                .send({
                    dni: '12345678',
                    nombres: 'John',
                    apellidos: 'Doe',
                    perfil_socioeconomico: {
                        ingresos: 5000,
                        carga_familiar: 2
                    }
                });

            expect(res.statusCode).toEqual(401);
        });
    });

    describe('GET /api/clients', () => {
        it('should get all clients for user', async () => {
            await Client.create({
                user: userId,
                dni: '12345678',
                nombres: 'John',
                apellidos: 'Doe',
                perfil_socioeconomico: {
                    ingresos: 5000,
                    carga_familiar: 2
                }
            });

            const res = await request(app)
                .get('/api/clients')
                .set('Authorization', `Bearer ${token}`);

            expect(res.statusCode).toEqual(200);
            expect(res.body.length).toEqual(1);
            expect(res.body[0].dni).toEqual('12345678');
        });
    });
});
