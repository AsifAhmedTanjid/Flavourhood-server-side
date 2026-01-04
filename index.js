const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const admin = require("firebase-admin");

const serviceAccount = require("./flavorhood--firebase-key.json");
require("dotenv").config();
const app = express();
const port = 3000;

// middleware
app.use(cors());
app.use(express.json());

// Firebase Admin Initialization
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
    // await client.connect();

    // apis

    const db = client.db("flavorhood-db");

    const userCollection = db.collection("users");
    const reviewCollection = db.collection("reviews")
    const favoritesCollection = db.collection("favorites");

    const verifyAdmin = async (req, res, next) => {
      const email = req.user.email;
      const query = { email: email };
      const user = await userCollection.findOne(query);
      const isAdmin = user?.role === 'admin';
      if (!isAdmin) {
        return res.status(403).send({ message: 'forbidden access' });
      }
      next();
    }

    // users

    app.get("/users", verifyToken, verifyAdmin, async (req, res) => {
      const result = await userCollection.find().toArray();
      res.send(result);
    });

    app.get("/users/role/:email", verifyToken, async (req, res) => {
      const email = req.params.email;
      if (email !== req.user.email) {
        return res.status(403).send({ message: "forbidden access" });
      }
      const query = { email: email };
      const user = await userCollection.findOne(query);
      let role = "user";
      if (user) {
        role = user.role;
      }
      res.send({ role });
    });

    app.get("/users/:id", async (req, res) => {
      const { id } = req.params;
      const objectId = new ObjectId(id);

      const result = await userCollection.findOne({ _id: objectId });

      res.send({
        success: true,
        result,
      });
    });

    app.post("/users", async (req, res) => {
      const user = req.body;
      const query = { email: user.email };
      const existingUser = await userCollection.findOne(query);
      if (existingUser) {
        return res.send({ message: "user already exists", insertedId: null });
      }
      user.role = 'user';
      
      const result = await userCollection.insertOne(user);
      res.send(result);
    });
      
    app.patch("/users/admin/:id", verifyToken, verifyAdmin, async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updatedDoc = {
        $set: {
          role: "admin",
        },
      };
      const result = await userCollection.updateOne(filter, updatedDoc);
      res.send(result);
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

      app.delete("/users/:id", verifyToken, verifyAdmin, async (req, res) => {
        const { id } = req.params;
        const result = await userCollection.deleteOne({
          _id: new ObjectId(id),
        });
        res.send(result);
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
        const { category, sortBy, search, page = 1, limit = 9 } = req.query;
        let query = {};
        
        if (category) {
            query.category = category;
        }
        
        if (search) {
            query.foodName = { $regex: search, $options: "i" };
        }

        let sortOptions = { date: -1 };
        if (sortBy === 'rating') {
            sortOptions = { rating: -1 };
        } else if (sortBy === 'year') {
            sortOptions = { date: -1 };
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const result = await reviewCollection
          .find(query)
          .sort(sortOptions)
          .skip(skip)
          .limit(parseInt(limit))
          .toArray();
          
        const total = await reviewCollection.countDocuments(query);
        
        res.send({ reviews: result, total });
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
        const email = req.user.email;
        
        
        const user = await userCollection.findOne({ email });
        const isAdmin = user?.role === 'admin';

        let query = { _id: new ObjectId(id) };
        
        
        if (!isAdmin) {
            query.email = email;
        }

        const result = await reviewCollection.deleteOne(query);
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
        const result = await reviewCollection
          .find({ foodName: { $regex: search_text, $options: "i" } })
          .toArray();
        res.send(result);
     
    });

    // await client.db("admin").command({ ping: 1 });
    // console.log(
    //   "Pinged your deployment. You successfully connected to MongoDB!"
    // );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
