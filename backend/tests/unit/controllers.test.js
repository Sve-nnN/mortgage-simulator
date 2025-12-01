import httpMocks from 'node-mocks-http';
import { createClient, getClients, updateClient, deleteClient } from '../../controllers/client.controller.js';
import { createProperty, getProperties, updateProperty, deleteProperty } from '../../controllers/property.controller.js';
import Client from '../../models/Client.js';
import Property from '../../models/Property.js';

// Mock models
jest.mock('../../models/Client.js');
jest.mock('../../models/Property.js');

describe('Controller Unit Tests', () => {
    let req, res, next;

    beforeEach(() => {
        req = httpMocks.createRequest();
        res = httpMocks.createResponse();
        next = jest.fn();
        jest.clearAllMocks();
    });

    describe('Client Controller', () => {
        it('getClients should handle errors', async () => {
            const errorMessage = { message: 'Error finding clients' };
            const rejectedPromise = Promise.reject(errorMessage);
            Client.find.mockReturnValue(rejectedPromise);
            req.user = { _id: 'userid' };

            await getClients(req, res);

            expect(res.statusCode).toBe(500);
            expect(JSON.parse(res._getData())).toEqual(errorMessage);
        });

        it('createClient should handle errors', async () => {
            const errorMessage = { message: 'Error creating client' };
            const rejectedPromise = Promise.reject(errorMessage);
            Client.prototype.save = jest.fn().mockReturnValue(rejectedPromise);
            req.body = { dni: '123' };
            req.user = { _id: 'userid' };

            await createClient(req, res);

            expect(res.statusCode).toBe(400);
            expect(JSON.parse(res._getData())).toEqual(errorMessage);
        });

        it('updateClient should handle errors', async () => {
            const errorMessage = { message: 'Error updating client' };
            const rejectedPromise = Promise.reject(errorMessage);
            Client.findById.mockReturnValue(rejectedPromise);
            req.params.id = 'clientid';

            await updateClient(req, res);

            expect(res.statusCode).toBe(400);
            expect(JSON.parse(res._getData())).toEqual(errorMessage);
        });

        it('deleteClient should handle errors', async () => {
            const errorMessage = { message: 'Error deleting client' };
            const rejectedPromise = Promise.reject(errorMessage);
            Client.findById.mockReturnValue(rejectedPromise);
            req.params.id = 'clientid';

            await deleteClient(req, res);

            expect(res.statusCode).toBe(400);
            expect(JSON.parse(res._getData())).toEqual(errorMessage);
        });
    });

    describe('Property Controller', () => {
        it('getProperties should handle errors', async () => {
            const errorMessage = { message: 'Error finding properties' };
            const rejectedPromise = Promise.reject(errorMessage);
            Property.find.mockReturnValue(rejectedPromise);
            req.user = { _id: 'userid' };

            await getProperties(req, res);

            expect(res.statusCode).toBe(500);
            expect(JSON.parse(res._getData())).toEqual(errorMessage);
        });

        it('createProperty should handle errors', async () => {
            const errorMessage = { message: 'Error creating property' };
            const rejectedPromise = Promise.reject(errorMessage);
            Property.prototype.save = jest.fn().mockReturnValue(rejectedPromise);
            req.body = { codigo: 'P01' };
            req.user = { _id: 'userid' };

            await createProperty(req, res);

            expect(res.statusCode).toBe(400);
            expect(JSON.parse(res._getData())).toEqual(errorMessage);
        });
    });
});

describe('Simple Test', () => {
    it('should pass', () => {
        expect(true).toBe(true);
    });
});
