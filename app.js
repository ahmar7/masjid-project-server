const express = require("express");
const app = express();
var bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");
const dotnet = require("dotenv").config({
  path: path.resolve(__dirname, ".env"),
});
const boxModel = require("./models/Boxes");
const database = require("./db/db");
app.use(bodyParser.urlencoded({ extended: false }));
const fs = require("fs");
// app.use(
//   cors({
//     origin: process.env.CORS,
//     credentials: true,
//   })
// );
let ALLOWED_ORIGINS = [
  "https://afghandan.tech",
  "http://localhost:3000",
  "https://masjid-project-client.vercel.app",
];
app.use((req, res, next) => {
  let origin = req.headers.origin;
  let theOrigin =
    ALLOWED_ORIGINS.indexOf(origin) >= 0 ? origin : ALLOWED_ORIGINS[0];
  res.header("Access-Control-Allow-Origin", theOrigin);
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );

  res.header("Access-Control-Allow-Credentials", true);

  res.header(
    "Access-Control-Allow-Methods",
    "POST, GET, PUT, PATCH,DELETE, OPTIONS"
  );
  next();
});

// parse application/json
app.use(bodyParser.json());
const port = process.env.PORT || 5000;
const static_path = path.join(__dirname, "../../");
app.use(express.static(static_path));
app.post("/api/submit-info", async (req, res) => {
  try {
    const { name, email, phoneNumber, keepSecret, boxNumber } = req.body;

    // Check if the box is already filled
    const existingBox = await boxModel.findOne({ boxNumber, isFilled: true });
    if (existingBox) {
      // Box is already filled, respond with a message
      return res
        .status(400)
        .send({ msg: "Box is already filled", success: false });
    }

    // Create a new Box instance with the submitted data
    const newBox = new boxModel({
      boxNumber,
      isFilled: true,
      userInfo: {
        name,
        email,
        phoneNumber,
        isChecked: keepSecret,
      },
    });

    // Save the new Box instance to the database
    await newBox.save();

    // Respond with a success message
    res.status(200).send({
      msg: "Information saved successfully!",
      newBox,
      success: true,
    });
  } catch (error) {
    console.error("Error submitting  information:", error);
    // Respond with an error message
    res.status(500).send({ msg: "Internal server error", success: false });
  }
});
app.get("/api/box-data", async (req, res) => {
  try {
    let data = await boxModel.find();

    res.status(200).send({ msg: "Done", success: true, data });
  } catch (e) {
    res.status(500).send({
      success: false,
      msg: "Something went wrong",
    });
  }
});
app.get("/api/box-data-protected", async (req, res) => {
  let secret = req.query.secret;
  let storedSecret = process.env.SECRET;
  try {
    if (!secret) {
      res.status(400).send({ msg: "No secret key provided", success: false });
      return;
    }
    if (secret != storedSecret) {
      res.status(400).send({
        msg: "Secret code is incorrect, please try again",
        success: false,
      });
      return;
    }
    let allData = await boxModel.find();

    res.status(200).send({ msg: "Done", success: true, allData });
  } catch (e) {
    res.status(500).send({
      success: false,
      msg: "Something went wrong",
    });
  }
});

app.patch("/api/update-user-info/:boxNumber", async (req, res) => {
  let { boxNumber } = req.params;
  let newData = req.body;
  console.log("newData: ", newData);

  try {
    const updatedData = await boxModel.findOneAndUpdate(
      { boxNumber: boxNumber },
      { $set: { userInfo: newData } },
      { new: true }
    );

    if (!updatedData) {
      return res.status(404).send({
        success: false,
        msg: "Box not found",
      });
    }

    res.status(200).send({
      msg: "Data updated successfully",
      success: true,
      updatedData,
    });
  } catch (e) {
    console.log(e);
    res.status(500).send({
      success: false,
      msg: "Something went wrong",
    });
  }
});
app.get("/api/update-delete-info/:boxNumber", async (req, res) => {
  let { boxNumber } = req.params;

  try {
    const updatedData = await boxModel.findOneAndDelete({
      boxNumber: boxNumber,
    });

    if (!updatedData) {
      return res.status(404).send({
        success: false,
        msg: "Box not found or already has been deleted",
      });
    }

    res.status(200).send({
      msg: "Box deleted successfully",
      success: true,
      updatedData,
    });
  } catch (e) {
    console.log(e);
    res.status(500).send({
      success: false,
      msg: "Something went wrong",
    });
  }
});

app.get("/", async (req, res) => {
  res.send("live");
});
app.listen(port, () => {
  console.log(`server is running at port no ${port}`);
});
