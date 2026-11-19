interface PricedOrderItem {
  unitPrice: number;
  quantity: number;
}

export function totalConIva(items: readonly PricedOrderItem[]): number {
  const subtotalCents = items.reduce(
    (total, item) => total + Math.round(item.unitPrice * 100) * item.quantity,
    0,
  );
  return Math.round(subtotalCents * 1.21) / 100;
}
