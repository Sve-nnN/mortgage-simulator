import request from 'supertest';
import app from '../../index.js';
import User from '../../models/User.js';
import Property from '../../models/Property.js';
import jwt from 'jsonwebtoken';

describe('Property API', () => {
    let token;
    let userId;

    beforeEach(async () => {
        await User.deleteMany({});
        await Property.deleteMany({});

        const user = await User.create({ username: 'testuser', password: 'password123' });
        userId = user._id;
        token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    });

    describe('POST /api/properties', () => {
        it('should create a new property', async () => {
            const res = await request(app)
                .post('/api/properties')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    codigo: 'PROP001',
                    direccion: '123 Main St',
                    valor_venta: 150000,
                    moneda: 'USD',
                    estado: 'Terminado'
                });

            expect(res.statusCode).toEqual(201);
            expect(res.body).toHaveProperty('_id');
            expect(res.body.codigo).toEqual('PROP001');
            expect(res.body.moneda).toEqual('USD');
        });
    });

    describe('GET /api/properties', () => {
        it('should get all properties for user', async () => {
            await Property.create({
                user: userId,
                codigo: 'PROP001',
                direccion: '123 Main St',
                valor_venta: 150000,
                moneda: 'USD',
                estado: 'Terminado'
            });

            const res = await request(app)
                .get('/api/properties')
                .set('Authorization', `Bearer ${token}`);

            expect(res.statusCode).toEqual(200);
            expect(res.body.length).toEqual(1);
            expect(res.body[0].codigo).toEqual('PROP001');
        });
    });
});
