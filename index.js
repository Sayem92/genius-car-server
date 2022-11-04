const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express()
const port = process.env.PORT || 5000;
require('dotenv').config()

// middle wares-------------
app.use(cors())
app.use(express.json())


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.lhckmem.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

// verify token jwt----------------
function verifyJwt(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send({ message: "unauthorized access" })
    }
    const token = authHeader.split(' ')[1];
   
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function(err, decoded){
        if(err){
            return res.status(401).send({ message: "forbidden access" })
        }
        req.decoded = decoded;
        next();
    })
}


async function run() {
    try {
        const serviceCollection = client.db("geniusCar").collection("services");
        const orderCollection = client.db("geniusCar").collection("orders");

        //jwt token---------------------
        app.post('/jwt', (req, res) => {
            const user = req.body;
            const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1d' });
            // sudu token ole kicu bujba na tai json a pataw { } di
            res.send({ token })
        })

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
        app.post('/orders', verifyJwt, async (req, res) => {
            const order = req.body;
            const result = await orderCollection.insertOne(order)
            res.send(result)
        });

        // order api------------------get all mongo
        app.get('/orders', verifyJwt, async (req, res) => {
            const decoded = req.decoded;
            console.log("inside orders api", decoded);
            if(decoded.email !== req.query.email){
                res.status(403).send({message : 'unauthorized access'})
            }

            let query = {}
            if (req.query.email) {
                query = {
                    email: req.query.email
                }
            }
            const cursor = orderCollection.find(query)
            const result = await cursor.toArray()
            res.send(result)
        })

        // update orders single- ----------sudu takle change
        app.patch('/orders/:id', verifyJwt, async (req, res) => {
            const id = req.params.id;
            const status = req.body;
            const query = { _id: ObjectId(id) }
            const updatedDoc = {
                $set: {
                    status: status
                }
            }
            const result = await orderCollection.updateOne(query, updatedDoc)
            res.send(result)
        })

        // delete orders api----------
        app.delete('/orders/:id', verifyJwt, async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const result = await orderCollection.deleteOne(query)
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