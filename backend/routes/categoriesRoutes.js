const express = require("express");
const router = express.Router();
const dbStore = require("../data/dbStore");

// GET /api/categories
router.get("/", (req, res) => {
  const categories = dbStore.getAll("categories");
  res.json({ success: true, count: categories.length, data: categories });
});

// POST /api/categories
router.post("/", (req, res) => {
  const { name, icon, count } = req.body;
  if (!name) {
    return res.status(400).json({ success: false, message: "Category name is required" });
  }

  const newCat = {
    id: `${Date.now()}`,
    name,
    icon: icon || "⚡",
    count: count || "0+ Pros",
    active: true
  };

  const saved = dbStore.insert("categories", newCat);
  res.status(201).json({ success: true, message: "Category created successfully", data: saved });
});

// PUT /api/categories/:id
router.put("/:id", (req, res) => {
  const updated = dbStore.update("categories", req.params.id, req.body);
  if (!updated) {
    return res.status(404).json({ success: false, message: "Category not found" });
  }
  res.json({ success: true, message: "Category updated successfully", data: updated });
});

// DELETE /api/categories/:id
router.delete("/:id", (req, res) => {
  const success = dbStore.delete("categories", req.params.id);
  if (!success) {
    return res.status(404).json({ success: false, message: "Category not found" });
  }
  res.json({ success: true, message: "Category deleted successfully" });
});

module.exports = router;
