/**
 * Algorithmic Pricing Engine for Helper Marketplace
 */
function calculateBookingPrice({
  baseServicePrice = 299,
  distanceKm = 1.5,
  isEmergency = false,
  scheduledTime = new Date(),
  couponDiscount = 0,
  commissionRate = 18
}) {
  const baseAmount = Number(baseServicePrice) || 299;

  // 1. Distance Surcharge: First 3 km free, ₹15 per km thereafter
  const distance = Math.max(0, Number(distanceKm) || 0);
  const distanceCharge = distance > 3 ? Math.round((distance - 3) * 15) : 0;

  // 2. Emergency Surge Charge (25% base + ₹99 flat)
  const emergencyCharge = isEmergency ? Math.round(baseAmount * 0.25 + 99) : 0;

  // 3. Night Surcharge (10:00 PM to 6:00 AM)
  const hour = new Date(scheduledTime).getHours();
  const isNight = hour >= 22 || hour < 6;
  const nightSurgeCharge = isNight ? 149 : 0;

  // 4. Platform Fee
  const platformFee = 29;

  // Gross Subtotal
  const grossSubtotal = baseAmount + distanceCharge + emergencyCharge + nightSurgeCharge + platformFee;

  // Apply Coupon Discount (capped at 50% of gross subtotal)
  const discountAmount = Math.min(Number(couponDiscount) || 0, Math.round(grossSubtotal * 0.5));
  const totalAmount = Math.max(99, grossSubtotal - discountAmount);

  // Platform Commission Breakdown
  const adminCommissionAmount = Math.round((baseAmount * commissionRate) / 100) + platformFee;
  const providerEarningsAmount = Math.max(0, totalAmount - adminCommissionAmount);

  return {
    baseAmount,
    distanceCharge,
    emergencyCharge,
    nightSurgeCharge,
    platformFee,
    discountAmount,
    totalAmount,
    adminCommissionAmount,
    providerEarningsAmount
  };
}

module.exports = { calculateBookingPrice };
