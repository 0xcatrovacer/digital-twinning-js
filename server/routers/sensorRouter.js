const express = require('express');
const { insertDataIntoDB } = require('../helpers/sensorHelper');
const { getDBPool } = require('../database/dbConnection');

const router = new express.Router();
router.get('sensor/fetch-data', async (req, res) => {
    try{
        const json_data = await getDataFromDB();

        res.status(200).send({status: 'ok', data: json_data})
    } catch(e){
        res.status(500).send({status: 'failure'})
    }
})

router.post('/sensor/insert-data', async (req, res) => {
    const {
        acc_x, 
        acc_y, 
        acc_z, 
        angular_velo_x, 
        angular_velo_y, 
        angular_velo_z,
        mgm_x,
        mgm_y,
        mgm_z
    } = req.body

    const pool = getDBPool(100);
    let client;

    try {
        client = await pool.connect();

        await insertDataIntoDB(
            client,
            acc_x, 
            acc_y, 
            acc_z, 
            angular_velo_x, 
            angular_velo_y, 
            angular_velo_z,
            mgm_x,
            mgm_y,
            mgm_z
        );

        res.status(200).send({status: 'ok'})
    } catch (e) {
        res.status(500).send({status: 'failure'})
    }
})

module.exports = {
    sensorRouter
}