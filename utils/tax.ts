import { Category } from '../types';

export interface TaxInfo {
  gst: number;
  vat: number;
  tax: number;
}

export interface OrderTotals {
  subtotal: number;
  gst: number;
  vat: number;
  tax: number;
  discountAmount: number;
  total: number;
}

export function calculateOrderTax(
  items: Array<{ categoryId: string; price: number; quantity: number }>,
  categories: Category[],
  taxRate: number,
  drinkTaxRate: number
): TaxInfo {
  const taxInfo = items.reduce(
    (acc, item) => {
      const category = categories.find(c => String(c.id) === String(item.categoryId));
      const taxType = category?.taxType || (category?.type === 'DRINK' ? 'VAT' : 'GST');
      const itemSubtotal = item.price * item.quantity;

      if (taxType === 'VAT') {
        acc.vat += itemSubtotal * drinkTaxRate;
      } else if (taxType === 'GST') {
        acc.gst += itemSubtotal * taxRate;
      }
      return acc;
    },
    { gst: 0, vat: 0 }
  );

  return {
    gst: taxInfo.gst,
    vat: taxInfo.vat,
    tax: taxInfo.gst + taxInfo.vat,
  };
}

export function calculateOrderTotals(
  items: Array<{ categoryId: string; price: number; quantity: number }>,
  categories: Category[],
  taxRate: number,
  drinkTaxRate: number,
  discountType: 'PERCENT' | 'FIXED',
  discountValue: number
): OrderTotals {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const taxInfo = calculateOrderTax(items, categories, taxRate, drinkTaxRate);
  
  const gst = Math.round(taxInfo.gst);
  const vat = Math.round(taxInfo.vat);
  const tax = gst + vat;
  const totalBeforeDiscount = subtotal + tax;

  let discountAmount = 0;
  if (discountType === 'PERCENT') {
    discountAmount = Math.round(totalBeforeDiscount * (discountValue / 100));
  } else {
    discountAmount = Math.round(Math.min(totalBeforeDiscount, discountValue));
  }

  const total = totalBeforeDiscount - discountAmount;

  return {
    subtotal,
    gst,
    vat,
    tax,
    discountAmount,
    total,
  };
}
