const express = require('express');
const cors =require('cors');
require('dotenv').config();
const jwt = require('jsonwebtoken');
const port = process.env.PORT || 4000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');


const app= express();

//middleware

app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@project1.puheqno.mongodb.net/?retryWrites=true&w=majority`;


const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

function veryfyjwt(req, res, next){


const authHeader =req.headers.authorization;
if(!authHeader){
    return res.status(401).send('unauthorized access')
}

const token =authHeader.split(' ')[1];
jwt.verify(token, process.env.ACCESS_TOKEN ,function(err, decoded){
    if(err){
        return res.status(403).send({message: 'forbidden access'})
    }
    req.decoded =decoded;
    next();
} )

}


async function run(){
try{

const categoryCollection= client.db('thriftly').collection('category');
const allcategories =client.db('thriftly').collection('categories');
const bookingcollection =client.db('thriftly').collection('bookings');
const userscollection =client.db('thriftly').collection('users');


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

app.post('/categories',async(req,res)=>{

const services =req.body;
const result =await allcategories.insertOne(services);
res.send(result);


});

app.get('/categories/:name',async(req,res)=>{

const name= req.params.name;
const query ={ categoryName: name };
const result = await allcategories.find(query).toArray();
res.send(result);

});

app.get('/bookings',veryfyjwt,async(req,res)=>{
const email= req.query.email;
const decodedEmail =req.decoded.email;
console.log({email,decodedEmail})
if(email !== decodedEmail){
    return res.status(403).send({message: 'forbidden access'})
}
const query={email}
const bookings= await bookingcollection.find(query).toArray();
res.send(bookings);

})

app.post('/bookings',async(req,res)=>{

const booking =req.body;
const result =await bookingcollection.insertOne(booking);
res.send(result);


});

app.get('/jwt',async(req,res)=>{

const email=req.query.email;
const query={email: email};
const user = await userscollection.findOne(query);
if(user){
    const token=jwt.sign({email}, process.env.ACCESS_TOKEN)
    return res.send({accessToken: token})
}

res.status(403).send({accessToken:''});

})

app.get('/users',async(req,res)=>{

const query= {}
const users = await userscollection.find(query).toArray();
res.send(users);


})


app.get('/users/admin/:email',async(req,res)=>{
const email =req.params.email;
const query={ email };
const user =await userscollection.find(query);
res.send({isAdmin: user?.role ==='admin'});


})

app.post('/users',async(req,res)=>{

const user =req.body;
console.log(user);
const result =await userscollection.insertOne(user);
res.send(result);


});

app.post('/user',async(req,res)=>{
    const info = req.body;
    const result = await userscollection.insertOne(info);
    res.send(result);
})

app.get('/users/seller',async(req,res)=>{
    const query ={role : 'Seller'};
    const sellers=await userscollection.find(query).toArray();
    res.send(sellers);
})

app.get('/users/buyer',async(req,res)=>{
    const query ={role : 'Buyer'};
    const buyer=await userscollection.find(query).toArray();
    res.send(buyer);
})

app.get("/users/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const user = await userscollection.find(query).toArray();
      res.send(user)})



app.put('/users/admin/:id',veryfyjwt,async(req,res)=>{
    const decodedEmail = req.decoded.email;
    const query={email: decodedEmail};
    const user =await userscollection.findOne(query)
    if(user?.role !=='admin'){
        return res.status(403).send({message : 'forbidden access'})

    }
const id = req.params.id;
const filter ={_id: ObjectId(id)}
const options ={ upsert: true } ;
const updatedDoc = {
    $set:{
        role:'admin'
    }  
}
 const result = await userscollection.updateOne(filter,updatedDoc,options);
    res.send(result);
});

app.delete('/users/:id',veryfyjwt,async(req,res)=>{

const id= req.params.id;
const filter = {_id: ObjectId(id)};
const result = await userscollection.deleteOne(filter);
res.send(result);

});
    app.get("/categories", async (req, res) => {
      const sellerEmail = req.query.email;
      const query = { sellerEmail: sellerEmail };
      const products = await allcategories.find(query).toArray();
      res.send(products);
    });

     app.get("/categories/advertised", async (req, res) => {
      const query = { isAdvertised: true };
      const advertised = await allcategories.find(query).toArray();
      res.send(advertised);
    });

    // update a product for advertise start
    app.patch("/categories/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: ObjectId(id) };
      const updatedDoc = {
        $set: {
          isAdvertised: true,
        },
      };
      const result = await allcategories.updateOne(filter, updatedDoc);
      res.send(result);
    });
    // update a product for advertise end


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