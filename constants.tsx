import { Category, MenuItem } from './types';

export const COLORS = {
  primary: '#F57C00',
  secondary: '#262626',
  success: '#22c55e',
  danger: '#ef4444',
};

export const INITIAL_CATEGORIES: Category[] = [
  { id: 'cat1', name: 'Gavathi Lapeta', taxType: 'GST' },
  { id: 'cat2', name: 'Gavathi Agri Handi', taxType: 'GST' },
  { id: 'cat3', name: 'Oriental Main Course Veg', taxType: 'GST' },
  { id: 'cat4', name: 'Chinese Noodles', taxType: 'GST' },
  { id: 'cat5', name: 'Chinese Fried Rice', taxType: 'GST' },
  { id: 'cat6', name: 'Sindhi Veg Starters', taxType: 'GST' },
  { id: 'cat7', name: 'Rotis', taxType: 'GST' },
  { id: 'cat8', name: 'Seafood Tawa Fry', taxType: 'GST' },
  { id: 'cat9', name: 'Indian Veg Starters', taxType: 'GST' },
  { id: 'cat10', name: 'Indian Soups', taxType: 'GST' },
  { id: 'cat11', name: 'Oriental Soups', taxType: 'GST' },
  { id: 'cat12', name: 'Sindhi Non-Veg Starters', taxType: 'GST' },
  { id: 'cat13', name: 'Sindhi Veg Main Course', taxType: 'GST' },
  { id: 'cat14', name: 'Sindhi Non-Veg Main Course', taxType: 'GST' },
  { id: 'cat15', name: 'Oriental Non-Veg Starters', taxType: 'GST' },
  { id: 'cat16', name: 'Oriental Main Course Non-Veg', taxType: 'GST' },
  { id: 'cat17', name: 'Tandoori Non-Veg Main Course', taxType: 'GST' },
  { id: 'cat18', name: 'Veg Main Course', taxType: 'GST' },
  { id: 'cat19', name: 'Indian Rice', taxType: 'GST' },
  { id: 'cat20', name: 'Khichdi Tadka', taxType: 'GST' },
  { id: 'cat21', name: 'Pulav', taxType: 'GST' },
  { id: 'cat22', name: 'Biryani', taxType: 'GST' },
  { id: 'cat23', name: 'Matka Dum Biryani', taxType: 'GST' },
  { id: 'cat24', name: 'Oriental Veg Starters', taxType: 'GST' },
  { id: 'cat25', name: 'Tandoori Khazana Veg', taxType: 'GST' },
  { id: 'cat26', name: 'Tandoori Khazana Non-Veg', taxType: 'GST' },
  // Drink Categories
  { id: 'dcat1', name: 'Whisky - Indian Premium', type: 'DRINK' as const, taxType: 'VAT' },
  { id: 'dcat2', name: 'Whisky - Imported Scotch', type: 'DRINK' as const, taxType: 'VAT' },
  { id: 'dcat3', name: 'Vodka', type: 'DRINK' as const, taxType: 'VAT' },
  { id: 'dcat4', name: 'Rum', type: 'DRINK' as const, taxType: 'VAT' },
  { id: 'dcat5', name: 'Beer', type: 'DRINK' as const, taxType: 'VAT' },
  { id: 'dcat6', name: 'Mocktails', type: 'DRINK' as const, taxType: 'VAT' },
  { id: 'dcat7', name: 'Cocktails', type: 'DRINK' as const, taxType: 'VAT' },
  { id: 'dcat8', name: 'Zero Alcohol', type: 'DRINK' as const, taxType: 'VAT' },
];

