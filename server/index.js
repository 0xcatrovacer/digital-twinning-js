const express = require('express')
const { pool } = require('pg')
const { getDBPool } = require('./database/dbConnection')
const { sensorRouter } = require('./routers/sensorRouter')
const net = require('net')
const http = require('http')
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

socket.on('data', function (data) {
  let jsondata = JSON.parse(data)
  let {
    timestamp,
    acc_x,
    acc_y,
    acc_z,
    velo_x,
    velo_y,
    velo_z,
    postition_x,
    postition_y,
    postition_z,
    angular_velo_x,
    angular_velo_y,
    angular_velo_z,
    angular_postition_x,
    angular_postition_y,
    angular_postition_z,
    mgm_x,
    mgm_y,
    mgm_z,
  } = jsondata
  let insertQuery =
    'INSERT INTO sensor_data (timestamp, acc_x,  acc_y, acc_z, velo_x, velo_y, velo_z, postition_x, postition_y, postition_z, angular_velo_x, angular_velo_y, angular_velo_z, angular_postition_x, angular_postition_y, angular_postition_z, mgm_x, mgm_y, mgm_z) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)'
  pgClient.query(
    insertQuery,
    [
      timestamp,
      acc_x,
      acc_y,
      acc_z,
      velo_x,
      velo_y,
      velo_z,
      postition_x,
      postition_y,
      postition_z,
      angular_velo_x,
      angular_velo_y,
      angular_velo_z,
      angular_postition_x,
      angular_postition_y,
      angular_postition_z,
      mgm_x,
      mgm_y,
      mgm_z,
    ],
    (err, res) => {
      if (err) {
        console.error('Error inserting data into PostgreSQL:', err)
      } else {
        console.log('Data inserted into PostgreSQL:', res)
      }
    }
  )
})

app.get('/test', (req, res) => {
  res.send({ status: 'ok' })
})

app.use(sensorRouter)

app.listen(port, () => {
  console.log(`Server is running on port ${port}`)
})
