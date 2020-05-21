import { MongoClient } from 'mongodb';
import nextConnect from 'next-connect';

const client = new MongoClient('mongodb://localhost:27017', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function database(req, res, next) {
  if (!client.isConnected()) await client.connect();
  req.dbClient = client;
  req.db = client.db('survey_answers');
  console.log(`Connected MongoDB ${req.db.namespace}`)
  return next();
}

const middleware = nextConnect();

middleware.use(database);

export default middleware;