const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express()
const port = process.env.PORT || 5000;
require('dotenv').config()

// middle wares-------------
app.use(cors())
app.use(express.json())


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.lhckmem.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        const serviceCollection = client.db("geniusCar").collection("services");
        const orderCollection = client.db("geniusCar").collection("orders")

        // all data get mongodb ----------
        app.get('/services', async (req, res) => {
            const query = {}
            const cursor = serviceCollection.find(query)
            const services = await cursor.toArray()
            res.send(services)
        });

        // single service {} load form mongodb-------------
        app.get('/services/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: id }
            const service = await serviceCollection.findOne(query)
            res.send(service);
        });

        // order api------------------set to mongo
        app.post('/orders', async (req, res) => {
            const order = req.body;
            const result = await orderCollection.insertOne(order)
            res.send(result)
        });

        // order api------------------get all mongo
        app.get('/orders', async (req, res) => {
            let query = {}
            
            if(req.query.email){
                query = {
                    email : req.query.email
                }
            }
            const cursor = orderCollection.find(query)
            const result = await cursor.toArray()
            res.send(result)
        })









    }
    catch (error) {
        console.log(error);
    }
}

run().catch(error => console.log(error))


app.get('/', (req, res) => {
    res.send("Genius car server running ")
});

app.listen(port, () => {
    console.log("genius car server running port: ", port);
})


// secure -------- dotenv ------------
// require('dotenv').config()
// console.log(process.env.DB_USER);
// console.log(process.env.DB_PASSWORD);