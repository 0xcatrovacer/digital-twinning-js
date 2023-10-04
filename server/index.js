const express = require('express')
const { pool } = require('pg')
const { getDBPool } = require('./database/dbConnection')
const { sensorRouter } = require('./routers/sensorRouter')
const { insertDataIntoDB } = require('./helpers/sensorHelper')
const net = require('net')
const http = require('http')
const { error } = require('console')
const app = express()
const port = process.env.PORT || 8000
const pgClient = getDBPool()

pgClient.connect()

const thost = process.env.SENSOR_HOST
const tport = process.env.SENSOR_PORT

const socket = net.createConnection(tport, thost)

socket.on('connect', (connect) => {
  console.log('Sensor Connected.')
  socket.setEncoding('utf-8')
})

socket.on('data', async function (data) {
  try {
    let jsondata = JSON.parse(data)
    let {
      acc_x,
      acc_y,
      acc_z,
      angular_velo_x,
      angular_velo_y,
      angular_velo_z,
      mgm_x,
      mgm_y,
      mgm_z,
    } = jsondata
    insertDataIntoDB(
      acc_x,
      acc_y,
      acc_z,
      angular_velo_x,
      angular_velo_y,
      angular_velo_z,
      mgm_x,
      mgm_y,
      mgm_z
    )
    const sqlQuery = 'SELECT COUNT(*) AS rowCount FROM public.sensor_data';
    let l = sqlQuery;
    setTimeout(()={
      let m= sqlQuery;
      if(l === m){
        throw new Error('No new data found');

      }
    }, 5000);

  } catch (error) {
    console.error('error inserting data', error)
  }
})

app.get('/test', (req, res) => {
  res.send({ status: 'ok' })
})

app.use(sensorRouter)

app.listen(port, () => {
  console.log(`Server is running on port ${port}`)
})
