// Unit tests for dashboard controller
import httpMocks from 'node-mocks-http';
import { getDashboardStats } from '../../controllers/dashboard.controller.js';
import Client from '../../models/Client.js';
import Property from '../../models/Property.js';
import Simulation from '../../models/Simulation.js';
import jwt from 'jsonwebtoken';

jest.mock('../../models/Client.js');
jest.mock('../../models/Property.js');
jest.mock('../../models/Simulation.js');

describe('Dashboard Controller Unit Tests', () => {
    let req, res;

    beforeEach(() => {
        req = httpMocks.createRequest();
        res = httpMocks.createResponse();
        // mock authenticated user
        req.user = { _id: 'userId123' };
        jest.clearAllMocks();
    });

    it('should return dashboard stats successfully', async () => {
        // mock model methods
        Client.countDocuments.mockResolvedValue(2);
        Property.countDocuments.mockResolvedValue(3);
        Simulation.countDocuments.mockResolvedValue(4);

        const recentSim = [{ _id: 'sim1', client_id: { nombres: 'John', apellidos: 'Doe' } }];
        Simulation.find.mockReturnValue({
            sort: () => ({
                limit: () => ({
                    populate: () => recentSim
                })
            })
        });

        Simulation.aggregate.mockResolvedValue([
            { _id: { month: 1, year: 2023 }, count: 5 },
            { _id: { month: 2, year: 2023 }, count: 3 }
        ]);

        await getDashboardStats(req, res);
        const data = JSON.parse(res._getData());
        expect(res.statusCode).toBe(200);
        expect(data.totalClients).toBe(2);
        expect(data.totalProperties).toBe(3);
        expect(data.totalSimulations).toBe(4);
        expect(data.recentSimulations).toEqual(recentSim);
        expect(data.chartData).toHaveLength(2);
    });

    it('should handle errors and return 500', async () => {
        const error = new Error('DB error');
        Client.countDocuments.mockRejectedValue(error);
        await getDashboardStats(req, res);
        const data = JSON.parse(res._getData());
        expect(res.statusCode).toBe(500);
        expect(data).toHaveProperty('message', 'Server Error');
    });
});
