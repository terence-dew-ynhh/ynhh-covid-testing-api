import middleware from "../../middleware/database";
import nextConnect from "next-connect";
import Cors from 'cors'

const handler = nextConnect();

handler.use(middleware);

// Initializing the cors middleware
const cors = Cors({
  methods: ['GET','HEAD','POST'],
})

// Helper method to wait for a middleware to execute before continuing
// And to throw an error when an error happens in a middleware
function runMiddleware(req, res, fn) {
  return new Promise((resolve, reject) => {
    fn(req, res, result => {
      if (result instanceof Error) {
        return reject(result)
      }

      return resolve(result)
    })
  })
}

handler.post(async (req, res) => {

  await runMiddleware(req, res, cors)  
  try {
    const {db, body} = req;
    const {survey_src} = body;

    console.log(survey_src);
    const mongoDBDocumentObj = makeDBDocument(survey_src, body);

    await db.collection("answers").insertOne(mongoDBDocumentObj);
    res.status(200);
    res.send("1 Document Created");
  } catch (err) {
    res.status(400);
    res.end(`Something went wrong: ${err}`);
  }
});

const makeDBDocument = (survey_src, body) => {
    let mongoDBDocumentObj = {};

    switch (survey_src) {
      case "yale":
        return (mongoDBDocumentObj = makeYaleBody(body));
        break;

      case "ynhh":
        return (mongoDBDocumentObj = makeYNHHBody(body));
        break;

      default:
        return (mongoDBDocumentObj = makeYNHHPubBody(body));
        break;
    }
  };
  
  const makeYaleBody = (body) => {
    return {
      _id: body.net_id,
      covid_symptoms: body.covid_symptoms,
      work_remote: body.work_remote,
      work_remote_age: body.work_remote_age,
      survey_src: body.survey_src,
      submitted_timestamp: Date.now(),
    };
  };

  const makeYNHHBody = (body) => {
    return {
      covid_positive: body.covid_positive,
      selected_location: body.selected_location,
      survey_src: body.survey_src,
      submitted_timestamp: Date.now(),
    };
  };

  const makeYNHHPubBody = (body) => {
    return {
      zip_code: body.zip_code,
      survey_src: body.survey_src,
      submitted_timestamp: Date.now(),
    };
  };


export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb'
    },
  },
}
export default handler;
