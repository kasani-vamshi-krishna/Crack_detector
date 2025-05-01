const express = require("express");
const app = express();
const cors = require("cors");
const multer = require("multer");
const tf = require("@tensorflow/tfjs-node");
const { MongoClient } = require('mongodb');
const bodyParser = require('body-parser');
const Jimp = require("jimp");

app.use(bodyParser.json());

// ... (other code)
const mongoose = require("mongoose")
const windowsHostIP='192.168.42.158';
const mongoDBURI = 'mongodb://127.0.0.1:27017/toh';


// const mongoose = require("mongoose");
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


const reports = mongoose.Schema({
  registration_number:String,
  Phone_number:String,
  imageName:String,
  label:String,

})
const Reports = mongoose.model("reports",reports); 
////////////////////////////////////////////////////////////////////
let model;
const modelPath = "model.js/model.json";

async function loadModel() {
  try {
    model = await tf.loadLayersModel(`file://${modelPath}`);
    console.log("Model loaded");
  } catch (error) {
    console.error("Error loading the model:", error);
  }
}
/////////////////////////////////////////////////////////////////////
loadModel();
connectToDatabase();
/////////////////////////////////////////////////////////////////////
app.use(cors());
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads");
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
// app.post('/uploads',function(req,res){
//     console.log()
//     res.send("recived an image")
// })
app.post("/uploads", upload.single("image"), async (req, res) => {
  try {
    console.log("post req received");
    console.log(req.file);

    const image = await Jimp.read(req.file.path);
    await image.resize(128, 128); // Resize the image

    const processedImageBuffer = await image.getBufferAsync(Jimp.MIME_JPEG);

    const inputTensor = tf.node.decodeImage(processedImageBuffer);
    const expandedTensor = inputTensor.expandDims();
    const normalizedTensor = expandedTensor.div(255.0);
    const reshapedTensor = normalizedTensor.reshape([1, 128, 128, 3]);
    const predictions = model.predict(reshapedTensor);
    const label = predictions.dataSync()[0] > 0.5 ? 'normal' : 'cracked';
    console.log({ label, confidence: predictions.dataSync()[0] * 100 });

    const imageName = req.file.filename;
    const phoneNumber = req.body.Pn;
    const regNumber = req.body.Rn;

    const saveToDb = new Reports({
      registration_number: regNumber,
      Phone_number: phoneNumber,
      imageName: imageName,
      label: label,
    });

    saveToDb.save().then(() => {
      console.log("save to db");
    }).catch((e) => {
      console.log("error cannot save to db");
    });

    res.json({ label, confidence: predictions.dataSync()[0] * 100 });

  } catch (error) {
    console.error("Error processing image:", error);
    res.status(500).json({ error: "Error processing image" });
  }
});

// ... (other code)

// Remove the loadModel and connectToDatabase calls from here
app.get("/getdb", async (req, res) => {
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
  /////////////////////////////////////////////////////////
  
  /////////////////////////////////////////////////////////
  
  app.get("/search", async (req, res) => {
    console.log("got a get req");
    console.log(req)
  
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
  
  /////////////////////////////////////////////////////////
  
  async function startServer() {
    await loadModel();
    await connectToDatabase();
    const server = app.listen(8000, () => {
      console.log("Server is listening on port 8000");
    });
  }
  
  startServer();
