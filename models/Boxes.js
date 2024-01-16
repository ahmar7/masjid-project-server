const mongoose = require("mongoose");

let BoxSchema = new mongoose.Schema({
  boxNumber: {
    type: Number,
    required: true,
  },
  isFilled: {
    type: Boolean,
    default: false,
  },
  userInfo: {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    phoneNumber: {
      type: String,
      required: true,
    },
    isChecked: {
      type: Boolean,
      default: false,
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Box = mongoose.model("Box", BoxSchema);
module.exports = Box;
