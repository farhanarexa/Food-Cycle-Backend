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


        app.get("/my-foods", async (req, res) => {
            try {
                const email = req.query.email;

                // Security: Always validate email is present
                if (!email) {
                    return res.status(400).json({ error: "Email query parameter is required" });
                }

                // Optional: Extra security - only allow users to fetch their own data
                // (Uncomment if you add authentication middleware later)
                // if (req.user?.email !== email) {
                //   return res.status(403).json({ error: "You can only view your own foods" });
                // }

                const query = { email: email };
                const myFoods = await foodCollection.find(query).sort({ _id: -1 }).toArray();

                res.status(200).json(myFoods);
            } catch (error) {
                console.error("Error fetching my foods:", error);
                res.status(500).json({ error: "Internal server error" });
            }
        });


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


        // food request get
        app.get("/foodRequest/:id", async (req, res) => {
            const result = await foodRequestCollection.find({ food_id: req.params.id }).toArray();
            res.send(result);
        });


        // Returns all requests made for a specific food
        app.get("/food-requests-all/:foodId", async (req, res) => {
            try {
                const { foodId } = req.params;

                // Validate ObjectId (optional but recommended)
                if (!foodId.match(/^[0-9a-fA-F]{24}$/)) {
                    return res.status(400).json({ error: "Invalid food ID" });
                }

                const requests = await foodRequestCollection
                    .find({ food_id: foodId })
                    .sort({ request_date: -1 })
                    .toArray();

                res.json(requests);
            } catch (error) {
                console.error("Error fetching requests:", error);
                res.status(500).json({ error: "Failed to fetch requests" });
            }
        });


        app.get("/my-all-food-requests", async (req, res) => {
            try {
                const email = req.query.email;

                if (!email) {
                    return res.status(400).json({ error: "Email is required" });
                }

                // Step 1️⃣ — Get all requests for this user
                const myRequests = await foodRequestCollection.find({ userEmail: email }).toArray();

                // Step 2️⃣ — For each request, get the food details
                const results = [];
                for (const reqItem of myRequests) {
                    // Find the food using the food_id
                    const food = await foodCollection.findOne({ _id: new ObjectId(reqItem.food_id) });

                    // Add food info inside each request
                    results.push({
                        ...reqItem,
                        foodDetails: food || null, // if food not found, keep null
                    });
                }

                // Step 3️⃣ — Send final result
                res.status(200).json(results);

            } catch (error) {
                console.error("Error fetching requests:", error);
                res.status(500).json({ error: "Internal server error" });
            }
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
            data.food_id = req.params.id;

            const result = await foodRequestCollection.insertOne(data);
            res.status(201).json(result);
        });



        //food request status update (accepted)
        app.patch("/foodRequestAccept/:id", async (req, res) => {
            const updates = req.body;
            const email = req.body.userEmail;
            const food_request_id = req.params.id;
            const query = { _id: new ObjectId(food_request_id) };
            const food_req_item = await foodRequestCollection.findOne(query)
            const food_id = food_req_item.food_id;
            const food_query = { _id: new ObjectId(food_id) };
            const food_request_updateDoc = { $set: { requestStatus: "accepted" } };
            const food_request_result = await foodRequestCollection.updateOne(query, food_request_updateDoc);
            const foods = await foodCollection.findOne(food_query)
            const food_updateDoc = { $set: { available_status: false } };
            const result = await foodCollection.updateOne(food_query, food_updateDoc);
            res.send(result);
        })



        //food request status update (rejected)
        app.patch("/foodRequestReject/:id", async (req, res) => {
            const food_request_id = req.params.id;
            const query = { _id: new ObjectId(food_request_id) };
            const food_req_item = await foodRequestCollection.findOne(query)
            const food_request_updateDoc = { $set: { requestStatus: "rejected" } };
            const result = await foodRequestCollection.updateOne(query, food_request_updateDoc);
            res.send(result);
        })



        app.delete("/myFoodRequest/:id", async (req, res) => {
            try {
                const id = req.params.id;
                console.log("Deleting request with id:", id);

                const query = { _id: new ObjectId(id) };
                const result = await foodRequestCollection.deleteOne(query);

                res.send(result);
            } catch (error) {
                console.error("Error deleting food request:", error);
                res.status(500).send({ error: "Internal server error" });
            }
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