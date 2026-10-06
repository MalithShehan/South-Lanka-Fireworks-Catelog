import { CONFIG } from '../config';

export const money = (n) => `${CONFIG.currency} ${Number(n).toLocaleString('en-LK')}`;

export const buildOrderText = (items, customer, total) => {
  const lines = items.map(
    (i, idx) => `${idx + 1}. ${i.label || i.name} x ${i.qty} = ${money(i.price * i.qty)}`,
  );
  return [
    `*New Order – ${CONFIG.businessName}*`,
    '',
    customer.name && `Name: ${customer.name}`,
    customer.phone && `Phone: ${customer.phone}`,
    customer.address && `Address: ${customer.address}`,
    '',
    '*Selected Items*',
    ...lines,
    '',
    `*Total: ${money(total)}*`,
    customer.note && `Note: ${customer.note}`,
    '',
    '(Order PDF attached)',
  ]
    .filter((l) => l !== false && l !== undefined && l !== null)
    .join('\n');
};
