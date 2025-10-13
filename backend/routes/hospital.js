const express = require('express');
const { getStates, getDistricts, getHospitals } = require('../control/hopitals');
const router = express.Router();

router.get('/states', getStates);
router.post('/districts', getDistricts);
router.post('/hospitals', getHospitals);

module.exports = router;
