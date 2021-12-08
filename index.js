const cool = require('cool-ascii-faces');
const express = require('express')
const cors = require('cors');
const path = require('path')
const PORT = process.env.PORT || 5000
const { Pool } = require('pg');

const origins = process.env.ENV == 'development' ?
  ['http://localhost:4200', 'https://elenalenaelena.github.io'] :
  ['https://elenalenaelena.github.io']

const pool = process.env.ENV == 'development' ? 
  new Pool({
    connectionString: process.env.LOCAL_DB
  }) : 
  new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

const postLog = async (request, response) => {
  // console.log(request.body)
  let sessionid = request.body.sessionId
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
    origin: origins
  }))
  .use(express.json())
  .use(express.static(path.join(__dirname, 'public')))
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')
  .get('/', (req, res) => res.render('pages/index'))
  .get('/db', async (req, res) => {
    try {
      const client = await pool.connect();
      const result = await client.query('select logging_events.key, sessionid, timecode, logging_events.eventid, logging_eventcodes.description as eventdescription, logging_events.statusid, logging_statuscodes.description as statusdescription, ticketid from logging_events join logging_eventcodes on logging_events.eventid=logging_eventcodes.eventid join logging_statuscodes on logging_events.statusid=logging_statuscodes.statusid order by timecode asc');
      const results = { 
        'results': (result) ? result.rows : null
      };
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
