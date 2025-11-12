const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require("mongodb");
const admin = require("firebase-admin");

const serviceAccount = require("./flavorhood--firebase-key.json");
require("dotenv").config();
const app = express();
const port = 3000;

// middleware
app.use(cors());
app.use(express.json());

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.clghzkh.mongodb.net/?appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

app.get("/", (req, res) => {
  res.send("server is running");
});

const verifyToken = async (req, res, next) => {
  const authorization = req.headers.authorization;

  if (!authorization) {
    return res.status(401).send({
      message: "unauthorized access. Token not found!",
    });
  }

  const token = authorization.split(" ")[1];
  try {
    const decodedUser = await admin.auth().verifyIdToken(token);
    req.user = decodedUser;

    next();
  } catch (error) {
    res.status(401).send({
      message: "unauthorized access.",
    });
  }
};

async function run() {
  try {
    await client.connect();

    // apis

    const db = client.db("flavorhood-db");

    const userCollection = db.collection("users");
    const reviewCollection = db.collection("reviews");

    // users

    app.get("/users", async (req, res) => {
      const result = await userCollection.find().toArray();
      res.send(result);
    });

    app.get("/users:id", async (req, res) => {
      const { id } = req.params;
      const objectId = new ObjectId(id);

      const result = await userCollection.findOne({ _id: objectId });

      res.send({
        success: true,
        result,
      });
    });

    app.post("/users", async (req, res) => {
      const data = req.body;
      const result = await userCollection.insertOne(data);
      res.send({
        succes: true,
        result,
      });

      app.put("/users/:id", async (req, res) => {
        const { id } = req.params;
        const data = req.body;
        const objectId = new ObjectId(id);
        const filter = { _id: objectId };
        const update = {
          $set: data,
        };

        const result = await userCollection.updateOne(filter, update);

        res.send({
          success: true,
          result,
        });
      });

      app.delete("/users/:id", async (req, res) => {
        const { id } = req.params;
        const result = await userCollection.deleteOne({
          _id: new ObjectId(id),
        });

        res.send({
          success: true,
          result,
        });
      });

      //reviews

      app.post("/reviews", verifyToken, async (req, res) => {
        const data = req.body;
        data.date = new Date();
        data.email = req.user.email;
        const result = await reviewCollection.insertOne(data);
        res.send({ success: true, result });
      });

      app.get("/reviews", async (req, res) => {
        const result = await reviewCollection
          .find()
          .sort({ date: -1 })
          .toArray();
        res.send(result);
      });

      app.get("/reviews/:id", async (req, res) => {
        const { id } = req.params;
        const result = await reviewCollection.findOne({
          _id: new ObjectId(id),
        });
        res.send(result);
      });

      app.put("/reviews/:id", verifyToken, async (req, res) => {
        const { id } = req.params;
        const data = req.body;
        const filter = { _id: new ObjectId(id), email: req.user.email };
        const update = { $set: data };
        const result = await reviewCollection.updateOne(filter, update);
        res.send(result);
      });

      app.delete("/reviews/:id", verifyToken, async (req, res) => {
        const { id } = req.params;
        const result = await reviewCollection.deleteOne({
          _id: new ObjectId(id),
          email: req.user.email,
        });
        res.send(result);
      });

      app.get("/my-reviews", verifyToken, async (req, res) => {
        const email = req.user.email;
        const result = await reviewCollection
          .find({ email })
          .sort({ date: -1 })
          .toArray();
        res.send(result);
      });

      app.get("/featured", async (req, res) => {
        const result = await reviewCollection
          .find()
          .sort({ rating: -1 })
          .limit(6)
          .toArray();
        res.send(result);
      });

      //favorites

      app.post("/favorites", verifyToken, async (req, res) => {
        const data = req.body;
        data.email = req.user.email;
        const existing = await favoritesCollection.findOne({
          reviewId: data.reviewId,
          email: req.user.email,
        });
        if (existing)
          return res.send({ success: false, message: "Already in favorites" });

        const result = await favoritesCollection.insertOne(data);
        res.send({ success: true, result });
      });

      app.get("/my-favorites", verifyToken, async (req, res) => {
        const email = req.user.email;
        const result = await favoritesCollection.find({ email }).toArray();
        res.send(result);
      });

      app.delete("/favorites/:id", verifyToken, async (req, res) => {
        const { id } = req.params;
        const result = await favoritesCollection.deleteOne({
          _id: new ObjectId(id),
          email: req.user.email,
        });
        res.send(result);
      });

      app.get("/search", async (req, res) => {
        const search_text = req.query.search;
        const result = await modelCollection
          .find({ foodName: { $regex: search_text, $options: "i" } })
          .toArray();
        res.send(result);
      });
    });

    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
