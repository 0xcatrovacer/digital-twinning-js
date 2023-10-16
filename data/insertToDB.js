const fs = require('fs');
const { insertDataIntoDB } = require('../server/helpers/sensorHelper');
const { getDBPool } = require('../server/database/dbConnection');
const csv = require('csv-parser');

const rows = [];

const readCSV = async (filePath) => {
    return new Promise((resolve, reject) => {
        fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (row) => {
            rows.push(row)
        })
        .on('end', () => {
            resolve(rows);
        })
        .on('error', (error) => {
            reject(error);
        });
    });
}

readCSV('./parsed-csv-data/output_data_adl12.csv');

const createParameters = (count) => {
    let params = [];
    for (let i = 1; i <= count; i++) {
        params.push(`$${i}`);
    }
    return params.join(",");
};

const pool = getDBPool(100);

const parseCSV = async () => {
    const client = await pool.connect();

    const columns = [
            'timestamp',
            'acc_x', 
            'acc_y', 
            'acc_z',
            'velo_x',
            'velo_y',
            'velo_z',
            'position_x',
            'position_y',
            'position_z',
            'angular_velo_x', 
            'angular_velo_y', 
            'angular_velo_z',
            'angular_position_x',
            'angular_position_y',
            'angular_position_z',
            'mgm_x',
            'mgm_y',
            'mgm_z'
        ]

        values = [
            new Date(),
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0
        ]

    const paramsQuery = createParameters(columns.length);

    const deleteQuery = `DELETE FROM public.sensor_data`;

    await client.query(deleteQuery);

    const insertQuery = `INSERT INTO public.sensor_data (${[...columns].join(",")}) VALUES(${paramsQuery}) ON CONFLICT DO NOTHING`;


    await client.query(insertQuery, values);

    for (let row of rows) {
        await insertDataIntoDB(client, row.acc_x, row.acc_y, row.acc_z, row.gyro_x, row.gyro_y, row.gyro_z, row.mgm_x, row.mgm_y, row.mgm_z, 0.05);
    }

    console.log('CSV data inserted')
}

parseCSV();