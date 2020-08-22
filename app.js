const express = require('express');

const app = express();
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const url = 'mongodb://admin:admin@clusterapi-shard-00-00.0aauy.mongodb.net:27017,clusterapi-shard-00-01.0aauy.mongodb.net:27017,clusterapi-shard-00-02.0aauy.mongodb.net:27017/API?ssl=true&replicaSet=atlas-fj9vig-shard-0&authSource=admin&retryWrites=true&w=majority';
const options = {
  reconnectTries: Number.MAX_VALUE, reconnectInterval: 500, poolSize: 5, useNewUrlParser: true,
};

mongoose.connect(url, options);
mongoose.set('useCreateIndex', true);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const usersRoutes = require('./routes/user');

app.use('/user', usersRoutes);

app.use((req, res) => {
  res.status(404);
  if (req.accepts('json')) {
    res.send({ mensagem: 'Endpoint não encontrado' });
  }
});

app.listen(8080);

app.use(bodyParser.urlencoded({ extended: true }));

module.exports = app;
