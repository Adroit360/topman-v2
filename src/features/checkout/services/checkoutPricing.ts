export const PROCESSING_FEE_RATE = 0.02;

const MINOR_UNIT_SCALE = 100;

export const formatPrice = (amount: number) => amount.toFixed(2);

export const formatMinorAmount = (amountMinor: number) =>
  formatPrice(amountMinor / MINOR_UNIT_SCALE);

export const calculateCheckoutPricing = (subtotal: number) => {
  const subtotalMinor = Math.round(subtotal * MINOR_UNIT_SCALE);
  const processingFeeMinor = Math.round(subtotalMinor * PROCESSING_FEE_RATE);
  const totalMinor = subtotalMinor + processingFeeMinor;

  return {
    subtotalMinor,
    processingFeeMinor,
    totalMinor,
    subtotalAmount: subtotalMinor / MINOR_UNIT_SCALE,
    processingFeeAmount: processingFeeMinor / MINOR_UNIT_SCALE,
    totalAmount: totalMinor / MINOR_UNIT_SCALE,
    subtotalDisplay: formatMinorAmount(subtotalMinor),
    processingFeeDisplay: formatMinorAmount(processingFeeMinor),
    totalDisplay: formatMinorAmount(totalMinor),
  };
};
