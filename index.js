const cool = require('cool-ascii-faces');
const express = require('express')
const cors = require('cors');
const path = require('path')
const PORT = process.env.PORT || 5000
const { Pool } = require('pg');

const connectionString = 'postgresql://localhost:5432/kammer'
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || connectionString,
  ssl: {
    rejectUnauthorized: false
  }
});

const postLog = async (request, response) => {
  // console.log(request.body)
  let sessionid = 'foo'
  let timecode = request.body.entryDate
  let eventid = request.body.extraInfo[0][0]
  let ticketid = request.body.extraInfo[0][1]
  let statusid = request.body.extraInfo[0][2]

  try {
    const client = await pool.connect();
    const result = await client.query('INSERT INTO logging_events (sessionid, timecode, eventid, ticketid, statusid) VALUES ($1, $2, $3, $4, $5)', [sessionid, timecode, eventid, ticketid, statusid]);
    response.status(201).json(`{ message: 'Log added' }`) 
    client.release();
  } catch (err) {
    console.error(err);
    res.send("Error " + err);
  }
}

const app = express()
  .use(cors({
    origin: ['http://localhost:4200', 'https://elenalenaelena.github.io']
  }))
  .use(express.json())
  .use(express.static(path.join(__dirname, 'public')))
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')
  .get('/', (req, res) => res.render('pages/index'))
  .get('/db', async (req, res) => {
    try {
      const client = await pool.connect();
      const result = await client.query('SELECT * FROM logging_events');
      const results = { 'results': (result) ? result.rows : null};
      res.render('pages/db', results );
      client.release();
    } catch (err) {
      console.error(err);
      res.send("Error " + err);
    }
  })
  .get('/cool', (req, res) => res.send(cool()))
  .post('/log', (req, res) => postLog(req, res))
  .listen(PORT, () => console.log(`Listening on ${ PORT }`))
