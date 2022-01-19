const cool = require('cool-ascii-faces');
const express = require('express')
const cors = require('cors');
const ipfilter = require('express-ipfilter').IpFilter
const path = require('path')
const PORT = process.env.PORT || 5000
const { Pool } = require('pg');
var { Parser } = require('json2csv');

const blacklist = ['78.54.214.87'];

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

  if(!(/^-?\d+$/.test(eventid))) return;
  if(ticketid!=null && !/^-?\d+$/.test(ticketid)) return; 
  if(statusid!=null && !/^-?\d+$/.test(statusid)) return;

  try {
    const client = await pool.connect();
    // TODO: Check numeric logs if they are numeric!
    const result = await client.query('INSERT INTO logging_events (sessionid, timecode, eventid, ticketid, statusid) VALUES ($1, $2, $3, $4, $5)', [sessionid, timecode, eventid, ticketid, statusid]);
    response.status(201).json(`{ message: 'Log added successfully' }`) 
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
  .use(ipfilter(blacklist))
  .use(express.static(path.join(__dirname, 'public')))
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')
  .get('/', (req, res) => res.render('pages/index'))
  .get('/db', async (req, res) => {
    try {
      var wherestring = req.query.id !== undefined ? "and logging_events.sessionid = '" + req.query.id + "'": '';
      var limitstring = req.query.id !== undefined ? "" : " limit 2500";
      const client = await pool.connect();
      const result = await client.query('select logging_events.key, sessionid, timecode, logging_events.eventid, logging_eventcodes.description as eventdescription, logging_events.statusid, logging_statuscodes.description as statusdescription, ticketid from logging_events join logging_eventcodes on logging_events.eventid=logging_eventcodes.eventid full outer join logging_statuscodes on logging_events.statusid=logging_statuscodes.statusid where logging_events.key is not null ' + wherestring + ' order by timecode desc' + limitstring);
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
  .get('/export', async (req, res) => {
    try {
      const client = await pool.connect();
      const json2csv = new Parser();
      const result = await client.query('select logging_events.key, sessionid, timecode, logging_events.eventid, logging_eventcodes.description as eventdescription, logging_events.statusid, logging_statuscodes.description as statusdescription, ticketid from logging_events join logging_eventcodes on logging_events.eventid=logging_eventcodes.eventid full outer join logging_statuscodes on logging_events.statusid=logging_statuscodes.statusid where logging_events.key is not null order by timecode asc');
      let data = json2csv.parse(result.rows);
      res.attachment('logging_data.csv');
      res.status(200).send(data);
      client.release();
    } catch (error) {
      console.log('error:', error.message);
      res.status(500).send(error.message);
    }
   
  })
  .post('/log', (req, res) => postLog(req, res))
  .listen(PORT, () => console.log(`Listening on ${ PORT }`))