export const INITIAL_MENU_ITEMS: MenuItem[] = [
  // Gavathi Lapeta (cat1)
  { id: 'gl1', name: 'Mutton Lapeta', price: 1250, categoryId: 'cat1', isVeg: false, vegType: 'NON_VEG', hasPortions: true, halfPrice: 650 },
  { id: 'gl2', name: 'Chicken Lapeta', price: 1000, categoryId: 'cat1', isVeg: false, vegType: 'NON_VEG', hasPortions: true, halfPrice: 550 },
  { id: 'gl3', name: 'Lavari Lapeta', price: 250, categoryId: 'cat1', isVeg: false, vegType: 'NON_VEG', quantityStr: 'Per Pcs' },

  // Gavathi Agri Handi (cat2)
  { id: 'gah1', name: 'Mutton Agri Handi', price: 1200, categoryId: 'cat2', isVeg: false, vegType: 'NON_VEG', hasPortions: true, halfPrice: 600 },
  { id: 'gah2', name: 'Chicken Agri Handi', price: 950, categoryId: 'cat2', isVeg: false, vegType: 'NON_VEG', hasPortions: true, halfPrice: 500 },
  { id: 'gah3', name: 'Lavari Agri Handi', price: 1050, categoryId: 'cat2', isVeg: false, vegType: 'NON_VEG', hasPortions: true, halfPrice: 550 },

  // Oriental Main Course Veg (cat3)
  { id: 'omv1', name: 'Exotic Vegetables In Black Pepper Sauce', price: 350, categoryId: 'cat3', isVeg: true, vegType: 'VEG' },
  { id: 'omv2', name: 'Exotic Vegetables In Chilli Basil Sauce', price: 350, categoryId: 'cat3', isVeg: true, vegType: 'VEG' },

  // Chinese Noodles (cat4)
  { id: 'cn1', name: 'Vegetable Noodles', price: 310, categoryId: 'cat4', isVeg: true, vegType: 'VEG' },
  { id: 'cn2', name: 'Chicken Noodles', price: 350, categoryId: 'cat4', isVeg: false, vegType: 'NON_VEG' },
  { id: 'cn3', name: 'Prawns Noodles', price: 430, categoryId: 'cat4', isVeg: false, vegType: 'SEAFOOD' },
  { id: 'cn4', name: 'Chicken Singapore Noodles', price: 360, categoryId: 'cat4', isVeg: false, vegType: 'NON_VEG' },
  { id: 'cn5', name: 'Chicken Hongkong Noodles', price: 360, categoryId: 'cat4', isVeg: false, vegType: 'NON_VEG' },
  { id: 'cn6', name: 'Chinese Choupsuey', price: 390, categoryId: 'cat4', isVeg: true, vegType: 'VEG' },
  { id: 'cn7', name: 'American Choupsuey', price: 390, categoryId: 'cat4', isVeg: true, vegType: 'VEG' },

  // Chinese Fried Rice (cat5)
  { id: 'cfr1', name: 'Vegetable Fried Rice', price: 375, categoryId: 'cat5', isVeg: true, vegType: 'VEG' },
  { id: 'cfr2', name: 'Chicken Fried Rice', price: 420, categoryId: 'cat5', isVeg: false, vegType: 'NON_VEG' },
  { id: 'cfr3', name: 'Prawns Fried Rice', price: 430, categoryId: 'cat5', isVeg: false, vegType: 'SEAFOOD' },
  { id: 'cfr4', name: 'Mixed Fried Rice', price: 530, categoryId: 'cat5', isVeg: false, vegType: 'NON_VEG' },
  { id: 'cfr5', name: 'Chicken Singapore Rice', price: 360, categoryId: 'cat5', isVeg: false, vegType: 'NON_VEG' },
  { id: 'cfr6', name: 'Chicken Hongkong Rice', price: 360, categoryId: 'cat5', isVeg: false, vegType: 'NON_VEG' },
  { id: 'cfr7', name: 'Chinese Chopsuey Rice', price: 390, categoryId: 'cat5', isVeg: true, vegType: 'VEG' },
  { id: 'cfr8', name: 'American Chopsuey Rice', price: 390, categoryId: 'cat5', isVeg: true, vegType: 'VEG' },

  // Sindhi Veg Starters (cat6)
  { id: 'svs1', name: 'Pakistani Garlic Lotus', price: 330, categoryId: 'cat6', isVeg: true, vegType: 'VEG' },
  { id: 'svs2', name: 'Veg Lollipop', price: 330, categoryId: 'cat6', isVeg: true, vegType: 'VEG' },
  { id: 'svs3', name: 'Arbi Garlic (Kacha Aloo)', price: 310, categoryId: 'cat6', isVeg: true, vegType: 'VEG' },
  { id: 'svs4', name: 'Lotus Lollipop', price: 385, categoryId: 'cat6', isVeg: true, vegType: 'VEG' },
  { id: 'svs5', name: 'Veg Keema Kabab', price: 310, categoryId: 'cat6', isVeg: true, vegType: 'VEG' },
  { id: 'svs6', name: 'Basket Chaat', price: 220, categoryId: 'cat6', isVeg: true, vegType: 'VEG', quantityStr: '2 Pcs' },
  { id: 'svs7', name: 'Indian Kacha Aloo', price: 310, categoryId: 'cat6', isVeg: true, vegType: 'VEG' },

  // Rotis (cat7)
  { id: 'rot1', name: 'Roti/Bhakri Plain', price: 30, categoryId: 'cat7', isVeg: true, vegType: 'VEG' },
  { id: 'rot2', name: 'Roti/Bhakri Butter', price: 35, categoryId: 'cat7', isVeg: true, vegType: 'VEG' },
  { id: 'rot3', name: 'Naan/Kulcha Plain', price: 60, categoryId: 'cat7', isVeg: true, vegType: 'VEG' },
  { id: 'rot4', name: 'Naan/Kulcha Butter', price: 70, categoryId: 'cat7', isVeg: true, vegType: 'VEG' },
  { id: 'rot5', name: 'Garlic Naan Plain', price: 75, categoryId: 'cat7', isVeg: true, vegType: 'VEG' },
  { id: 'rot6', name: 'Garlic Naan Butter', price: 85, categoryId: 'cat7', isVeg: true, vegType: 'VEG' },
  { id: 'rot7', name: 'Stuff Paratha (Veg/Paneer) Plain', price: 120, categoryId: 'cat7', isVeg: true, vegType: 'VEG' },
  { id: 'rot8', name: 'Stuff Paratha (Veg/Paneer) Butter', price: 140, categoryId: 'cat7', isVeg: true, vegType: 'VEG' },
  { id: 'rot9', name: 'Lachha Paratha Plain', price: 75, categoryId: 'cat7', isVeg: true, vegType: 'VEG' },
  { id: 'rot10', name: 'Lachha Paratha Butter', price: 85, categoryId: 'cat7', isVeg: true, vegType: 'VEG' },
  { id: 'rot11', name: 'Cheese Garlic Naan Plain', price: 110, categoryId: 'cat7', isVeg: true, vegType: 'VEG' },
  { id: 'rot12', name: 'Cheese Garlic Naan Butter', price: 120, categoryId: 'cat7', isVeg: true, vegType: 'VEG' },

  // Seafood Tawa Fry (cat8)
  { id: 'stf1', name: 'Pomfret Tawa Fry', price: 650, categoryId: 'cat8', isVeg: false, vegType: 'SEAFOOD' },
  { id: 'stf2', name: 'Baby KingAsh Tawa Fry', price: 600, categoryId: 'cat8', isVeg: false, vegType: 'SEAFOOD' },
  { id: 'stf3', name: 'Baby KingAsh Tandoor', price: 650, categoryId: 'cat8', isVeg: false, vegType: 'SEAFOOD' },
  { id: 'stf4', name: 'Surmai Tawa Fry', price: 550, categoryId: 'cat8', isVeg: false, vegType: 'SEAFOOD' },
  { id: 'stf5', name: 'Rawas Fry', price: 350, categoryId: 'cat8', isVeg: false, vegType: 'SEAFOOD' },
  { id: 'stf6', name: 'Babmli Rawa Tawa Fry', price: 280, categoryId: 'cat8', isVeg: false, vegType: 'SEAFOOD' },
  { id: 'stf7', name: 'Mandeli Tawa Fry', price: 250, categoryId: 'cat8', isVeg: false, vegType: 'SEAFOOD' },

  // Indian Veg Starters (cat9)
  { id: 'ivs1', name: 'Cheese Kurkure', price: 350, categoryId: 'cat9', isVeg: true, vegType: 'VEG' },
  { id: 'ivs2', name: 'Veg. Hara Bhara Kabab', price: 320, categoryId: 'cat9', isVeg: true, vegType: 'VEG' },
  { id: 'ivs3', name: 'Veg. Bukhara Kabab', price: 320, categoryId: 'cat9', isVeg: true, vegType: 'VEG' },
  { id: 'ivs4', name: 'Palak Cheese Tikki', price: 320, categoryId: 'cat9', isVeg: true, vegType: 'VEG' },
  { id: 'ivs5', name: 'Corn Tikki', price: 310, categoryId: 'cat9', isVeg: true, vegType: 'VEG' },
  { id: 'ivs6', name: 'Stuff Jacked Potato', price: 310, categoryId: 'cat9', isVeg: true, vegType: 'VEG' },
  { id: 'ivs7', name: 'Stuff Mushroom', price: 340, categoryId: 'cat9', isVeg: true, vegType: 'VEG' },
  { id: 'ivs8', name: 'Soya Bean Chilli', price: 310, categoryId: 'cat9', isVeg: true, vegType: 'VEG' },
  { id: 'ivs9', name: 'Veg Chilli', price: 310, categoryId: 'cat9', isVeg: true, vegType: 'VEG' },

  // Indian Soups (cat10)
  { id: 'is1', name: 'Tomato Soup', price: 180, categoryId: 'cat10', isVeg: true, vegType: 'VEG' },
  { id: 'is2', name: 'Murgh Yakhni Shorba', price: 210, categoryId: 'cat10', isVeg: false, vegType: 'NON_VEG' },
  { id: 'is3', name: 'Murgh Dhaniya Shoraba', price: 210, categoryId: 'cat10', isVeg: false, vegType: 'NON_VEG' },
  { id: 'is4', name: 'Paya Soup', price: 240, categoryId: 'cat10', isVeg: false, vegType: 'NON_VEG' },
  { id: 'is5', name: 'Lung Fung Soup', price: 210, categoryId: 'cat10', isVeg: false, vegType: 'NON_VEG' },

  // Oriental Soups (cat11)
  { id: 'os1', name: 'Manchow Soup', price: 0, categoryId: 'cat11', isVeg: true, vegType: 'BOTH', vegPrice: 188, nonVegPrice: 210, seafoodPrice: 230 },
  { id: 'os2', name: 'Tom Yum Soup', price: 0, categoryId: 'cat11', isVeg: true, vegType: 'BOTH', vegPrice: 188, nonVegPrice: 210, seafoodPrice: 230 },
  { id: 'os3', name: 'Burnt Garlic Soup', price: 0, categoryId: 'cat11', isVeg: true, vegType: 'BOTH', vegPrice: 188, nonVegPrice: 210, seafoodPrice: 230 },
  { id: 'os4', name: 'Hot N Sour', price: 0, categoryId: 'cat11', isVeg: true, vegType: 'BOTH', vegPrice: 199, nonVegPrice: 215, seafoodPrice: 230 },
  { id: 'os5', name: 'Sweet Corn Soup', price: 0, categoryId: 'cat11', isVeg: true, vegType: 'BOTH', vegPrice: 188, nonVegPrice: 210, seafoodPrice: 230 },
  { id: 'os6', name: 'Lemon Coriander Soup', price: 0, categoryId: 'cat11', isVeg: true, vegType: 'BOTH', vegPrice: 188, nonVegPrice: 210, seafoodPrice: 230 },

  // Sindhi Non-Veg Starters (cat12)
  { id: 'snvs1', name: 'Sindhi Fish Fry', price: 550, categoryId: 'cat12', isVeg: false, vegType: 'SEAFOOD' },
  { id: 'snvs2', name: 'Egg Chaat', price: 190, categoryId: 'cat12', isVeg: false, vegType: 'NON_VEG' },
  { id: 'snvs3', name: 'Fish Kofta Fry', price: 550, categoryId: 'cat12', isVeg: false, vegType: 'SEAFOOD' },
  { id: 'snvs4', name: 'Hyderabadi Prawns Fry', price: 440, categoryId: 'cat12', isVeg: false, vegType: 'SEAFOOD' },

  // Sindhi Veg Main Course (cat13)
  { id: 'svmc1', name: 'Pudina Lotus, Kamalkakdi', price: 420, categoryId: 'cat13', isVeg: true, vegType: 'VEG' },
  { id: 'svmc2', name: 'Paneer Veg Keema', price: 440, categoryId: 'cat13', isVeg: true, vegType: 'VEG' },
  { id: 'svmc3', name: 'Besen Tikki', price: 385, categoryId: 'cat13', isVeg: true, vegType: 'VEG' },
  { id: 'svmc4', name: 'Hariyali Paneer', price: 440, categoryId: 'cat13', isVeg: true, vegType: 'VEG' },
  { id: 'svmc5', name: 'Palak Methi Kofta', price: 495, categoryId: 'cat13', isVeg: true, vegType: 'VEG' },
  { id: 'svmc6', name: 'Sindhi Curry', price: 330, categoryId: 'cat13', isVeg: true, vegType: 'VEG' },
  { id: 'svmc7', name: 'Sindhi Lotus Curry', price: 330, categoryId: 'cat13', isVeg: true, vegType: 'VEG' },
  { id: 'svmc8', name: 'Sindhi Pulao', price: 310, categoryId: 'cat13', isVeg: true, vegType: 'VEG' },

  // Sindhi Non-Veg Main Course (cat14)
  { id: 'snvmc1', name: 'Hariyali Chicken', price: 440, categoryId: 'cat14', isVeg: false, vegType: 'NON_VEG' },
  { id: 'snvmc2', name: 'Sindhi Fish Sehal', price: 495, categoryId: 'cat14', isVeg: false, vegType: 'SEAFOOD' },
  { id: 'snvmc3', name: 'Sindhi Keema Kaleji', price: 495, categoryId: 'cat14', isVeg: false, vegType: 'NON_VEG' },
  { id: 'snvmc4', name: 'Egg Sehal', price: 330, categoryId: 'cat14', isVeg: false, vegType: 'NON_VEG' },

  // Oriental Non-Veg Starters (cat15)
  { id: 'onvs1', name: 'Stir Fried Chicken With Fresh Basil', price: 375, categoryId: 'cat15', isVeg: false, vegType: 'NON_VEG' },
  { id: 'onvs2', name: 'Crispy Chicken', price: 360, categoryId: 'cat15', isVeg: false, vegType: 'NON_VEG' },
  { id: 'onvs3', name: 'Noon To Moon Chilli Chicken', price: 360, categoryId: 'cat15', isVeg: false, vegType: 'NON_VEG' },
  { id: 'onvs4', name: 'Chicken Lollipop', price: 360, categoryId: 'cat15', isVeg: false, vegType: 'NON_VEG' },
  { id: 'onvs5', name: 'Chicken Black Pepper Dry', price: 420, categoryId: 'cat15', isVeg: false, vegType: 'NON_VEG' },
  { id: 'onvs6', name: 'Butter Garlic Prawns', price: 420, categoryId: 'cat15', isVeg: false, vegType: 'SEAFOOD' },
  { id: 'onvs7', name: 'Drums Of Heaven', price: 430, categoryId: 'cat15', isVeg: false, vegType: 'NON_VEG' },
  { id: 'onvs8', name: 'Chicken 65', price: 375, categoryId: 'cat15', isVeg: false, vegType: 'NON_VEG' },
  { id: 'onvs9', name: 'Chicken Spring Roll', price: 385, categoryId: 'cat15', isVeg: false, vegType: 'NON_VEG' },
  { id: 'onvs10', name: 'Pomfret Tawa Fry (APS)', price: 0, categoryId: 'cat15', isVeg: false, vegType: 'SEAFOOD', quantityStr: 'APS' },
  { id: 'onvs11', name: 'Pomfret Tandoori (APS)', price: 0, categoryId: 'cat15', isVeg: false, vegType: 'SEAFOOD', quantityStr: 'APS' },
  { id: 'onvs12', name: 'Prawns Tawa (APS)', price: 0, categoryId: 'cat15', isVeg: false, vegType: 'SEAFOOD', quantityStr: 'APS' },
  { id: 'onvs13', name: 'Grilled Fish (APS)', price: 0, categoryId: 'cat15', isVeg: false, vegType: 'SEAFOOD', quantityStr: 'APS' },

  // Oriental Main Course Non-Veg (cat16)
  { id: 'omcnv1', name: 'Braised Chicken In Smoked Chilli Sauce', price: 450, categoryId: 'cat16', isVeg: false, vegType: 'NON_VEG' },
  { id: 'omcnv2', name: 'Ginger Chilli Chicken', price: 450, categoryId: 'omcnv2', isVeg: false, vegType: 'NON_VEG' },
  { id: 'omcnv3', name: 'Golden Fried Prawns', price: 0, categoryId: 'cat16', isVeg: false, vegType: 'SEAFOOD', quantityStr: 'APS' },
  { id: 'omcnv4', name: 'Pomfret In Choice Of Sauce', price: 0, categoryId: 'cat16', isVeg: false, vegType: 'SEAFOOD', quantityStr: 'APS' },
  { id: 'omcnv5', name: 'Mutton Masala', price: 495, categoryId: 'cat16', isVeg: false, vegType: 'NON_VEG' },
  { id: 'omcnv6', name: 'Mutton Curry', price: 495, categoryId: 'cat16', isVeg: false, vegType: 'NON_VEG' },
  { id: 'omcnv7', name: 'Chicken Masala', price: 320, categoryId: 'cat16', isVeg: false, vegType: 'NON_VEG' },
  { id: 'omcnv8', name: 'Chicken Tikka Masala', price: 350, categoryId: 'cat16', isVeg: false, vegType: 'NON_VEG' },
  { id: 'omcnv9', name: 'Chicken Hyderabadi Masala', price: 350, categoryId: 'cat16', isVeg: false, vegType: 'NON_VEG' },
  { id: 'omcnv10', name: 'Chicken Kadhai', price: 350, categoryId: 'cat16', isVeg: false, vegType: 'NON_VEG' },
  { id: 'omcnv11', name: 'Chicken Keema', price: 310, categoryId: 'cat16', isVeg: false, vegType: 'NON_VEG' },
  { id: 'omcnv12', name: 'Chicken Koliwada Masala', price: 350, categoryId: 'cat16', isVeg: false, vegType: 'NON_VEG' },
  { id: 'omcnv13', name: 'Chicken Navabi Masala', price: 350, categoryId: 'cat16', isVeg: false, vegType: 'NON_VEG' },
  { id: 'omcnv14', name: 'Egg Masala', price: 210, categoryId: 'cat16', isVeg: false, vegType: 'NON_VEG' },
  { id: 'omcnv15', name: 'Chicken Tawa', price: 340, categoryId: 'cat16', isVeg: false, vegType: 'NON_VEG' },
  { id: 'omcnv16', name: 'Mutton Handi', price: 1320, categoryId: 'cat16', isVeg: false, vegType: 'NON_VEG', hasPortions: true, halfPrice: 660 },
  { id: 'omcnv17', name: 'Butter Chicken', price: 880, categoryId: 'cat16', isVeg: false, vegType: 'NON_VEG', hasPortions: true, halfPrice: 440 },
  { id: 'omcnv18', name: 'Chicken Handi', price: 990, categoryId: 'cat16', isVeg: false, vegType: 'NON_VEG', hasPortions: true, halfPrice: 550 },
  { id: 'omcnv19', name: 'Chicken Handi Desi', price: 1210, categoryId: 'cat16', isVeg: false, vegType: 'NON_VEG', hasPortions: true, halfPrice: 605 },
  { id: 'omcnv20', name: 'Murgh Musallam', price: 990, categoryId: 'cat16', isVeg: false, vegType: 'NON_VEG', hasPortions: true, halfPrice: 495 },

  // Tandoori Non-Veg Main Course (cat17)
  { id: 'tnvmc1', name: 'Murgh Zafrani Tikka', price: 395, categoryId: 'cat17', isVeg: false, vegType: 'NON_VEG' },
  { id: 'tnvmc2', name: 'Seekh Kabab Chicken', price: 410, categoryId: 'cat17', isVeg: false, vegType: 'NON_VEG' },
  { id: 'tnvmc3', name: 'Seekh Kabab Mutton', price: 450, categoryId: 'cat17', isVeg: false, vegType: 'NON_VEG' },
  { id: 'tnvmc4', name: 'Mutton Kesari Seekh Kabab', price: 475, categoryId: 'cat17', isVeg: false, vegType: 'NON_VEG' },
  { id: 'tnvmc5', name: 'Stuffed Pomfret (APS)', price: 0, categoryId: 'cat17', isVeg: false, vegType: 'SEAFOOD', quantityStr: 'APS' },
  { id: 'tnvmc6', name: 'Tandoori Khazana Platter', price: 880, categoryId: 'cat17', isVeg: false, vegType: 'NON_VEG', quantityStr: 'Range ₹880 - ₹1200' },

  // Veg Main Course (cat18)
  { id: 'vmc1', name: 'Subz Falguni', price: 320, categoryId: 'cat18', isVeg: true, vegType: 'VEG' },
  { id: 'vmc2', name: 'Subz Miloni', price: 320, categoryId: 'cat18', isVeg: true, vegType: 'VEG' },
  { id: 'vmc3', name: 'Subz Doaba', price: 340, categoryId: 'cat18', isVeg: true, vegType: 'VEG' },
  { id: 'vmc4', name: 'Subz Bhuna Masala', price: 320, categoryId: 'cat18', isVeg: true, vegType: 'VEG' },
  { id: 'vmc5', name: 'Subz Phaldari Kofta', price: 340, categoryId: 'cat18', isVeg: true, vegType: 'VEG' },
  { id: 'vmc6', name: 'Lasooni Kofta', price: 330, categoryId: 'cat18', isVeg: true, vegType: 'VEG' },
  { id: 'vmc7', name: 'Subz Kolphapuri', price: 310, categoryId: 'cat18', isVeg: true, vegType: 'VEG' },
  { id: 'vmc8', name: 'Paneer Tikka Masala', price: 340, categoryId: 'cat18', isVeg: true, vegType: 'VEG' },
  { id: 'vmc9', name: 'Paneer Kadhai', price: 330, categoryId: 'cat18', isVeg: true, vegType: 'VEG' },
  { id: 'vmc10', name: 'Veg Kadhai', price: 310, categoryId: 'cat18', isVeg: true, vegType: 'VEG' },
  { id: 'vmc11', name: 'Paneer Pasanda', price: 350, categoryId: 'cat18', isVeg: true, vegType: 'VEG' },
  { id: 'vmc12', name: 'Paneer Garlic Masala', price: 330, categoryId: 'cat18', isVeg: true, vegType: 'VEG' },
  { id: 'vmc13', name: 'Noon To Moon Special Subz', price: 385, categoryId: 'cat18', isVeg: true, vegType: 'VEG' },
  { id: 'vmc14', name: 'Subz Tawa Masala', price: 340, categoryId: 'cat18', isVeg: true, vegType: 'VEG' },
  { id: 'vmc15', name: 'Dm Ka Khumb', price: 330, categoryId: 'cat18', isVeg: true, vegType: 'VEG' },
  { id: 'vmc16', name: 'Subz Maratha', price: 320, categoryId: 'cat18', isVeg: true, vegType: 'VEG' },
  { id: 'vmc17', name: 'Paneer Lahori', price: 350, categoryId: 'cat18', isVeg: true, vegType: 'VEG' },
  { id: 'vmc18', name: 'Paneer Reshmi Masala', price: 340, categoryId: 'cat18', isVeg: true, vegType: 'VEG' },
  { id: 'vmc19', name: 'Paneer Makhanwala', price: 340, categoryId: 'cat18', isVeg: true, vegType: 'VEG' },
  { id: 'vmc20', name: 'Palak Paneer', price: 310, categoryId: 'cat18', isVeg: true, vegType: 'VEG' },
  { id: 'vmc21', name: 'Veg Keema Masala', price: 285, categoryId: 'cat18', isVeg: true, vegType: 'VEG' },
  { id: 'vmc22', name: 'Jeera Aloo', price: 285, categoryId: 'cat18', isVeg: true, vegType: 'VEG' },
  { id: 'vmc23', name: 'Paneer Mutter Masala', price: 310, categoryId: 'cat18', isVeg: true, vegType: 'VEG' },
  { id: 'vmc24', name: 'Paneer Butter Masala', price: 320, categoryId: 'cat18', isVeg: true, vegType: 'VEG' },

  // Indian Rice (cat19)
  { id: 'ir1', name: 'Steam Rice', price: 175, categoryId: 'cat19', isVeg: true, vegType: 'VEG' },
  { id: 'ir2', name: 'Jira Rice', price: 210, categoryId: 'cat19', isVeg: true, vegType: 'VEG' },

  // Khichdi Tadka (cat20)
  { id: 'kt1', name: 'Dal Khichdi', price: 265, categoryId: 'cat20', isVeg: true, vegType: 'VEG' },
  { id: 'kt2', name: 'Palak Khichdi', price: 230, categoryId: 'cat20', isVeg: true, vegType: 'VEG' },

  // Pulav (cat21)
  { id: 'pul1', name: 'Vegetable Pulav', price: 299, categoryId: 'cat21', isVeg: true, vegType: 'VEG' },
  { id: 'pul2', name: 'Green Peace Pulav', price: 285, categoryId: 'cat21', isVeg: true, vegType: 'VEG' },
  { id: 'pul3', name: 'Kashmiri Pulav', price: 320, categoryId: 'cat21', isVeg: true, vegType: 'VEG' },

  // Biryani (cat22)
  { id: 'bir1', name: 'Vegetable Biryani', price: 310, categoryId: 'cat22', isVeg: true, vegType: 'VEG' },
  { id: 'bir2', name: 'Chicken Biryani', price: 350, categoryId: 'cat22', isVeg: false, vegType: 'NON_VEG' },
  { id: 'bir3', name: 'Prawns Biryani', price: 430, categoryId: 'cat22', isVeg: false, vegType: 'SEAFOOD' },
  { id: 'bir4', name: 'Mutton Biryani', price: 430, categoryId: 'cat22', isVeg: false, vegType: 'NON_VEG' },

  // Matka Dum Biryani (cat23)
  { id: 'mdb1', name: 'Vegetable Matka Dum Biryani', price: 320, categoryId: 'cat23', isVeg: true, vegType: 'VEG' },
  { id: 'mdb2', name: 'Chicken Matka Dum Biryani', price: 375, categoryId: 'cat23', isVeg: false, vegType: 'NON_VEG' },
  { id: 'mdb3', name: 'Mutton Matka Dum Biryani', price: 440, categoryId: 'cat23', isVeg: false, vegType: 'NON_VEG' },

  // Oriental Veg Starters (cat24)
  { id: 'ovs1', name: 'Crispy Vegetable', price: 320, categoryId: 'cat24', isVeg: true, vegType: 'VEG' },
  { id: 'ovs2', name: 'Veg Salt N Pepper', price: 320, categoryId: 'cat24', isVeg: true, vegType: 'VEG' },
  { id: 'ovs3', name: 'Noon To Moon Chilli Cottage Cheese', price: 310, categoryId: 'cat24', isVeg: true, vegType: 'VEG' },
  { id: 'ovs4', name: 'Crispy Corn Chilli Pepper', price: 310, categoryId: 'cat24', isVeg: true, vegType: 'VEG' },
  { id: 'ovs5', name: 'Mushroom Ginger Chill', price: 330, categoryId: 'cat24', isVeg: true, vegType: 'VEG' },
  { id: 'ovs6', name: 'Veg. Manchurian Dry', price: 320, categoryId: 'cat24', isVeg: true, vegType: 'VEG' },
  { id: 'ovs7', name: 'Veg. Spring Roll', price: 310, categoryId: 'cat24', isVeg: true, vegType: 'VEG' },
  { id: 'ovs8', name: 'Veg. Schezwan Finger', price: 320, categoryId: 'cat24', isVeg: true, vegType: 'VEG' },
  { id: 'ovs9', name: 'Veg. 65', price: 310, categoryId: 'cat24', isVeg: true, vegType: 'VEG' },
  { id: 'ovs10', name: 'Paneer In Choice Of Sauce', price: 350, categoryId: 'cat24', isVeg: true, vegType: 'VEG' },
  { id: 'ovs11', name: 'Paneer Chilly Dry', price: 340, categoryId: 'cat24', isVeg: true, vegType: 'VEG' },
  { id: 'ovs12', name: 'Paneer Satay', price: 340, categoryId: 'cat24', isVeg: true, vegType: 'VEG' },
  { id: 'ovs13', name: 'Paneer Manchurian', price: 340, categoryId: 'cat24', isVeg: true, vegType: 'VEG' },
  { id: 'ovs14', name: 'Paneer Chillimilli', price: 350, categoryId: 'cat24', isVeg: true, vegType: 'VEG' },

  // Tandoori Khazana Veg (cat25)
  { id: 'tkv1', name: 'Bharwan Paneer Tikka', price: 350, categoryId: 'cat25', isVeg: true, vegType: 'VEG' },
  { id: 'tkv2', name: 'Paneer Multani', price: 350, categoryId: 'cat25', isVeg: true, vegType: 'VEG' },
  { id: 'tkv3', name: 'Paneer Malai Seekh Kabab', price: 350, categoryId: 'cat25', isVeg: true, vegType: 'VEG' },
  { id: 'tkv4', name: 'Dingri Tandoori', price: 320, categoryId: 'cat25', isVeg: true, vegType: 'VEG' },
  { id: 'tkv5', name: 'Paneer Tikka', price: 375, categoryId: 'cat25', isVeg: true, vegType: 'VEG' },
  { id: 'tkv6', name: 'Veg Jugalbandi Kabab', price: 310, categoryId: 'cat25', isVeg: true, vegType: 'VEG' },

  // Tandoori Khajana Non-Veg (cat26)
  { id: 'tknv1', name: 'Hyderabadi Tandoori', price: 550, categoryId: 'cat26', isVeg: false, vegType: 'NON_VEG', hasPortions: true, halfPrice: 310 },
  { id: 'tknv2', name: 'Murgh Tandoori', price: 560, categoryId: 'cat26', isVeg: false, vegType: 'NON_VEG', hasPortions: true, halfPrice: 325 },
  { id: 'tknv3', name: 'Ghee Roast Tandoori', price: 580, categoryId: 'cat26', isVeg: false, vegType: 'NON_VEG', hasPortions: true, halfPrice: 340 },
  { id: 'tknv4', name: 'Murgh Handi Lazeez', price: 375, categoryId: 'cat26', isVeg: false, vegType: 'NON_VEG' },
  { id: 'tknv5', name: 'Murgh Dilkhush Kabab', price: 430, categoryId: 'cat26', isVeg: false, vegType: 'NON_VEG' },
  { id: 'tknv6', name: 'Chicken Kali Miri Kabab', price: 395, categoryId: 'cat26', isVeg: false, vegType: 'NON_VEG' },
  { id: 'tknv7', name: 'Chicken Banjara Kabab', price: 395, categoryId: 'cat26', isVeg: false, vegType: 'NON_VEG' },
  { id: 'tknv8', name: 'Chicken Reshmi Kabab', price: 420, categoryId: 'cat26', isVeg: false, vegType: 'NON_VEG' },
  { id: 'tknv9', name: 'Chicken Achari Kabab', price: 395, categoryId: 'cat26', isVeg: false, vegType: 'NON_VEG' },
  { id: 'tknv10', name: 'Chicken Malai Kabab', price: 420, categoryId: 'cat26', isVeg: false, vegType: 'NON_VEG' },
  { id: 'tknv11', name: 'Chicken Chilli Kabab', price: 420, categoryId: 'cat26', isVeg: false, vegType: 'NON_VEG' },
  { id: 'tknv12', name: 'Chicken Angara Kabab', price: 420, categoryId: 'cat26', isVeg: false, vegType: 'NON_VEG' },
  { id: 'tknv13', name: 'Garlic Chicken', price: 350, categoryId: 'cat26', isVeg: false, vegType: 'NON_VEG' },
  { id: 'tknv14', name: 'Chicken Manchuriyan', price: 350, categoryId: 'cat26', isVeg: false, vegType: 'NON_VEG' },
  { id: 'tknv15', name: 'Chicken Koliwada', price: 330, categoryId: 'cat26', isVeg: false, vegType: 'NON_VEG' },
  { id: 'tknv16', name: 'Cornflour Curd', price: 470, categoryId: 'cat26', isVeg: false, vegType: 'NON_VEG' },
  { id: 'tknv17', name: 'Mutton Seekh Kabab', price: 470, categoryId: 'cat26', isVeg: false, vegType: 'NON_VEG' },
  { id: 'tknv18', name: 'Liver Petha Oil Fry', price: 220, categoryId: 'cat26', isVeg: false, vegType: 'NON_VEG' },
  { id: 'tknv19', name: 'Liver Petha Lapeta', price: 265, categoryId: 'cat26', isVeg: false, vegType: 'NON_VEG' },
  { id: 'tknv20', name: 'Chicken Tangdi Kabab', price: 420, categoryId: 'cat26', isVeg: false, vegType: 'NON_VEG' },

  // ========== DRINKS ==========

  // Whisky - Indian Premium (dcat1)
  { id: 'wip1', name: 'DSP Black', price: 290, categoryId: 'dcat1', isVeg: true, vegType: 'VEG', mlPrices: { '750ml': 1160, '180ml': 290, '90ml': 150, '60ml': 100, '30ml': 50 } },
  { id: 'wip2', name: 'Imperial Blue', price: 310, categoryId: 'dcat1', isVeg: true, vegType: 'VEG', mlPrices: { '750ml': 1240, '180ml': 310, '90ml': 155, '60ml': 105, '30ml': 55 } },
  { id: 'wip3', name: 'MCD No.1', price: 310, categoryId: 'dcat1', isVeg: true, vegType: 'VEG', mlPrices: { '750ml': 1240, '180ml': 310, '90ml': 155, '60ml': 105, '30ml': 55 } },
  { id: 'wip4', name: 'Sterling Reserves B7', price: 280, categoryId: 'dcat1', isVeg: true, vegType: 'VEG', mlPrices: { '750ml': 1100, '180ml': 280, '90ml': 140, '60ml': 95, '30ml': 50 } },
  { id: 'wip5', name: 'Royal Challenges', price: 380, categoryId: 'dcat1', isVeg: true, vegType: 'VEG', mlPrices: { '750ml': 1500, '180ml': 380, '90ml': 180, '60ml': 120, '30ml': 60 } },
  { id: 'wip6', name: 'Royal Stag', price: 360, categoryId: 'dcat1', isVeg: true, vegType: 'VEG', mlPrices: { '750ml': 1500, '180ml': 360, '90ml': 175, '60ml': 120, '30ml': 60 } },
  { id: 'wip7', name: 'Oaksmith International', price: 460, categoryId: 'dcat1', isVeg: true, vegType: 'VEG', mlPrices: { '750ml': 1920, '180ml': 460, '90ml': 230, '60ml': 155, '30ml': 80 } },
  { id: 'wip8', name: 'Royal Stag Barrel', price: 440, categoryId: 'dcat1', isVeg: true, vegType: 'VEG', mlPrices: { '750ml': 1760, '180ml': 440, '90ml': 220, '60ml': 145, '30ml': 70 } },
  { id: 'wip9', name: 'Signature', price: 530, categoryId: 'dcat1', isVeg: true, vegType: 'VEG', mlPrices: { '750ml': 2050, '180ml': 530, '90ml': 265, '60ml': 175, '30ml': 90 } },
  { id: 'wip10', name: 'Signature Reserve', price: 540, categoryId: 'dcat1', isVeg: true, vegType: 'VEG', mlPrices: { '750ml': 2120, '180ml': 540, '90ml': 270, '60ml': 190, '30ml': 100 } },
  { id: 'wip11', name: 'Blenders Pride', price: 530, categoryId: 'dcat1', isVeg: true, vegType: 'VEG', mlPrices: { '750ml': 2050, '180ml': 530, '90ml': 265, '60ml': 175, '30ml': 90 } },
  { id: 'wip12', name: 'Oaksmith Gold', price: 560, categoryId: 'dcat1', isVeg: true, vegType: 'VEG', mlPrices: { '750ml': 2240, '180ml': 560, '90ml': 280, '60ml': 190, '30ml': 95 } },
  { id: 'wip13', name: 'Antiquity Blue', price: 560, categoryId: 'dcat1', isVeg: true, vegType: 'VEG', mlPrices: { '750ml': 2240, '180ml': 560, '90ml': 280, '60ml': 190, '30ml': 95 } },
  { id: 'wip14', name: 'Blenders Pride Reserve', price: 620, categoryId: 'dcat1', isVeg: true, vegType: 'VEG', mlPrices: { '750ml': 2480, '180ml': 620, '90ml': 310, '60ml': 210, '30ml': 105 } },

  // Whisky - Imported Scotch (dcat2)
  { id: 'wis1', name: 'Johnny Walker Red Label', price: 875, categoryId: 'dcat2', isVeg: true, vegType: 'VEG', mlPrices: { '750ml': 3500, '180ml': 875 } },
  { id: 'wis2', name: 'Ballentine', price: 900, categoryId: 'dcat2', isVeg: true, vegType: 'VEG', mlPrices: { '750ml': 3600, '180ml': 900 } },
  { id: 'wis3', name: 'Black & White', price: 1000, categoryId: 'dcat2', isVeg: true, vegType: 'VEG', mlPrices: { '750ml': 4000, '180ml': 1000 } },
  { id: 'wis4', name: '100 Pipers', price: 930, categoryId: 'dcat2', isVeg: true, vegType: 'VEG', mlPrices: { '750ml': 3700, '180ml': 930 } },
  { id: 'wis5', name: 'VAT 69', price: 930, categoryId: 'dcat2', isVeg: true, vegType: 'VEG', mlPrices: { '750ml': 3700, '180ml': 930 } },
  { id: 'wis6', name: 'Teachers', price: 1110, categoryId: 'dcat2', isVeg: true, vegType: 'VEG', mlPrices: { '750ml': 4400, '180ml': 1110 } },
  { id: 'wis7', name: 'Black Gold Dog', price: 1110, categoryId: 'dcat2', isVeg: true, vegType: 'VEG', mlPrices: { '750ml': 4400, '180ml': 1110 } },
  { id: 'wis8', name: 'Black Dog', price: 1000, categoryId: 'dcat2', isVeg: true, vegType: 'VEG', mlPrices: { '750ml': 4000, '180ml': 1000 } },
  { id: 'wis9', name: 'Johnny Walker Black Label', price: 1500, categoryId: 'dcat2', isVeg: true, vegType: 'VEG', mlPrices: { '750ml': 6000, '180ml': 1500 } },
  { id: 'wis10', name: 'Chivas Regal', price: 1480, categoryId: 'dcat2', isVeg: true, vegType: 'VEG', mlPrices: { '750ml': 5900, '180ml': 1480 } },

  // Vodka (dcat3)
  { id: 'vod1', name: 'Romanov', price: 310, categoryId: 'dcat3', isVeg: true, vegType: 'VEG', mlPrices: { '750ml': 1240, '180ml': 310, '90ml': 155, '60ml': 105, '30ml': 55 } },
  { id: 'vod2', name: 'Romanov Apple', price: 310, categoryId: 'dcat3', isVeg: true, vegType: 'VEG', mlPrices: { '750ml': 1240, '180ml': 310, '90ml': 155, '60ml': 105, '30ml': 55 } },
  { id: 'vod3', name: 'Magic Movement', price: 380, categoryId: 'dcat3', isVeg: true, vegType: 'VEG', mlPrices: { '750ml': 1500, '180ml': 380, '90ml': 190, '60ml': 130, '30ml': 65 } },
  { id: 'vod4', name: 'Magic Movement Apple', price: 380, categoryId: 'dcat3', isVeg: true, vegType: 'VEG', mlPrices: { '750ml': 1500, '180ml': 380, '90ml': 190, '60ml': 130, '30ml': 65 } },
  { id: 'vod5', name: 'Smirnoff', price: 620, categoryId: 'dcat3', isVeg: true, vegType: 'VEG', mlPrices: { '750ml': 2480, '180ml': 620, '90ml': 310, '60ml': 205, '30ml': 105 } },
  { id: 'vod6', name: 'Smirnoff Apple', price: 640, categoryId: 'dcat3', isVeg: true, vegType: 'VEG', mlPrices: { '750ml': 2500, '180ml': 640, '90ml': 320, '60ml': 210, '30ml': 110 } },

  // Rum (dcat4)
  { id: 'rum1', name: 'Old Monk', price: 300, categoryId: 'dcat4', isVeg: true, vegType: 'VEG', mlPrices: { '750ml': 1200, '180ml': 300, '90ml': 150, '60ml': 100, '30ml': 55 } },
  { id: 'rum2', name: 'Bacardi White', price: 550, categoryId: 'dcat4', isVeg: true, vegType: 'VEG', mlPrices: { '750ml': 2200, '180ml': 550, '90ml': 275, '60ml': 185, '30ml': 95 } },
  { id: 'rum3', name: 'Bacardi Lemon', price: 610, categoryId: 'dcat4', isVeg: true, vegType: 'VEG', mlPrices: { '750ml': 2450, '180ml': 610, '90ml': 305, '60ml': 205, '30ml': 105 } },
  { id: 'rum4', name: 'Sula Red Wine', price: 375, categoryId: 'dcat4', isVeg: true, vegType: 'VEG', mlPrices: { 'Full Bottle': 1450, '180ml': 375 } },
  { id: 'rum5', name: 'Sula White Wine', price: 300, categoryId: 'dcat4', isVeg: true, vegType: 'VEG', mlPrices: { 'Full Bottle': 1100, '180ml': 300 } },

  // Beer (dcat5)
  { id: 'beer1', name: 'King Fisher Strong', price: 289, categoryId: 'dcat5', isVeg: true, vegType: 'VEG' },
  { id: 'beer2', name: 'King Fisher Mild', price: 299, categoryId: 'dcat5', isVeg: true, vegType: 'VEG' },
  { id: 'beer3', name: 'KF Strong Tin 500ml', price: 239, categoryId: 'dcat5', isVeg: true, vegType: 'VEG' },
  { id: 'beer4', name: 'KF Mild Tin 500ml', price: 239, categoryId: 'dcat5', isVeg: true, vegType: 'VEG' },
  { id: 'beer5', name: 'King Fisher Ultra', price: 319, categoryId: 'dcat5', isVeg: true, vegType: 'VEG' },
  { id: 'beer6', name: 'Budweiser Magnum Strong', price: 349, categoryId: 'dcat5', isVeg: true, vegType: 'VEG' },
  { id: 'beer7', name: 'Budweiser Mild', price: 319, categoryId: 'dcat5', isVeg: true, vegType: 'VEG' },
  { id: 'beer8', name: 'Carlsberg Strong', price: 349, categoryId: 'dcat5', isVeg: true, vegType: 'VEG' },
  { id: 'beer9', name: 'Carlsberg Mild', price: 319, categoryId: 'dcat5', isVeg: true, vegType: 'VEG' },
  { id: 'beer10', name: 'Tuborg Strong', price: 289, categoryId: 'dcat5', isVeg: true, vegType: 'VEG' },
  { id: 'beer11', name: 'Tuborg Mild', price: 299, categoryId: 'dcat5', isVeg: true, vegType: 'VEG' },
  { id: 'beer12', name: 'Tuborg Strong Tin 330ml', price: 229, categoryId: 'dcat5', isVeg: true, vegType: 'VEG' },
  { id: 'beer13', name: 'Heineken Silver', price: 349, categoryId: 'dcat5', isVeg: true, vegType: 'VEG' },
  { id: 'beer14', name: 'Budweiser Tin', price: 259, categoryId: 'dcat5', isVeg: true, vegType: 'VEG' },
  { id: 'beer15', name: 'Budweiser Magnum Tin', price: 269, categoryId: 'dcat5', isVeg: true, vegType: 'VEG' },
  { id: 'beer16', name: 'Bira Boom', price: 289, categoryId: 'dcat5', isVeg: true, vegType: 'VEG' },
  { id: 'beer17', name: 'Bira White', price: 329, categoryId: 'dcat5', isVeg: true, vegType: 'VEG' },
  { id: 'beer18', name: 'Bacardi Breezer', price: 210, categoryId: 'dcat5', isVeg: true, vegType: 'VEG' },

  // Mocktails (dcat6)
  { id: 'mock1', name: 'Virgin Colada', price: 270, categoryId: 'dcat6', isVeg: true, vegType: 'VEG' },
  { id: 'mock2', name: 'Fruit Punch', price: 270, categoryId: 'dcat6', isVeg: true, vegType: 'VEG' },
  { id: 'mock3', name: 'May Queen', price: 270, categoryId: 'dcat6', isVeg: true, vegType: 'VEG' },
  { id: 'mock4', name: 'Virgin Mojito', price: 260, categoryId: 'dcat6', isVeg: true, vegType: 'VEG' },
  { id: 'mock5', name: 'Guava Marry', price: 270, categoryId: 'dcat6', isVeg: true, vegType: 'VEG' },
  { id: 'mock6', name: 'Blue Moon', price: 240, categoryId: 'dcat6', isVeg: true, vegType: 'VEG' },
  { id: 'mock7', name: 'Pink Lady', price: 240, categoryId: 'dcat6', isVeg: true, vegType: 'VEG' },
  { id: 'mock8', name: 'Green Sea', price: 240, categoryId: 'dcat6', isVeg: true, vegType: 'VEG' },
  { id: 'mock9', name: 'Strawberry WOHO', price: 240, categoryId: 'dcat6', isVeg: true, vegType: 'VEG' },
  { id: 'mock10', name: 'Green COCO', price: 240, categoryId: 'dcat6', isVeg: true, vegType: 'VEG' },
  { id: 'mock11', name: 'Litchi Colada', price: 260, categoryId: 'dcat6', isVeg: true, vegType: 'VEG' },
  { id: 'mock12', name: 'Sangria Red', price: 270, categoryId: 'dcat6', isVeg: true, vegType: 'VEG' },

  // Cocktails (dcat7)
  { id: 'cock1', name: 'Kamikaze', price: 320, categoryId: 'dcat7', isVeg: true, vegType: 'VEG' },
  { id: 'cock2', name: 'B-52', price: 320, categoryId: 'dcat7', isVeg: true, vegType: 'VEG' },
  { id: 'cock3', name: 'Kahlua, Bailey & Contrau', price: 320, categoryId: 'dcat7', isVeg: true, vegType: 'VEG' },
  { id: 'cock4', name: 'Roulette', price: 320, categoryId: 'dcat7', isVeg: true, vegType: 'VEG' },
  { id: 'cock5', name: 'White Or Black Russian', price: 415, categoryId: 'dcat7', isVeg: true, vegType: 'VEG' },
  { id: 'cock6', name: 'Cosmopolitan', price: 350, categoryId: 'dcat7', isVeg: true, vegType: 'VEG' },
  { id: 'cock7', name: 'Daiquiri', price: 340, categoryId: 'dcat7', isVeg: true, vegType: 'VEG' },
  { id: 'cock8', name: 'Mojito', price: 350, categoryId: 'dcat7', isVeg: true, vegType: 'VEG' },
  { id: 'cock9', name: 'Pina Colada', price: 380, categoryId: 'dcat7', isVeg: true, vegType: 'VEG' },
  { id: 'cock10', name: 'Pomegranate Basil Martini', price: 380, categoryId: 'dcat7', isVeg: true, vegType: 'VEG' },
  { id: 'cock11', name: 'Hi Hop', price: 350, categoryId: 'dcat7', isVeg: true, vegType: 'VEG' },
  { id: 'cock12', name: 'Sangria Red & White', price: 410, categoryId: 'dcat7', isVeg: true, vegType: 'VEG' },
  { id: 'cock13', name: 'Whisky Sour', price: 340, categoryId: 'dcat7', isVeg: true, vegType: 'VEG' },
  { id: 'cock14', name: 'Tom Collins', price: 330, categoryId: 'dcat7', isVeg: true, vegType: 'VEG' },
  { id: 'cock15', name: 'Margarita', price: 370, categoryId: 'dcat7', isVeg: true, vegType: 'VEG' },
  { id: 'cock16', name: 'Classic Martini', price: 360, categoryId: 'dcat7', isVeg: true, vegType: 'VEG' },
  { id: 'cock17', name: 'Old Monk Cocktail', price: 370, categoryId: 'dcat7', isVeg: true, vegType: 'VEG' },
  { id: 'cock18', name: 'Tequila Sunrise', price: 360, categoryId: 'dcat7', isVeg: true, vegType: 'VEG' },
  { id: 'cock19', name: 'Chatoha', price: 340, categoryId: 'dcat7', isVeg: true, vegType: 'VEG' },

  // Zero Alcohol (dcat8)
  { id: 'za1', name: 'Red Bull', price: 190, categoryId: 'dcat8', isVeg: true, vegType: 'VEG' },
  { id: 'za2', name: 'Bottled Water', price: 30, categoryId: 'dcat8', isVeg: true, vegType: 'VEG' },
  { id: 'za3', name: 'Fresh Lime Water', price: 60, categoryId: 'dcat8', isVeg: true, vegType: 'VEG' },
  { id: 'za4', name: 'Fresh Lime Soda', price: 70, categoryId: 'dcat8', isVeg: true, vegType: 'VEG' },
  { id: 'za5', name: 'Canned Juice', price: 120, categoryId: 'dcat8', isVeg: true, vegType: 'VEG' },
  { id: 'za6', name: 'Jal Jeera', price: 80, categoryId: 'dcat8', isVeg: true, vegType: 'VEG' },

];

export const TAX_RATE = 0.05;
export const DRINK_TAX_RATE = 0.05;

export const INITIAL_RESTAURANT_INFO = {
  name: "Noon To Moon",
  phone: "9321370001",
  address: "Shop No. 6,7,8, Patel Zion, Near Reliance Digital, Palegaon",
  gstNo: 'NOT SET',
  vatNo: 'NOT SET',
  fssaiNo: 'NOT SET',
  billPrinterIp: '',
  kotPrinterIp: '192.168.1.5',
};
