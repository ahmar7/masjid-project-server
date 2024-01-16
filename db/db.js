const mongoose = require("mongoose");

mongoose
  .connect(process.env.DATABASE)
  .then(() => {
    console.log("Connection successful");
  })
  .catch((e) => {
    console.log("e: ", e);
    console.log("no connection");
  });
