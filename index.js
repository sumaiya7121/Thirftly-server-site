const express = require('express');
const cors =require('cors');
require('dotenv').config();
const port = process.env.PORT || 4000;
const { MongoClient, ServerApiVersion } = require('mongodb');


const app= express();

//middleware

app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@project1.puheqno.mongodb.net/?retryWrites=true&w=majority`;


const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


async function run(){
try{

const categoryCollection= client.db('thriftly').collection('category');
const allcategories =client.db('thriftly').collection('categories');
const bookingcollection =client.db('thriftly').collection('bookings');

app.get('/category',async(req,res)=>{

const query ={}

const cursor =categoryCollection.find(query);
const services =await cursor.toArray();
res.send(services);


});

app.get('/categories',async(req,res)=>{

const query ={}

const cursor =allcategories.find(query);
const services =await cursor.toArray();
res.send(services);


});

app.get('/categories/:name',async(req,res)=>{

const name= req.params.name;
const query ={ categoryName: name };
const result = await allcategories.find(query).toArray();
res.send(result);

});

app.post('/bookings',async(req,res)=>{

const booking =req.body;
console.log(booking)
const result =await bookingcollection.insertOne(booking);
res.send(result);


});



}

finally{



}

}
run().catch(err=>console.log(err));


app.get('/',async(req,res)=>{
    res.send('Thriftly is running');
})

app.listen(port , ()=>{
    console.log(`port is running on ${port}`)
})