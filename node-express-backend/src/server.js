import express from 'express';
import path from 'path';
import fs from 'fs';
import {MongoClient } from 'mongodb';
import { fileURLToPath } from 'url';
import multer from 'multer';
import * as dotenv from 'dotenv' // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
import bodyParser from 'body-parser'
import {mongoose} from 'mongoose';
import customerModel from './CustomerModel.js';
dotenv.config()

const jsonParser = bodyParser.json()

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename)
console.log(__dirname);

const app = express()
app.use(express.json()); 
const port = 8000
//here is a change
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, '../build')));

app.use(express.static(path.join(__dirname, '../posters')));
//app.use(express.static("posters"));

const upload = multer({ dest: 'posters/' })

app.get(/^(?!\/api).+/, (req, res) => {
  res.sendFile(path.join(__dirname, '../build/index.html'))
});


mongoose.connect("mongodb://localhost:27017/Assignment2");

app.post('/api/addInfo', async (req, res) => {
  try {
    if (!req.body.name || !req.body.movie || !req.body.email) {
      return res.status(206).json({ error: 'Required fields are missing' });
  }

    const info = await customerModel.create({
      name: req.body.name,
      movie: req.body.movie,
      email: req.body.email
    });
    res.status(200).json({success: "Successful Addition", logs: info});
  } catch (error) {
    console.error(error);
    res.status(500).json({error: "An Internal Error happened boss"});
  } 
});




/*const movieData = JSON.parse(fs.readFileSync('./movies.json'));
console.log(movieData);
/*let movieData = [
    {"title":"Terminator 2"},
    {"title":"Rocky IV"},
    {"title":"Titanic"},
    {"title":"Die Hard"}
];*/

app.get('/api/movies', async (req, res) => {
    
    //res.json(movieData)
    
    const client = new MongoClient(process.env.MONGO_CONNECT);
    
    await client.connect();

    const db = client.db('movies');

    const movieData = await db.collection('reviews').find({}).toArray();
    console.log(movieData);
    res.json(movieData);

})

app.post('/api/removeMovie', async (req, res) => {
   console.log(req.body.title);
   
   const client = new MongoClient(process.env.MONGO_CONNECT);
   await client.connect();

   const db = client.db('movies');
   const result = await db.collection('reviews').deleteOne({ title: req.body.title})
  
   res.sendStatus(200);
})

app.post('/api/overwrite', jsonParser, async (req, res) => {
  const client = new MongoClient(process.env.MONGO_CONNECT);
  await client.connect();

  const db = client.db('movies');

  //console.log(req.body);
  /*for( let index in req.body ) {
    console.log(req.body[index].title + " " + req.body[index].poster);
  }*/

  const deleteResult = await db.collection('reviews').deleteMany({});
  console.log('Deleted documents =>', deleteResult);

  const insertResult = await db.collection('reviews').insertMany(req.body);
  console.log('Inserted documents =>', insertResult);

  res.sendStatus(200);


})

app.post('/api/review', upload.single('movie_poster'),  async (req,res) => {
  const client = new MongoClient(process.env.MONGO_CONNECT);
  await client.connect();

  const db = client.db('movies');


  const insertOperation = await db.collection('reviews').insertOne( {'title':req.body.title, 'poster':req.file.filename});
  console.log(insertOperation);
  res.redirect('/');

    /*movieData.push( { "title":req.body.title })
    saveData();
    console.log("update movies called");
    console.log(req.body);
    res.redirect('/');*/
})


const saveData = () => {
  const jsonContent = JSON.stringify(movieData);
  fs.writeFile("./movies.json", jsonContent, 'utf8', function (err) {
    if (err) {
        console.log("An error occured while writing JSON Object to File.");
    }
    console.log("JSON file has been saved.");
  });
}



app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

export default app;