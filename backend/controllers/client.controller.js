import Client from '../models/Client.js';

// @desc    Get all clients
// @route   GET /api/clients
// @access  Private
export const getClients = async (req, res) => {
    try {
        const clients = await Client.find({ user: req.user._id });
        res.json(clients);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a client
// @route   POST /api/clients
// @access  Private
export const createClient = async (req, res) => {
    const { dni, nombres, apellidos, perfil_socioeconomico } = req.body;

    try {
        const client = new Client({
            dni,
            nombres,
            apellidos,
            perfil_socioeconomico,
            user: req.user._id,
        });

        const createdClient = await client.save();
        res.status(201).json(createdClient);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Update client
// @route   PUT /api/clients/:id
// @access  Private
export const updateClient = async (req, res) => {
    try {
        const client = await Client.findById(req.params.id);

        if (!client) {
            return res.status(404).json({ message: 'Client not found' });
        }

        const updatedClient = await Client.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
        });

        res.json(updatedClient);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete client
// @route   DELETE /api/clients/:id
// @access  Private
export const deleteClient = async (req, res) => {
    try {
        const client = await Client.findById(req.params.id);

        if (!client) {
            return res.status(404).json({ message: 'Client not found' });
        }

        await client.deleteOne();
        res.json({ message: 'Client removed' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
