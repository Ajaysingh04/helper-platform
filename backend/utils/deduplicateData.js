const Category = require("../models/Category");
const Service = require("../models/Service");
const Booking = require("../models/Booking");
const dbStore = require("../data/dbStore");
const { getStatus } = require("../config/db");

/**
 * Deduplicates categories and services in MongoDB and dbStore.
 * Removes duplicate records keeping the best/most-complete record,
 * and updates references across services and bookings.
 */
async function deduplicateAll() {
  const result = {
    duplicateCategoriesRemoved: 0,
    duplicateServicesRemoved: 0,
    servicesUpdated: 0,
    bookingsUpdated: 0,
  };

  try {
    if (getStatus()) {
      // 1. Deduplicate Categories in MongoDB
      const allCategories = await Category.find({});
      const categoryMap = new Map();

      for (const cat of allCategories) {
        const normName = (cat.name || "").trim().toLowerCase();
        if (!normName) continue;

        if (!categoryMap.has(normName)) {
          categoryMap.set(normName, [cat]);
        } else {
          categoryMap.get(normName).push(cat);
        }
      }

      for (const [normName, list] of categoryMap.entries()) {
        if (list.length > 1) {
          // Keep the primary: prefer one with an image and newest
          list.sort((a, b) => {
            const aHasImg = a.image && a.image.length > 5 ? 1 : 0;
            const bHasImg = b.image && b.image.length > 5 ? 1 : 0;
            if (aHasImg !== bHasImg) return bHasImg - aHasImg;
            return new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0);
          });

          const primary = list[0];
          const duplicates = list.slice(1);

          for (const dup of duplicates) {
            // Update services referencing this duplicate
            const sUpdate = await Service.updateMany(
              { category: { $regex: new RegExp(`^${dup.name}$`, "i") } },
              { $set: { category: primary.name } }
            );
            result.servicesUpdated += sUpdate.modifiedCount || 0;

            // Update bookings referencing this duplicate category
            const bUpdate = await Booking.updateMany(
              { serviceCategory: { $regex: new RegExp(`^${dup.name}$`, "i") } },
              { $set: { serviceCategory: primary.name } }
            );
            result.bookingsUpdated += bUpdate.modifiedCount || 0;

            // Delete the duplicate category
            await Category.findByIdAndDelete(dup._id);
            result.duplicateCategoriesRemoved++;
          }
        }
      }

      // 2. Deduplicate Services in MongoDB
      const allServices = await Service.find({});
      const serviceMap = new Map();

      for (const serv of allServices) {
        const normName = (serv.name || "").trim().toLowerCase();
        if (!normName) continue;

        if (!serviceMap.has(normName)) {
          serviceMap.set(normName, [serv]);
        } else {
          serviceMap.get(normName).push(serv);
        }
      }

      for (const [normName, list] of serviceMap.entries()) {
        if (list.length > 1) {
          // Sort to keep the best: prefer one with image and price
          list.sort((a, b) => {
            const aHasImg = a.image && a.image.length > 5 ? 1 : 0;
            const bHasImg = b.image && b.image.length > 5 ? 1 : 0;
            if (aHasImg !== bHasImg) return bHasImg - aHasImg;
            return (b.price || 0) - (a.price || 0);
          });

          const primary = list[0];
          const duplicates = list.slice(1);

          for (const dup of duplicates) {
            // Update bookings referencing this duplicate service
            const bUpdate = await Booking.updateMany(
              {
                $or: [
                  { serviceName: { $regex: new RegExp(`^${dup.name}$`, "i") } },
                  { service: dup.id || dup._id.toString() }
                ]
              },
              { $set: { serviceName: primary.name, service: primary.name } }
            );
            result.bookingsUpdated += bUpdate.modifiedCount || 0;

            // Delete the duplicate service
            await Service.findByIdAndDelete(dup._id);
            result.duplicateServicesRemoved++;
          }
        }
      }
    }

    // 3. Deduplicate dbStore fallback
    if (dbStore && dbStore.data) {
      if (Array.isArray(dbStore.data.categories)) {
        const seenCats = new Set();
        const uniqueCats = [];
        for (const c of dbStore.data.categories) {
          const k = (c.name || "").trim().toLowerCase();
          if (!seenCats.has(k)) {
            seenCats.add(k);
            uniqueCats.push(c);
          }
        }
        dbStore.data.categories = uniqueCats;
      }

      if (Array.isArray(dbStore.data.services)) {
        const seenServs = new Set();
        const uniqueServs = [];
        for (const s of dbStore.data.services) {
          const k = (s.name || "").trim().toLowerCase();
          if (!seenServs.has(k)) {
            seenServs.add(k);
            uniqueServs.push(s);
          }
        }
        dbStore.data.services = uniqueServs;
      }
      dbStore.save();
    }

    console.log("[Deduplication] Clean-up summary:", result);
  } catch (err) {
    console.error("[Deduplication Error]:", err.message);
  }

  return result;
}

module.exports = { deduplicateAll };
