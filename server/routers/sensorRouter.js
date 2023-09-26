const express = require('express');

const router = new express.Router();

router.post('/sensor/insert-data', async (req, res) => {
    const {
        acc_x, 
        acc_y, 
        acc_z, 
        angular_velo_x, 
        angular_velo_y, 
        angular_velo_z
    } = req.body

    try {
        await insertDataIntoDB(
            acc_x, 
            acc_y, 
            acc_z, 
            angular_velo_x, 
            angular_velo_y, 
            angular_velo_z
        );

        res.status(200).send({status: 'ok'})
    } catch (e) {
        res.status(500).send({status: 'failure'})
    }
})