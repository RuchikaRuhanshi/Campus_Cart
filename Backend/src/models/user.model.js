import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  mobileNo: {
    type: String,
    required: true,
    match: /^[0-9]{10}$/
  },
  image: {
    type: String,
    default: ""
  },
  collegeName: {
    type: String,
    required: true
  },
  yearOfStudy: {
    type: String
  },
  branch: {
    type: String,
    required: true
  },
  location: {
    address: { type: String, default: "" },
    coordinates: {
      lat: { type: Number, default: 0 },
      lng: { type: Number, default: 0 }
    }
  },
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user"
  },
  averageRating: {
    type: Number,
    default: 0
  },
  college: {
    type: String,
    default: "",
  },

  hostel: {
    type: String,
    default: "",
  },

  wishlist: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Item",
    },
  ],
  ratingCount: {
    type: Number,
    default: 0
  },
  favorites: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Item",
    index: true
  }],
  isVerifiedStudent: {
    type: Boolean,
    default: false,
  },
  isVerifiedSeller: {
    type: Boolean,
    default: false,
  },
  cart: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Item"
  }]
}, { timestamps: true });



const User = mongoose.model("User", userSchema);
export default User;
 