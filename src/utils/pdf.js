import { CONFIG } from '../config';

const money = (n) => `${CONFIG.currency} ${Number(n).toLocaleString('en-US')}`;

// Load an image and convert it to a small square JPEG data URL for the PDF.
const loadImage = (src, size = 240) =>
  new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const c = document.createElement('canvas');
        c.width = c.height = size;
        const ctx = c.getContext('2d');
        const s = Math.min(img.width, img.height);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, size, size);
        ctx.drawImage(img, (img.width - s) / 2, (img.height - s) / 2, s, s, 0, 0, size, size);
        resolve(c.toDataURL('image/jpeg', 0.85));
      } catch {
        resolve(null);
      }
    };
    img.onerror = () => resolve(null);
    img.src = src;
  });

/** Builds a professional branded PDF quotation and returns { blob, fileName, orderNo }. */
export async function generateOrderPdf(items, customer, total) {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const W = 210;
  const now = new Date();
  const orderNo = `SLF-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${String(now.getTime()).slice(-4)}`;
  const logo = await loadImage('/assets/MainLogo.jpg', 200);

  const header = () => {
    // Professional header with luxury deep slate background
    doc.setFillColor(15, 23, 42); // slate-900
    doc.rect(0, 0, W, 38, 'F');
    doc.setFillColor(245, 158, 11); // amber-500 gold bar
    doc.rect(0, 38, W, 1.8, 'F');
    
    let x = 14;
    if (logo) {
      doc.addImage(logo, 'JPEG', 12, 5, 28, 28);
      x = 45;
    }
    
    doc.setTextColor(245, 158, 11);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(19);
    doc.text(CONFIG.businessName.toUpperCase(), x, 17);
    
    doc.setFontSize(9);
    doc.setTextColor(203, 213, 225); // slate-300
    doc.setFont('helvetica', 'normal');
    doc.text(CONFIG.tagline, x, 24);
    doc.text(`${CONFIG.phone}  |  ${CONFIG.address}`, x, 30);
    
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('ORDER QUOTATION', W - 14, 16, { align: 'right' });
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(226, 232, 240);
    doc.text(`Ref: ${orderNo}`, W - 14, 23, { align: 'right' });
    doc.text(`Date: ${now.toLocaleDateString('en-GB')}`, W - 14, 29, { align: 'right' });
  };

  header();
  let y = 48;
  
  // Customer Box with clean light styling
  doc.setFillColor(248, 250, 252); // slate-50
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.roundedRect(14, y, W - 28, 26, 2, 2, 'FD');
  
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('CUSTOMER INFORMATION', 18, y + 6);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(51, 65, 85);
  doc.text(`Name: ${customer.name || 'Valued Customer'}`, 18, y + 13);
  doc.text(`Phone: ${customer.phone || 'N/A'}`, 18, y + 19);
  
  const addrText = customer.address ? `Address: ${customer.address}` : 'Delivery: Standard';
  const splitAddr = doc.splitTextToSize(addrText, 85);
  doc.text(splitAddr, 110, y + 13);
  if (customer.note) {
    const splitNote = doc.splitTextToSize(`Note: ${customer.note}`, 85);
    doc.text(splitNote, 110, y + 19);
  }
  
  y += 33;

  const images = await Promise.all(items.map((i) => loadImage(i.image)));

  const tableHead = () => {
    doc.setFillColor(234, 88, 12); // festive amber/orange accent
    doc.rect(14, y, W - 28, 8.5, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('PRODUCT DETAILS', 38, y + 5.8);
    doc.text('UNIT PRICE', 130, y + 5.8, { align: 'right' });
    doc.text('QTY', 150, y + 5.8, { align: 'center' });
    doc.text('AMOUNT', W - 18, y + 5.8, { align: 'right' });
    y += 8.5;
  };
  tableHead();

  const rowH = 20;
  items.forEach((it, idx) => {
    if (y + rowH > 265) {
      doc.addPage();
      header();
      y = 48;
      tableHead();
    }
    
    // Alternating rows
    if (idx % 2 === 0) {
      doc.setFillColor(255, 255, 255);
    } else {
      doc.setFillColor(248, 250, 252);
    }
    doc.rect(14, y, W - 28, rowH, 'F');
    
    // Bottom border per row
    doc.setDrawColor(241, 245, 249);
    doc.line(14, y + rowH, W - 14, y + rowH);

    if (images[idx]) {
      doc.addImage(images[idx], 'JPEG', 16, y + 2, 16, 16);
    }
    
    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    const itemName = it.label || it.name;
    doc.text(doc.splitTextToSize(itemName, 72), 36, y + 7.5);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(it.category || 'Fireworks', 36, y + 14);
    
    doc.setTextColor(51, 65, 85);
    doc.setFontSize(9);
    doc.text(money(it.price), 130, y + 11.5, { align: 'right' });
    doc.text(String(it.qty), 150, y + 11.5, { align: 'center' });
    
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(money(it.price * it.qty), W - 18, y + 11.5, { align: 'right' });
    
    y += rowH;
  });

  if (y + 36 > 275) {
    doc.addPage();
    header();
    y = 48;
  }
  y += 6;
  
  // Total summary box with amber highlight
  doc.setFillColor(15, 23, 42);
  doc.roundedRect(W - 94, y, 80, 15, 2, 2, 'F');
  doc.setTextColor(245, 158, 11);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('TOTAL AMOUNT', W - 88, y + 9.5);
  doc.setFontSize(11);
  doc.text(money(total), W - 18, y + 9.5, { align: 'right' });

  y += 24;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text(
    doc.splitTextToSize(
      `* Note: ${CONFIG.safetyNote} Quotation generated online. Delivery and handling are subject to location confirmation.`,
      W - 28
    ),
    14,
    y
  );

  const fileName = `${orderNo}.pdf`;
  return { blob: doc.output('blob'), fileName, orderNo };
}
