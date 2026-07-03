import mongoose from "mongoose";

const campusSpotSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    type: { type: String, enum: ["hotspot", "safespot"], required: true },
    college: { type: String, required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
  },
  { timestamps: true }
);

export default mongoose.model("CampusSpot", campusSpotSchema);
