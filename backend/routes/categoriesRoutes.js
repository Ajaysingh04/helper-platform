const express = require("express");
const router = express.Router();
const Category = require("../models/Category");
const dbStore = require("../data/dbStore");
const { getStatus } = require("../config/db");
const popularCategoriesData = require("../data/popularCategoriesData");

// Helper to auto-seed popular categories in MongoDB if empty or outdated
async function ensureCategoriesSeeded() {
  try {
    if (!getStatus()) return;
    const count = await Category.countDocuments();
    if (count < popularCategoriesData.length) {
      console.log(`[Categories] Seeding/Updating ${popularCategoriesData.length} popular categories in MongoDB...`);
      for (const cat of popularCategoriesData) {
        await Category.findOneAndUpdate(
          { $or: [{ id: cat.id }, { name: cat.name }] },
          { ...cat, active: true },
          { upsert: true, new: true }
        );
      }
      console.log("[Categories] Successfully seeded 85 popular categories to MongoDB.");
    }
  } catch (err) {
    console.warn("[Categories] Auto-seed note:", err.message);
  }
}

// GET /api/categories/popular
router.get("/popular", async (req, res) => {
  try {
    let list = [];
    if (getStatus()) {
      await ensureCategoriesSeeded();
      list = await Category.find({ popular: true, active: true }).sort({ order: 1 });
    } else {
      list = dbStore.getAll("categories").filter(c => c.popular !== false);
    }
    if (!list || list.length === 0) {
      list = popularCategoriesData;
    }
    return res.json({ success: true, count: list.length, data: list });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/categories
router.get("/", async (req, res) => {
  try {
    const { group, search, popular } = req.query;

    if (getStatus()) {
      await ensureCategoriesSeeded();
      const query = { active: true };
      if (group && group !== "All") {
        query.group = new RegExp(group, "i");
      }
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: "i" } },
          { tag: { $regex: search, $options: "i" } },
          { group: { $regex: search, $options: "i" } }
        ];
      }
      if (popular === "true") {
        query.popular = true;
      }

      const categories = await Category.find(query).sort({ order: 1 });
      return res.json({ 
        success: true, 
        count: categories.length, 
        data: categories.length > 0 ? categories : popularCategoriesData 
      });
    }

    // Local DB / dbStore fallback
    let categories = dbStore.getAll("categories");
    if (!categories || categories.length === 0) {
      categories = popularCategoriesData;
    }

    if (group && group !== "All") {
      categories = categories.filter(c => c.group && c.group.toLowerCase().includes(group.toLowerCase()));
    }
    if (search) {
      const q = search.toLowerCase();
      categories = categories.filter(c => 
        (c.name && c.name.toLowerCase().includes(q)) || 
        (c.tag && c.tag.toLowerCase().includes(q)) || 
        (c.group && c.group.toLowerCase().includes(q))
      );
    }
    if (popular === "true") {
      categories = categories.filter(c => c.popular !== false);
    }

    res.json({ success: true, count: categories.length, data: categories });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/categories/seed - Manual trigger to reload all 85 categories
router.post("/seed", async (req, res) => {
  try {
    let seeded = 0;
    if (getStatus()) {
      for (const cat of popularCategoriesData) {
        await Category.findOneAndUpdate(
          { $or: [{ id: cat.id }, { name: cat.name }] },
          { ...cat, active: true },
          { upsert: true, new: true }
        );
        seeded++;
      }
    } else {
      dbStore.data.categories = popularCategoriesData;
      dbStore.save();
      seeded = popularCategoriesData.length;
    }
    res.json({ success: true, message: `Successfully seeded ${seeded} categories`, count: seeded });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/categories
router.post("/", async (req, res) => {
  try {
    const { name, icon, count, path, tag } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, message: "Category name is required" });
    }

    const newCat = {
      id: `${Date.now()}`,
      name,
      icon: icon || "⚡",
      count: count || "0+ Pros",
      path: path || name.toLowerCase().replace(/\s+/g, "-"),
      tag: tag || "General",
      active: true
    };

    if (getStatus()) {
      const saved = await Category.create(newCat);
      return res.status(201).json({ success: true, message: "Category created successfully", data: saved });
    }

    const saved = dbStore.insert("categories", newCat);
    res.status(201).json({ success: true, message: "Category created successfully", data: saved });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/categories/:id
router.put("/:id", async (req, res) => {
  try {
    if (getStatus()) {
      let updated = await Category.findOneAndUpdate({ id: req.params.id }, req.body, { new: true });
      if (!updated) {
        updated = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true }).catch(() => null);
      }
      if (!updated) return res.status(404).json({ success: false, message: "Category not found" });
      return res.json({ success: true, message: "Category updated successfully", data: updated });
    }

    const updated = dbStore.update("categories", req.params.id, req.body);
    if (!updated) return res.status(404).json({ success: false, message: "Category not found" });
    res.json({ success: true, message: "Category updated successfully", data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/categories/:id
router.delete("/:id", async (req, res) => {
  try {
    if (getStatus()) {
      let deleted = await Category.findOneAndDelete({ id: req.params.id });
      if (!deleted) {
        deleted = await Category.findByIdAndDelete(req.params.id).catch(() => null);
      }
      if (!deleted) return res.status(404).json({ success: false, message: "Category not found" });
      return res.json({ success: true, message: "Category deleted successfully" });
    }

    const success = dbStore.delete("categories", req.params.id);
    if (!success) return res.status(404).json({ success: false, message: "Category not found" });
    res.json({ success: true, message: "Category deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
