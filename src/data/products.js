// ✏️ Edit this file to manage your catalog.
// Images/videos live in /public/assets. Leave `video: ''` if a product has no video.
// Each product can have several `sizes` (each with its own price). Use size: '' for single-price items.
export const CATEGORIES = ['All', 'Shells', 'Batteries & Cascades', 'Shots', 'Specials'];

const CATEGORY_BY_ID = {
  1: 'Shells', 2: 'Shells', 3: 'Shells', 4: 'Shells', 5: 'Shells', 6: 'Shells', 7: 'Shells', 8: 'Shells', 9: 'Shells', 18: 'Shells',
  10: 'Batteries & Cascades', 11: 'Batteries & Cascades', 12: 'Batteries & Cascades',
  16: 'Shots', 17: 'Shots',
  13: 'Specials', 14: 'Specials', 15: 'Specials',
};

const BADGE_BY_ID = { 1: 'Best Seller', 10: 'Popular', 14: 'Custom', 11: 'Wedding Pick', 6: 'Crowd Favourite' };

const items = [
  { id: 1, name: 'Red Color Shell', image: '/assets/RedShell.jpg', video: '/assets/RedShellVideo.mp4', description: 'A dazzling red aerial burst that lights up the night sky — perfect for grand finales and festive highlights.', sizes: [{ size: '3 inch', price: 1500 }, { size: '4 inch', price: 2400 }] },
  { id: 2, name: 'Yellow Color Shell', image: '/assets/YellowShell.jpg', video: '/assets/YellowShell.mp4', description: 'A bright yellow aerial shell that bursts into a stunning display — perfect for celebrations and festive occasions.', sizes: [{ size: '3 inch', price: 1500 }, { size: '4 inch', price: 2400 }] },
  { id: 3, name: 'Green Shell', image: '/assets/GreenShell.jpg', video: '/assets/GreenShell.mp4', description: 'Bright green bursts with a vibrant, lively effect.', sizes: [{ size: '3 inch', price: 1500 }, { size: '4 inch', price: 2400 }] },
  { id: 4, name: 'Gold Shell', image: '/assets/GoldShell.jpg', video: '/assets/GoldShell.mp4', description: 'Classic golden bloom with a smooth, quiet finish.', sizes: [{ size: '4 inch', price: 2400 }] },
  { id: 5, name: 'Purple Shell', image: '/assets/PurpleShell.jpg', video: '/assets/PurpleShell.mp4', description: 'Soft purple bursts with a graceful bloom effect.', sizes: [{ size: '4 inch', price: 2400 }] },
  { id: 6, name: 'Crackling Gold Shell', image: '/assets/CracklingShell.jpg', video: '/assets/CracklingShell.mp4', description: 'Ignites the sky with golden crackles and a shimmering rain effect — perfect for adding dramatic flair to any show.', sizes: [{ size: '4 inch', price: 2400 }] },
  { id: 7, name: 'White Shell', image: '/assets/WhiteShell.jpg', video: '/assets/WhiteShell.mp4', description: 'Elegant white bursts with a sparkling finish.', sizes: [{ size: '4 inch', price: 2400 }] },
  { id: 8, name: 'Blue Shell', image: '/assets/BlueShell.jpg', video: '/assets/BlueShell.mp4', description: 'Stunning blue bursts with a cool, calming effect.', sizes: [{ size: '4 inch', price: 2400 }] },
  { id: 9, name: 'Silver Shell', image: '/assets/SilverShell.jpg', video: '/assets/SilverShell.mp4', description: 'Elegant silver bursts with a sparkling finish.', sizes: [{ size: '3 inch', price: 1500 }] },
  { id: 18, name: 'Multi Color Shell', image: '/assets/MultiColorShell2.jpg', video: '', description: 'A vibrant mix of colors bursting in the sky, creating a spectacular visual feast.', sizes: [{ size: '4 inch', price: 2400 }] },
  { id: 10, name: 'Star Shell Battery', image: '/assets/MultiColorShell.jpg', video: '/assets/MultiColorShell.mp4', description: 'A vibrant mix of colors bursting in the sky, firing 3 shells at once for a grand display.', sizes: [{ size: '3 Shells', price: 5000 }] },
  { id: 11, name: 'Water Fall', image: '/assets/WaterFall.jpg', video: '/assets/WaterFall.mp4', description: 'A beautiful silver cascade combo ideal for weddings and special events.', sizes: [{ size: '12pcs', price: 2500 }] },
  { id: 12, name: 'Silver Rocket Battery', image: '/assets/SilverRocketBattery.jpg', video: '/assets/SilverRocketBattery.mp4', description: 'A stunning silver rocket battery that lights up the sky with cascading effects.', sizes: [{ size: '', price: 1800 }] },
  { id: 13, name: 'Coconut Tree', image: '/assets/CoconutTree.jpg', video: '/assets/CoconutTree.mp4', description: 'Coconut Magic Blossom — a beautiful coconut tree effect in a single brilliant color.', sizes: [{ size: '', price: 900 }] },
  { id: 14, name: 'Name & Logo', image: '/assets/NameLogo.jpg', video: '/assets/NameLogo.mp4', description: 'Custom fireworks display featuring your name or logo.', sizes: [{ size: '', price: 14000 }] },
  { id: 15, name: 'Sparkler', image: '/assets/Sparkler.jpg', video: '', description: 'A dazzling sparkler that lights up the night with its brilliant glow.', sizes: [{ size: '', price: 500 }] },
  { id: 16, name: 'Color Shots', image: '/assets/ColorShots.jpeg', video: '', description: 'A vibrant display of colors bursting in the sky.', sizes: [{ size: '', price: 2500 }] },
  { id: 17, name: 'Crackling Shots', image: '/assets/CracklingShots.jpeg', video: '', description: 'Exciting crackling effects that add a dynamic touch to any fireworks show.', sizes: [{ size: '', price: 2500 }] },
];

export const PRODUCTS = items.map((p) => ({
  ...p,
  id: String(p.id),
  category: CATEGORY_BY_ID[p.id] || 'Specials',
  badge: BADGE_BY_ID[p.id] || '',
}));

// Past shows (optional showcase section)
export const SHOWS = [
  { name: 'Mahinda College', image: '/assets/MahindaCollege.jpg', video: '/assets/MahindaCollegeVideo.mp4' },
  { name: 'Colombo Port City', image: '/assets/PortCity.jpg', video: '/assets/PortCityVideo.mp4' },
  { name: "St. Aloysius' College", image: '/assets/StAloysius.jpg', video: '/assets/StAloysiusVideo.mp4' },
];

export default items;
