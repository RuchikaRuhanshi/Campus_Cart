import User from "../models/user.model.js";
import Item from "../models/item.model.js";
import Order from "../models/order.model.js";

/**
 * Fetches general statistics of the marketplace (public facing)
 */
export const getPublicStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: "user" });
    const activeListings = await Item.countDocuments({ isSold: false });
    
    // Count completed orders (case-insensitive check for completed/COMPLETED)
    const completedTrades = await Order.countDocuments({ 
      status: { $regex: /^(completed|COMPLETED)$/ } 
    });

    // Group items by category to get category statistics
    const categoryStats = await Item.aggregate([
      { $match: { isSold: false } },
      { $group: { _id: "$category", count: { $sum: 1 } } }
    ]);

    const formattedCategories = categoryStats.map(stat => ({
      category: stat._id || "Other",
      count: stat.count
    }));

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        activeListings,
        completedTrades,
        categoryStats: formattedCategories
      }
    });
  } catch (error) {
    console.error("Error in getPublicStats:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Computes a leaderboard of top campus sellers based on ratings, sales, and listing count
 */
export const getLeaderboard = async (req, res) => {
  try {
    // Fetch all users with ratings
    const users = await User.find({ role: "user" })
      .select("name email branch collegeName averageRating ratingCount image isVerifiedStudent isVerifiedSeller")
      .lean();

    // Fetch orders count per user (sold counts)
    const completedOrders = await Order.aggregate([
      { $match: { status: { $regex: /^(completed|COMPLETED)$/ } } },
      { $group: { _id: "$seller", count: { $sum: 1 } } }
    ]);

    const salesMap = {};
    completedOrders.forEach(o => {
      if (o._id) salesMap[o._id.toString()] = o.count;
    });

    // Fetch total active listing count per user
    const activeListings = await Item.aggregate([
      { $match: { isSold: false } },
      { $group: { _id: "$seller", count: { $sum: 1 } } }
    ]);

    const listingMap = {};
    activeListings.forEach(l => {
      if (l._id) listingMap[l._id.toString()] = l.count;
    });

    // Compute custom ranking score
    const rankedUsers = users.map(user => {
      const salesCount = salesMap[user._id.toString()] || 0;
      const listingCount = listingMap[user._id.toString()] || 0;
      const rating = user.averageRating || 0;
      
      // Rank Score = rating*15 + sales*10 + listings*3
      const rankScore = (rating * 15) + (salesCount * 10) + (listingCount * 3);

      // Determine badge tier
      let badgeTitle = "Rising Star 💫";
      let badgeColor = "from-slate-400 to-slate-500";
      if (rankScore >= 50) {
        badgeTitle = "Campus Legend 👑";
        badgeColor = "from-[#8b6d48] via-[#d4b16c] to-[#f1d8a1]";
      } else if (rankScore >= 30) {
        badgeTitle = "Gold Merchant 🌟";
        badgeColor = "from-amber-400 to-amber-600";
      } else if (rankScore >= 15) {
        badgeTitle = "Silver Trader 🛡️";
        badgeColor = "from-blue-400 to-indigo-500";
      }

      return {
        ...user,
        salesCount,
        listingCount,
        rankScore: Math.round(rankScore),
        badgeTitle,
        badgeColor
      };
    });

    // Sort by rankScore descending
    rankedUsers.sort((a, b) => b.rankScore - a.rankScore);

    // Return top 15 sellers
    res.status(200).json({
      success: true,
      data: rankedUsers.slice(0, 15)
    });
  } catch (error) {
    console.error("Error in getLeaderboard:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * AI Demand & Price prediction for an item listing
 */
export const predictItemDemand = async (req, res) => {
  try {
    const { title, category, price } = req.body;
    if (!title || !category || !price) {
      return res.status(400).json({ success: false, message: "Missing required fields (title, category, price)" });
    }

    const priceNum = Number(price);
    
    // Simulate AI Prediction metrics using localized rules and smart scoring
    let demandIndex = "Moderate 📈";
    let expectedSellTime = "1-2 days";
    let recommendedPrice = priceNum;
    let demandScore = 50; // 0 to 100
    
    const catLower = category.toLowerCase();
    const titleLower = title.toLowerCase();

    // 1. Demand & Sell velocity estimation
    if (catLower.includes("books") || catLower.includes("notes") || titleLower.includes("semester") || titleLower.includes("pyq")) {
      demandScore += 25;
      expectedSellTime = "2-6 hours";
      recommendedPrice = priceNum * 0.9; // books sell faster if slightly cheaper
    } else if (catLower.includes("electronics") || titleLower.includes("phone") || titleLower.includes("calc") || titleLower.includes("charger")) {
      demandScore += 15;
      expectedSellTime = "12-24 hours";
    }

    if (priceNum <= 150) {
      demandScore += 20;
      expectedSellTime = "1-3 hours";
    } else if (priceNum > 5000) {
      demandScore -= 20;
      expectedSellTime = "3-5 days";
    }

    // Clip demand score
    demandScore = Math.max(10, Math.min(99, demandScore));

    if (demandScore >= 75) {
      demandIndex = "Very High 🔥";
    } else if (demandScore >= 50) {
      demandIndex = "High ⚡";
    } else if (demandScore >= 35) {
      demandIndex = "Moderate 📈";
    } else {
      demandIndex = "Low 💤";
    }

    // Recommended Range
    const priceMin = Math.round(recommendedPrice * 0.85);
    const priceMax = Math.round(recommendedPrice * 1.05);

    // Tips generator
    const tips = [];
    if (demandScore >= 75) {
      tips.push("High demand detected! Stick to your price or highlight 'First come, first served'.");
    } else {
      tips.push(`Consider lowering your price slightly closer to ₹${priceMin} to speed up the sale.`);
    }
    
    if (titleLower.length < 10) {
      tips.push("Add more details to your title (e.g. state edition, brand, or condition).");
    }

    tips.push("Provide delivery near campus hubs (e.g. Student Center, Main Plaza, Library) for maximum buyers.");
    tips.push("Upload high-quality, clear photos showing all angles of the item.");

    res.status(200).json({
      success: true,
      data: {
        demandScore,
        demandIndex,
        expectedSellTime,
        recommendedPriceRange: { min: priceMin, max: priceMax },
        aiTips: tips
      }
    });
  } catch (error) {
    console.error("Error in predictItemDemand:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * AI Copilot Assistance Chat handler
 */
export const aiCopilotChat = async (req, res) => {
  try {
    const { message, context } = req.body;
    if (!message) {
      return res.status(400).json({ success: false, message: "Missing chat message" });
    }

    const msgLower = message.toLowerCase();
    let reply = "";

    // Rule-based smart chatbot response system (AI Agent persona)
    if (msgLower.includes("draft") || msgLower.includes("write") || msgLower.includes("listing")) {
      reply = `Here is a drafted listing optimized for campus buyers:

**Title**: [Brand/Model] - [Item Name] (Excellent Condition)
**Description**: Selling my [Item Name] since I no longer need it for classes. 
- **Condition**: 9/10, fully functional, no damage.
- **Includes**: All original accessories.
- **Meetup**: Happy to hand over at the Central Library or Central Plaza.
- **Price**: Open to minor negotiations!

Feel free to customize this and list it on the "Sell" tab!`;
    } 
    else if (msgLower.includes("safety") || msgLower.includes("safe") || msgLower.includes("scam")) {
      reply = `🔒 **Campus Safety Guidelines for Trading:**
1. **Meet in daylight**: Meet at designated high-traffic spots. Use the **Campus Map** tab to find verified safe meetup spots.
2. **Inspect first, pay second**: Always verify the item's condition in person before transferring money.
3. **Bring a friend**: When meeting someone new, it is always a good idea to go with a roommate or friend.
4. **Use digital transfer**: Prefer secure UPI/bank transfers over carrying large amounts of cash.`;
    } 
    else if (msgLower.includes("negotiate") || msgLower.includes("negotiation") || msgLower.includes("discount")) {
      reply = `🤝 **Smart Campus Negotiation Tips:**
- **For Buyers**: Be polite. Politely ask: *"Hey! I am interested. Would you be willing to close it at ₹X for a quick meetup today?"*
- **For Sellers**: Price your items about 10-15% higher than your target price to leave room for friendly bargaining.
- **Quick Deal**: Highlight your availability: *"I can meet you right now at your hostel lobby if we agree on this price."*`;
    } 
    else if (msgLower.includes("help") || msgLower.includes("hello") || msgLower.includes("hey") || msgLower.includes("hi")) {
      reply = `Hello! I'm your **CampusCart AI Assistant** 🤖. I am here to help you navigate campus trading!

Here is what I can do:
- ✍️ **Draft a Listing**: Tell me what you're selling and I will write a premium description for you.
- 💰 **Pricing & Demand**: Ask me about how to price your item or predict selling velocity.
- 🔒 **Trading Safety**: Ask me how to conduct trade meets safely on campus.
- 🤝 **Negotiating Hacks**: Ask me how to lock in the best deals with campus peers.

What can I assist you with today?`;
    } 
    else {
      reply = `I understand! As your campus AI copilot, I suggest checking out our **Campus Stats & AI** dashboard (using the menu) to predict demand and see average price ranges for category listings. 

If you are listing a new item, remember to use descriptive titles, set fair prices, and choose high-traffic campus zones for handovers. Let me know if you'd like me to draft a listing description or share negotiation tips!`;
    }

    res.status(200).json({
      success: true,
      data: {
        reply
      }
    });
  } catch (error) {
    console.error("Error in aiCopilotChat:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * AI-assisted smart listing helper
 * Suggests title, category, subcategory, price, and description based on text inputs or filename
 */
export const suggestListingInfo = async (req, res) => {
  try {
    const { title, fileName } = req.body;
    
    let textToAnalyze = "";
    if (title) textToAnalyze += " " + title;
    if (fileName) textToAnalyze += " " + fileName;
    
    textToAnalyze = textToAnalyze.toLowerCase().trim();
    
    // Heuristic Rules
    let suggestedTitle = title || "";
    let category = "Other";
    let subCategory = "General";
    let price = 500;
    let description = "Selling this item in good working condition. Ideal for campus students. Open to meetups at the library or hostel lobby.";
    
    if (textToAnalyze.match(/(macbook|laptop|dell|hp|lenovo|ipad|computer)/)) {
      if (!suggestedTitle) suggestedTitle = "Premium Study Laptop";
      category = "Electronics";
      subCategory = "Laptops / Computers";
      price = 35000;
      description = "Selling my laptop in excellent condition. Used for 2 years for college assignments. Battery health is great, comes with original charger and box.";
    } else if (textToAnalyze.match(/(phone|iphone|samsung|oneplus|android)/)) {
      if (!suggestedTitle) suggestedTitle = "Smartphone";
      category = "Electronics";
      subCategory = "Mobile Phones";
      price = 15000;
      description = "Smartphone in excellent shape. No scratches on screen, always used with a case. Includes charger and original accessories.";
    } else if (textToAnalyze.match(/(calculator|casio|scientific)/)) {
      if (!suggestedTitle) suggestedTitle = "Casio Scientific Calculator";
      category = "Electronics";
      subCategory = "Calculators / Math";
      price = 450;
      description = "Casio Scientific Calculator, perfect for engineering or physics classes. Fully functional with brand new battery.";
    } else if (textToAnalyze.match(/(book|physics|chemistry|math|textbook|semester|hcv|hc verma|notes|pyq)/)) {
      if (!suggestedTitle) suggestedTitle = "Semester Course Textbook";
      category = "Books";
      subCategory = "Course Materials";
      price = 250;
      description = "Textbook in clean condition. No pages missing, very minor pencil markings inside. Extremely helpful for semester exams.";
    } else if (textToAnalyze.match(/(coat|apron|lab)/)) {
      if (!suggestedTitle) suggestedTitle = "Unisex Lab Coat";
      category = "Clothing";
      subCategory = "Lab Aprons";
      price = 180;
      description = "White lab coat / apron, size M. Used only for a few chemistry lab sessions. Freshly washed, no stains.";
    } else if (textToAnalyze.match(/(cycle|bicycle|hero|atlas|gear cycle)/)) {
      if (!suggestedTitle) suggestedTitle = "Campus Gear Bicycle";
      category = "Sports";
      subCategory = "Bicycles";
      price = 3200;
      description = "Campus gear bicycle in great running condition. Comfortable seat, responsive brakes, and tires are in good shape. Perfect for riding to lectures.";
    } else if (textToAnalyze.match(/(chair|table|study|bed|lamp|furniture)/)) {
      if (!suggestedTitle) suggestedTitle = "Ergonomic Study Desk / Chair";
      category = "Furniture";
      subCategory = "Hostel Essentials";
      price = 800;
      description = "Perfect study desk / chair for hostel room. Sturdy build, comfortable, and takes up minimal space.";
    } else if (textToAnalyze.match(/(tshirt|jacket|hoodie|jeans|clothing|apparel)/)) {
      if (!suggestedTitle) suggestedTitle = "Campus Hoodie / Apparel";
      category = "Clothing";
      subCategory = "Apparel";
      price = 350;
      description = "Premium hoodie/apparel in M/L size. Comfortable material, perfect for winters on campus. No wear or tear.";
    } else if (textToAnalyze.match(/(bat|racket|badminton|football|cricket|sports|fitness)/)) {
      if (!suggestedTitle) suggestedTitle = "Sports Equipment";
      category = "Sports";
      subCategory = "Sports / Fitness";
      price = 500;
      description = "Sports gear in great playable condition. Ideal for campus play fields or hostels. Open to quick handovers.";
    }
    
    // Capitalize title if it was generated from fileName
    if (!title && suggestedTitle) {
      // clean name from filename
      suggestedTitle = suggestedTitle
        .replace(/[\-_]/g, " ")
        .replace(/\.[^/.]+$/, "") // strip extension
        .replace(/\b\w/g, c => c.toUpperCase());
    }
    
    res.status(200).json({
      success: true,
      data: {
        title: suggestedTitle,
        category,
        subCategory,
        price,
        description
      }
    });
  } catch (error) {
    console.error("Error in suggestListingInfo:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
