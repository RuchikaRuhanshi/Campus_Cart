/**
 * @file item.controller.js
 * @description Item listing, creation, updates, and category filtering controller.
 */
import Item from "../models/item.model.js";

const SPAM_KEYWORDS = [
  "free money", "lottery", "cash prize", "promo code", "casino", "viagra",
  "win cash", "earn fast", "hack", "crack", "crypto", "bitcoin", "easy income",
  "make money", "work from home", "investment opportunity", "click here"
];

const checkFraud = async (itemData) => {
  const { title, price, description, seller, category } = itemData;
  const lowerTitle = title.toLowerCase();
  const lowerDesc = description.toLowerCase();

  // 1. Spam Listing Checks
  for (const keyword of SPAM_KEYWORDS) {
    if (lowerTitle.includes(keyword) || lowerDesc.includes(keyword)) {
      return { isFlagged: true, flagReason: `Spam keyword detected: "${keyword}"` };
    }
  }

  // URL / Link check
  const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+)/gi;
  if (urlRegex.test(title) || urlRegex.test(description)) {
    return { isFlagged: true, flagReason: "Contains external links/URLs" };
  }

  // Phone / Email check
  const phoneRegex = /(\+?\d{1,4}[\s-]?)?\(?\d{3}\)?[\s-]?\d{3}[\s-]?\d{4}/;
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
  if (phoneRegex.test(title) || emailRegex.test(title) || phoneRegex.test(description) || emailRegex.test(description)) {
    return { isFlagged: true, flagReason: "Contains contact details (phone/email) in title/description" };
  }

  // Repeating characters
  const repetitionRegex = /(.)\1{4,}/;
  if (repetitionRegex.test(lowerTitle) || repetitionRegex.test(lowerDesc)) {
    return { isFlagged: true, flagReason: "Excessive repeating characters" };
  }

  // 2. Price Checks
  const numericPrice = Number(price);
  if (isNaN(numericPrice) || numericPrice <= 0) {
    return { isFlagged: true, flagReason: "Price must be greater than zero" };
  }

  if (category) {
    const catLower = category.toLowerCase();
    if (catLower.includes("book") || catLower.includes("study")) {
      if (numericPrice > 10000) return { isFlagged: true, flagReason: "Price exceeds maximum threshold for books/study category (Max ₹10,000)" };
      if (numericPrice < 10) return { isFlagged: true, flagReason: "Price is lower than threshold for books/study category (Min ₹10)" };
    } else if (catLower.includes("electr") || catLower.includes("tv") || catLower.includes("gadget")) {
      if (numericPrice > 300000) return { isFlagged: true, flagReason: "Price exceeds maximum threshold for electronics (Max ₹300,000)" };
      if (numericPrice < 50) return { isFlagged: true, flagReason: "Price is lower than threshold for electronics (Min ₹50)" };
    } else if (catLower.includes("dorm") || catLower.includes("home") || catLower.includes("mattress")) {
      if (numericPrice > 50000) return { isFlagged: true, flagReason: "Price exceeds maximum threshold for dorm essentials (Max ₹50,000)" };
    } else if (catLower.includes("sport") || catLower.includes("fit") || catLower.includes("cycle")) {
      if (numericPrice > 60000) return { isFlagged: true, flagReason: "Price exceeds maximum threshold for sports/fitness category (Max ₹60,000)" };
    }
  }

  // 3. Duplicate Upload check
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const duplicate = await Item.findOne({
    seller,
    isSold: false,
    _id: { $ne: itemData._id },
    $or: [
      { title: { $regex: new RegExp(`^${title.trim()}$`, "i") } },
      { description: description.trim() }
    ],
    createdAt: { $gte: oneDayAgo }
  });

  if (duplicate) {
    return { isFlagged: true, flagReason: `Duplicate listing of "${duplicate.title}" detected within 24h` };
  }

  return { isFlagged: false, flagReason: "" };
};



const deleteItem = async(req,res)=>{
  try {

    const itemId = req.params.id;
    const userId = req.user.id;

    //find item
    const item = await Item.findById(itemId);
    if(!item){
      return res.status(404).json({
        success:false,
        message:"Item not found"
      })
    }

    //check ownership
    if(item.seller.toString() !== userId){
      return res.status(403).json({
        success:false,
        message:'you are not allowed to delete this'
      })
    }

    await Item.findByIdAndDelete(itemId);
    res.status(200).json({
      success:true,
      message:"item deleted successfully"
    })

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
}

const createItem = async (req, res) => {
  try {
    const { title, price, description, images, category, subCategory } = req.body;

    // Daily Limit Check
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const todayItemsCount = await Item.countDocuments({
      seller: req.user.id,
      createdAt: { $gte: startOfDay }
    });

    if (todayItemsCount >= 5) {
      return res.status(400).json({
        success: false,
        message: "You have reached your daily limit of 5 items"
      });
    }

    // Fraud Detection Logic
    const fraudCheck = await checkFraud({
      title,
      price,
      description,
      seller: req.user.id,
      category
    });

    if (fraudCheck.isFlagged) {
      return res.status(400).json({
        success: false,
        message: `Fraud warning: ${fraudCheck.flagReason}`
      });
    }

    const item = await Item.create({
      title,
      price,
      description,
      images,
      category,
      subCategory,
      seller: req.user.id,
      isFlagged: false
    });

    res.status(201).json({
      success: true,
      data: item
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};



const getItemById = async (req, res) => {
  try {
    const { id } = req.params;

    const item = await Item.findById(id)
      .populate("seller", "name collegeName averageRating ratingCount location isVerifiedSeller isVerifiedStudent");

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Item not found"
      });
    }

    res.status(200).json({
      success: true,
      data: item
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


const getAllItems = async (req, res) => {
  try {
    const items = await Item.find({ isSold: false, isFlagged: { $ne: true } })
      .populate("seller", "name collegeName averageRating ratingCount location isVerifiedSeller isVerifiedStudent")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: items.length,
      data: items
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


const updateItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, price, description, category, subCategory, images, isSold } = req.body;
    const userId = req.user.id;

    // Find item
    const item = await Item.findById(id);
    if (!item) {
      return res.status(404).json({ success: false, message: "Item not found" });
    }

    // Check ownership
    if (item.seller.toString() !== userId) {
      return res.status(403).json({ success: false, message: "You are not authorized to update this item" });
    }

    // Fraud Detection Logic on Update
    const fraudCheck = await checkFraud({
      _id: id,
      title: title || item.title,
      price: price !== undefined ? price : item.price,
      description: description || item.description,
      seller: userId,
      category: category || item.category
    });

    if (fraudCheck.isFlagged) {
      return res.status(400).json({
        success: false,
        message: `Fraud warning: ${fraudCheck.flagReason}`
      });
    }

    // Update item
    const updatedItem = await Item.findByIdAndUpdate(
      id,
      { title, price, description, category, subCategory, images, isSold },
      { new: true, runValidators: true }
    );

    res.json({ success: true, data: updatedItem, message: "Item updated successfully" });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export {
  createItem,
  getAllItems,
  getItemById,
  deleteItem,
  updateItem
};
 