import Property from '../models/Property.js';

// @desc    Get all properties
// @route   GET /api/properties
// @access  Private
export const getProperties = async (req, res) => {
    try {
        const properties = await Property.find({ user: req.user._id });
        res.json(properties);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a property
// @route   POST /api/properties
// @access  Private
export const createProperty = async (req, res) => {
    const { codigo, direccion, valor_venta, estado, moneda } = req.body;

    try {
        const property = new Property({
            codigo,
            direccion,
            valor_venta,
            estado,
            moneda,
            user: req.user._id,
        });

        const createdProperty = await property.save();
        res.status(201).json(createdProperty);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Update property
// @route   PUT /api/properties/:id
// @access  Private
export const updateProperty = async (req, res) => {
    try {
        const property = await Property.findById(req.params.id);

        if (!property) {
            return res.status(404).json({ message: 'Property not found' });
        }

        const updatedProperty = await Property.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
        });

        res.json(updatedProperty);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete property
// @route   DELETE /api/properties/:id
// @access  Private
export const deleteProperty = async (req, res) => {
    try {
        const property = await Property.findById(req.params.id);

        if (!property) {
            return res.status(404).json({ message: 'Property not found' });
        }

        await property.deleteOne();
        res.json({ message: 'Property removed' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
