

const express = require('express');   //creating an object from expess module(importing express modules)
const bodyParser= require('body-parser') //
const MongoClient = require('mongodb').MongoClient;//creating an object for connection to database , the database used here is MongoDb Atlas 
const { response, request } = require('express'); //declaration of constant variable 'response' which will be further used 
const app = express(); //creating object from express




const connectionString ="mongodb+srv://sauravkumar405:pass1234@cluster0.tfsn7.mongodb.net/crio_project?retryWrites=true&w=majority";

app.use(bodyParser.json())
app.use(express.static('public'))




  MongoClient.connect(connectionString, {
    useUnifiedTopology: true
  }).then(client=> {
    console.log('Connected to Database')
    const db = client.db('the-xo-database')
    let size=0;
    const quotesCollection = db.collection('quotes')
    app.set('view engine', 'ejs')
    app.use(bodyParser.urlencoded({ extended: true }))

    //this is the body of the method used to connect to the 
    //databse , here the arguments passed are 
    //connectionstring which is the key that contains the username and password of the admin of thre database
    //client- formal argument used for indicating the user database
    //db- indiacates the collection that is used to store the data
    //the collection is present inside the database of the user
    

    app.get('/memes', (request, response) =>{
      quotesCollection.find().toArray()
      .then(result =>{
       console.log(result);
        response.send(result);
        response.status(200);
      })
    });
    //returns the latest 100 memes stored in the database  


    app.get('/', (request, response) => {
      response.status(200);
      db.collection('quotes').find().toArray()

        .then(results => {
          
          response.render('index.ejs', { quotes: results }); 
        })
        .catch(error => console.error(error))
    })

//returns the main webpage that include the latest  100 memes stored in the database


     app.post('/memes',(req, response)=>{
      quotesCollection.find().toArray().then( result =>{
        size=result.length;
      })
      .then( ()=>{
       let obj ={"id":size+1, "Meme_Owner":req.body.Meme_Owner, "Caption":req.body.Caption, "Meme_URL":req.body.Meme_URL};
      quotesCollection.insertOne(obj)
        .then(result => { 
          response.redirect('/'); 
        })
        .catch(error => console.error(error));
      })
      .catch(error => console.error(error));
    });

   //method used to store the info recieved from frontend in the form of an api into the databse
   //it also generates specific entry no.(id) for each entry recieved and stores in the db
   //after this it redirects us to the main webpage



    app.get('/memes/:id',(req, response)=>{
      quotesCollection.find().toArray()
      .then( result =>{
        console.log(result);
        var len=result.length;
        var fid =req.params.id;
        console.log(fid)
        if(len<fid){
          response.status(404);
          response.send(`<h1 style="text-align: center; font-size:2em">404 Not Found</h1>`);
        }else{
          var obj={}
          for(var i=0; i<result.length; i++){
            if(result[i].id==fid){
              obj ={"id":fid,"Meme_Owner":result[i].Meme_Owner, "Caption":result[i].Caption, "Meme_URL":result[i].Meme_URL };
              response.status(200);
              response.send(obj);
              console.log(obj);
              break;
            }
          }
        }
      })})

      //this method is used to fetch a particular entry from the db, it takes an id no. provided by the user 
      //and search it in the db and return the entry whose id no. matches 

    app.all("*",(request,response)=> {
      response.status(404);
      response.send("404 NOT FOUND")
    })
    app.listen(process.env.PORT || 8081, function() {
      console.log('listening on 8081')
    })
  }).catch(err => { console.error(err); })