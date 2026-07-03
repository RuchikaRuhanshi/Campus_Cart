import CampusSpot from "../models/campusSpot.model.js";

// Create a new crowdsourced spot
export const createSpot = async (req, res) => {
  try {
    const { name, description, lat, lng, type, college } = req.body;
    
    if (!name || !description || !lat || !lng || !type || !college) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    const newSpot = new CampusSpot({
      name,
      description,
      lat: Number(lat),
      lng: Number(lng),
      type,
      college: college.trim(),
      createdBy: req.user?._id
    });

    await newSpot.save();
    res.status(201).json({ success: true, data: newSpot });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get spots for a college
export const getSpots = async (req, res) => {
  try {
    const { college } = req.query;
    if (!college) {
      return res.status(400).json({ success: false, message: "College name is required" });
    }

    const normalizedCollege = college.trim();
    const spots = await CampusSpot.find({
      college: { $regex: new RegExp(`^${normalizedCollege}$`, "i") }
    });

    res.status(200).json({ success: true, data: spots });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
