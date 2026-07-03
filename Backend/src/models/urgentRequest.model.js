import mongoose from "mongoose";

const urgentRequestSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
      default: "Other"
    },
    urgency: {
      type: String,
      required: true,
      enum: ["Tonight", "Tomorrow", "Within 3 Days", "Flexible"],
      default: "Tomorrow"
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    resolved: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const UrgentRequest = mongoose.model("UrgentRequest", urgentRequestSchema);
export default UrgentRequest;
