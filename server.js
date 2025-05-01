



const express = require("express");
const app = express();
const cors = require("cors");
const multer = require("multer");

const mongoose = require("mongoose");
const Jimp = require("jimp");
const fs = require('fs');


const mongoDBURI = 'mongodb://127.0.0.1:27017/tyre';

async function connectToDatabase() {
  try {
    await mongoose.connect(mongoDBURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to the database");
  } catch (error) {
    console.error("Error connecting to the database:", error.message);
  }
}

const reportsSchema = new mongoose.Schema({
  registration_number: String,
  Phone_number: String,
  predictions: [
    {
      date: { type: Date, default: Date.now },
      imageName: String,
      label: String,
      feedback: String,
      predictionQuality: String, 
    },
  ],
});

const Reports = mongoose.model("reports", reportsSchema);

let model;
const modelPath = "dude.js/model.json";


function generateImageName(username, predictionArrayLength) {
  return `${username}${predictionArrayLength + 1}.jpg`;
}



connectToDatabase();


app.use(cors());
app.use(express.json());

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "web/public/uploads");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage });

app.get("/", function (req, res) {
  console.log("got a GET request for the home page");
  res.send("Welcome to Home page");
});

app.get("/getdata", async (req, res) => {
  console.log("got a get req");
  try {
    const data = await Reports.find();
    console.log("Data from the database:", data);
    res.json(data);
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get("/getdata/:registrationNumber", async (req, res) => {
  const { registrationNumber } = req.params;

  try {
    const user = await Reports.find({ registration_number: registrationNumber });
    if (!user || user.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error('Error fetching user data:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get("/search", async (req, res) => {
  console.log("got a get req");
  console.log(req.query);

  const { registrationNumber } = req.query;

  if (!registrationNumber) {
    return res.status(400).json({ error: 'Registration number is required' });
  }

  try {
    const data = await Reports.find({ registration_number: registrationNumber });
    console.log("Data from the database:", data);
    res.json(data);
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


app.post("/submitFeedback", async (req, res) => {
  const { registrationNumber, feedback, predictionQuality } = req.body;

  try {
    const user = await Reports.findOne({ registration_number: registrationNumber });
    if (!user || user.predictions.length === 0) {
      return res.status(404).json({ error: "User not found or no predictions available" });
    }


    const latestPrediction = user.predictions[user.predictions.length - 1];
    

    latestPrediction.feedback = feedback;
    latestPrediction.predictionQuality = predictionQuality; 

    await user.save();
    res.json({ success: true, message: "Feedback saved successfully" });
  } catch (error) {
    console.error('Error saving feedback:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


app.post("/uploads", upload.single("image"), async (req, res) => {
  try {
    console.log("post req received");
    console.log(req.file);

    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }


    const { Pn, Rn, predicted_class, prediction } = req.body;


    const existingRecord = await Reports.findOne({ registration_number: Rn });

    const imageName = generateImageName(Rn, existingRecord ? existingRecord.predictions.length : 0);
    const phoneNumber = Pn;
    const regNumber = Rn;

    const predictionData = {
      date: new Date(),
      imageName: imageName,
      label: predicted_class,
      prediction: prediction,
    };

    if (existingRecord) {

      existingRecord.predictions.push(predictionData);
      await existingRecord.save();
      console.log("Updated existing record in the database");
    } else {

      const saveToDb = new Reports({
        registration_number: regNumber,
        Phone_number: phoneNumber,
        predictions: [predictionData],
      });

      await saveToDb.save();
      console.log("Saved new record to the database");
    }

    // Save the image with the generated name
    // const newPath = `web/public/uploads/${imageName}`;
    // await Jimp.read(req.file.path)
    //   .then((processedImage) => processedImage.write(newPath));


    res.json({ success: true, label: predicted_class, confidence: prediction });
  } catch (error) {
    console.error("Error processing image:", error);

    res.status(500).json({ error: "Error processing image" });
  }
});



async function startServer() {
  const port = 8000;
  await connectToDatabase();
  const server = app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
  });
}

startServer();
