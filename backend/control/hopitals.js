const Hospital = require("../model/hospitals");

exports.getStates = async (req, res) => {
    try {
        const states = await Hospital.distinct('state');
        res.status(200).json(states);
    } catch (error) {
        console.error('Error fetching states:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}
exports.getDistricts = async (req, res) => {
    const { state } = req.body;
    if (!state) {
        return res.status(400).json({ message: 'State is required' });
    }
    try {
        // Trim whitespace from the input for a more robust query
        const trimmedState = state.trim();
        const districts = await Hospital.distinct('district', { state: { $regex: new RegExp(`^${trimmedState}$`, 'i') } });
        res.status(200).json(districts);
    } catch (error) { // Corrected: Added missing opening brace
        console.error('Error fetching districts:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

exports.getHospitals = async (req, res) => {
    const { state, district } = req.body;
    if (!state || !district) {
        return res.status(400).json({ message: 'State and district are required' });
    }
    try {
        const trimmedState = state.trim();
        const trimmedDistrict = district.trim();
        const query = {
            state: { $regex: new RegExp(`^${trimmedState}$`, 'i') },
            district: { $regex: new RegExp(`^${trimmedDistrict}$`, 'i') }
        };
        const hospitals = await Hospital.find(query);        
        res.status(200).json(hospitals);
    } catch (error) {
        console.error('Error fetching hospitals:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}
