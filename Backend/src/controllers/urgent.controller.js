import UrgentRequest from "../models/urgentRequest.model.js";
import Item from "../models/item.model.js";
import User from "../models/user.model.js";
import CampusSpot from "../models/campusSpot.model.js";

export const createUrgentRequest = async (req, res) => {
  try {
    const { title, description, category, urgency } = req.body;
    const userId = req.user.id;

    const request = await UrgentRequest.create({
      title,
      description,
      category,
      urgency,
      user: userId,
    });

    res.status(201).json({
      success: true,
      data: request,
      message: "Urgent request posted successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllUrgentRequests = async (req, res) => {
  try {
    const requests = await UrgentRequest.find({ resolved: false })
      .populate("user", "name email collegeName branch image mobileNo location")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: requests,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const resolveUrgentRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const request = await UrgentRequest.findById(id);
    if (!request) {
      return res.status(404).json({ success: false, message: "Request not found" });
    }

    if (request.user.toString() !== userId) {
      return res.status(403).json({ success: false, message: "Unauthorized to resolve this request" });
    }

    request.resolved = true;
    await request.save();

    res.status(200).json({
      success: true,
      message: "Request marked as resolved",
      data: request,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const COLLEGE_COORDINATES = {
  "delhi": { lat: 28.545, lng: 77.272 },
  "bombay": { lat: 19.1334, lng: 72.9133 },
  "iitb": { lat: 19.1334, lng: 72.9133 },
  "kharagpur": { lat: 22.3149, lng: 87.3105 },
  "iitkgp": { lat: 22.3149, lng: 87.3105 },
  "madras": { lat: 12.9915, lng: 80.2336 },
  "iitm": { lat: 12.9915, lng: 80.2336 },
  "kanpur": { lat: 26.5123, lng: 80.2329 },
  "iitk": { lat: 26.5123, lng: 80.2329 },
  "dtu": { lat: 28.7501, lng: 77.1177 },
  "nsut": { lat: 28.6083, lng: 77.0373 },
  "pilani": { lat: 28.3639, lng: 75.5870 },
  "bits": { lat: 28.3639, lng: 75.5870 },
  "vit": { lat: 12.9692, lng: 79.1559 },
  "vellore": { lat: 12.9692, lng: 79.1559 },
  "srm": { lat: 12.8235, lng: 80.0424 },
  "mit": { lat: 42.3601, lng: -71.0942 },
  "stanford": { lat: 37.4275, lng: -122.1697 },
  "jamshedpur": { lat: 22.7744, lng: 86.1414 },
  "nit jamshedpur": { lat: 22.7744, lng: 86.1414 }
};

const getCollegeCoords = (name) => {
  if (!name) return null;
  const normalized = name.toLowerCase();
  for (const [key, coords] of Object.entries(COLLEGE_COORDINATES)) {
    if (normalized.includes(key)) {
      return coords;
    }
  }
  return null;
};

export const getHeatmapData = async (req, res) => {
  try {
    const { college } = req.query;

    // 1. Get active trade spots from items seller location (optimized DB-level filtering)
    let items;
    if (college) {
      const users = await User.find({
        collegeName: { $regex: new RegExp(`^${college.trim()}$`, "i") }
      }).select("_id");
      const userIds = users.map(u => u._id);
      items = await Item.find({ isSold: false, seller: { $in: userIds } })
        .populate("seller", "location collegeName");
    } else {
      items = await Item.find({ isSold: false })
        .populate("seller", "location collegeName");
    }

    // Group active coordinates
    const tradeLocations = items
      .filter(item => item.seller?.location?.coordinates?.lat)
      .map(item => ({
        lat: item.seller.location.coordinates.lat,
        lng: item.seller.location.coordinates.lng,
        weight: 1,
        category: item.category,
        title: item.title,
        college: item.seller.collegeName
      }));

    // Calculate center of trade locations to anchor safe spots locally
    let centerLat = 28.545;
    let centerLng = 77.272;

    if (tradeLocations.length > 0) {
      const sumLat = tradeLocations.reduce((sum, loc) => sum + loc.lat, 0);
      const sumLng = tradeLocations.reduce((sum, loc) => sum + loc.lng, 0);
      centerLat = sumLat / tradeLocations.length;
      centerLng = sumLng / tradeLocations.length;
    } else if (college) {
      // Fallback 1: Try database users from this college who have valid coordinates
      const users = await User.find({
        collegeName: { $regex: new RegExp(college.trim(), "i") }
      });
      const usersWithCoords = users.filter(u => u.location?.coordinates?.lat && u.location.coordinates.lat !== 0);
      if (usersWithCoords.length > 0) {
        const sumLat = usersWithCoords.reduce((sum, u) => sum + u.location.coordinates.lat, 0);
        const sumLng = usersWithCoords.reduce((sum, u) => sum + u.location.coordinates.lng, 0);
        centerLat = sumLat / usersWithCoords.length;
        centerLng = sumLng / usersWithCoords.length;
      } else {
        // Fallback 2: Check matching hardcoded coordinates
        const coords = getCollegeCoords(college);
        if (coords) {
          centerLat = coords.lat;
          centerLng = coords.lng;
        }
      }
    }

    // 2. Retrieve actual user-reported Safe Meetup Spots from the database
    const campusSpots = college 
      ? await CampusSpot.find({ 
          college: { $regex: new RegExp(`^${college.trim()}$`, "i") },
          type: "safespot"
        })
      : await CampusSpot.find({ type: "safespot" });

    const safeSpots = campusSpots.map(spot => ({
      name: spot.name,
      description: spot.description,
      lat: spot.lat,
      lng: spot.lng,
      type: "Safe Spot"
    }));

    res.status(200).json({
      success: true,
      tradesCount: tradeLocations.length,
      tradeLocations,
      safeSpots,
      center: { lat: centerLat, lng: centerLng }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
