# Small Logging Server

This server is based on Node.js app using [Express 4](http://expressjs.com/). It is intended to be hosted on the Heroku platform.

## Documentation

For more information about using Node.js on Heroku, see these Dev Center articles:

- [Getting Started on Heroku with Node.js](https://devcenter.heroku.com/articles/getting-started-with-nodejs)
- [Heroku Node.js Support](https://devcenter.heroku.com/articles/nodejs-support)
- [Node.js on Heroku](https://devcenter.heroku.com/categories/nodejs)
- [Best Practices for Node.js Development](https://devcenter.heroku.com/articles/node-best-practices)
- [Using WebSockets on Heroku with Node.js](https://devcenter.heroku.com/articles/node-websockets)
- [Node.js, Express.js, and PostgreSQL: CRUD REST API example](https://blog.logrocket.com/nodejs-expressjs-postgresql-crud-rest-api-example/)
- [How to use CORS in Node.js with Express](https://www.section.io/engineering-education/how-to-use-cors-in-nodejs-with-express/)
- [Send a JSON response using Express](https://flaviocopes.com/express-send-json-response/)

## Development

### Deploy app

Initial creation of app (needed once to create a new Heroku app):

```sh
$ heroku create
$ git push heroku main
$ heroku open
```

[![Deploy to Heroku](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy). 

Further updates like this:

````sh
git add .
git commit -m "update"
git push heroku main
heroku ps:scale web=0    # scale down
heroku ps:scale web=1    # scale up
heroku pg:psql           # edit database
````

### Develop App

Make sure you have [Node.js](http://nodejs.org/) and the [Heroku CLI](https://cli.heroku.com/) installed. You should [create a local .env file](https://devcenter.heroku.com/articles/heroku-local#copy-heroku-config-vars-to-your-local-env-file) to set development mode:

```sh
$ heroku config:get ENV -s  >> .env
```

Edit `.env` file and set `ENV=development` to develop locally. Add the address to your local PostgresSQL database `LOCAL_DB=postgresql://localhost:5432/kammer`. You can now log from any app running on http://localhost:4200.

````sh
$ npm install
$ npm start
$ heroko local
````

Your app should now be running on [localhost:5000](http://localhost:5000/).

## Usage

### Routes

* GET `'/'` The app has one main route to display information.
* GET `'/db'` Displays information about log entries
* GET `/cool` See for yourself
* POST `/log` Provide logging information via JSON