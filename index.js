require('dotenv').config();
const express = require("express");
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 3000;

//middleware
app.use(cors());
app.use(express.json());

function capitalize(str) {
    if (!str) return str;
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_CLUSTER}.scnhrfl.mongodb.net/?appName=${capitalize(process.env.DB_CLUSTER)}`;



// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

const ALLOWED_FIELDS = new Set([
    "user_name",
    "email",
    "available_status",
    "user_img_url",
    "food_name",
    "food_image",
    "food_quantity",
    "pickup_location",
    "expire_date",
    "additional_notes"
]);


const ALLOWED_UPDATE_FIELDS = new Set([
    "available_status",
    "food_name",
    "food_image",
    "food_quantity",
    "pickup_location",
    "expire_date",
    "additional_notes"
]);


const ALLOWED_REQUEST_FIELDS = new Set([
    "writeLocation",
    "whyNeedFood",
    "contactNo",
    "userEmail",
    "name",
    "photoURL"
]);



app.get("/", (req, res) => {
    res.send("Mongo DB Connection Success");
});

async function run() {
    try {
        await client.connect();

        const db = client.db("FoodCycleDB");
        const foodCollection = db.collection("foods");
        const foodRequestCollection = db.collection("foodRequest");

        // to get data
        app.get("/foods", async (req, res) => {
            // const result = await foodCollection.find().toArray();
            const result = await foodCollection.find({ available_status: true }).toArray();
            res.send(result);
        });


        // to get single data
        app.get("/foods/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await foodCollection.findOne(query);
            res.send(result);
        })


        //to post data
        app.post("/foods", async (req, res) => {
            const data = req.body;

            for (const key in data) {
                if (!ALLOWED_FIELDS.has(key)) {
                    return res.status(400).json({ error: `Field "${key}" not allowed` });
                }
            }
            const result = await foodCollection.insertOne(data);
            res.status(201).json(result);
        });


        // to update data
        app.patch("/foods/:id", async (req, res) => {
            const updates = req.body;
            for (const key in updates) {
                if (!ALLOWED_UPDATE_FIELDS.has(key)) {
                    return res.status(400).send(`Cannot update: ${key}`);
                }
            }
            const result = await foodCollection.updateOne(
                { _id: new ObjectId(req.params.id) },
                { $set: updates }
            );

            res.send(result);
        });


        // to delete data
        app.delete("/foods/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await foodCollection.deleteOne(query);
            res.send(result);
        });



        // food request post
        app.post("/foodRequest/:id", async (req, res) => {
            const data = req.body;

            for (const key in data) {
                if (!ALLOWED_REQUEST_FIELDS.has(key)) {
                    return res.status(400).json({ error: `Invalid field: ${key}` });
                }
            }

            data.requestStatus = "pending";
            data._id = req.params.id;

            const result = await foodRequestCollection.insertOne(data);
            res.status(201).json(result);
        });


























        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
    }
}
run().catch(console.dir);

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
}); 