const fs = require('fs');

const data = {
  "restaurant": "Noon To Moon",
  "menu": [
    {
      "category": "Oriental Veg Starter",
      "items": [
        {"name": "Crispy Vegetable", "type": "veg", "prices": {"full": 320}},
        {"name": "Veg Salt N Pepper", "type": "veg", "prices": {"full": 320}},
        {"name": "Noon To Moon Chilli Cottage Cheese", "type": "veg", "prices": {"full": 310}},
        {"name": "Crispy Corn Chilli Pepper", "type": "veg", "prices": {"full": 310}},
        {"name": "Mushroom Ginger Chilli", "type": "veg", "prices": {"full": 330}},
        {"name": "Veg Manchurian Dry", "type": "veg", "prices": {"full": 320}},
        {"name": "Veg Spring Roll", "type": "veg", "prices": {"full": 310}},
        {"name": "Veg Schezwan Finger", "type": "veg", "prices": {"full": 320}},
        {"name": "Veg 65", "type": "veg", "prices": {"full": 310}},
        {"name": "Paneer In Choice Of Sauce", "type": "veg", "prices": {"full": 350}},
        {"name": "Paneer Chilly Dry", "type": "veg", "prices": {"full": 340}},
        {"name": "Paneer Satay", "type": "veg", "prices": {"full": 340}},
        {"name": "Paneer Manchurian", "type": "veg", "prices": {"full": 340}},
        {"name": "Paneer Chillimilli", "type": "veg", "prices": {"full": 350}}
      ]
    },

    {
      "category": "Tandoori Veg",
      "items": [
        {"name": "Bharwan Paneer Tikka", "type": "veg", "prices": {"full": 350}},
        {"name": "Paneer Multani", "type": "veg", "prices": {"full": 350}},
        {"name": "Paneer Malai Seekh Kabab", "type": "veg", "prices": {"full": 350}},
        {"name": "Dingri Tandoori", "type": "veg", "prices": {"full": 320}},
        {"name": "Paneer Tikka", "type": "veg", "prices": {"full": 375}},
        {"name": "Veg Jugalbandi Kabab", "type": "veg", "prices": {"full": 310}}
      ]
    },

    {
      "category": "Tandoori Non Veg",
      "items": [
        {"name": "Hyderabadi Tandoori", "type": "nonveg", "prices": {"half": 310, "full": 550}},
        {"name": "Murgh Tandoori", "type": "nonveg", "prices": {"half": 325, "full": 560}},
        {"name": "Ghee Roast Tandoori", "type": "nonveg", "prices": {"half": 340, "full": 580}},
        {"name": "Murgh Handi Lazeez", "type": "nonveg", "prices": {"full": 375}},
        {"name": "Murgh Dilkhush Kabab", "type": "nonveg", "prices": {"full": 430}},
        {"name": "Chicken Kali Miri Kabab", "type": "nonveg", "prices": {"full": 395}},
        {"name": "Chicken Banjara Kabab", "type": "nonveg", "prices": {"full": 395}},
        {"name": "Chicken Reshmi Kabab", "type": "nonveg", "prices": {"full": 420}},
        {"name": "Chicken Achari Kabab", "type": "nonveg", "prices": {"full": 395}},
        {"name": "Chicken Malai Kabab", "type": "nonveg", "prices": {"full": 420}},
        {"name": "Chicken Chilli Kabab", "type": "nonveg", "prices": {"full": 420}},
        {"name": "Chicken Angara Kabab", "type": "nonveg", "prices": {"full": 420}},
        {"name": "Garlic Chicken", "type": "nonveg", "prices": {"full": 350}},
        {"name": "Chicken Manchuriyan", "type": "nonveg", "prices": {"full": 350}},
        {"name": "Chicken Koliwada", "type": "nonveg", "prices": {"full": 330}},
        {"name": "Cornflour Curd", "type": "nonveg", "prices": {"full": 470}},
        {"name": "Mutton Seekh Kabab", "type": "nonveg", "prices": {"full": 470}},
        {"name": "Liver Petha Oil Fry", "type": "nonveg", "prices": {"full": 220}},
        {"name": "Liver Petha Lapeta", "type": "nonveg", "prices": {"full": 265}},
        {"name": "Chicken Tangdi Kabab", "type": "nonveg", "prices": {"full": 420}}
      ]
    },

    {
      "category": "Indian Veg Starters",
      "items": [
        {"name": "Cheese Kurkure", "type": "veg", "prices": {"full": 350}},
        {"name": "Veg Hara Bhara Kabab", "type": "veg", "prices": {"full": 320}},
        {"name": "Veg Bukhara Kabab", "type": "veg", "prices": {"full": 320}},
        {"name": "Palak Cheese Tikki", "type": "veg", "prices": {"full": 320}},
        {"name": "Corn Tikki", "type": "veg", "prices": {"full": 310}},
        {"name": "Stuff Jacketed Potato", "type": "veg", "prices": {"full": 310}},
        {"name": "Stuff Mushroom", "type": "veg", "prices": {"full": 340}},
        {"name": "Soya Bean Chilli", "type": "veg", "prices": {"full": 310}},
        {"name": "Veg Chilli", "type": "veg", "prices": {"full": 310}}
      ]
    },

    {
      "category": "Seafood Tawa Fry",
      "items": [
        {"name": "Pomfret Tawa Fry", "type": "seafood", "prices": {"full": 650}},
        {"name": "Baby Kingfish Tawa Fry", "type": "seafood", "prices": {"full": 600}},
        {"name": "Baby Kingfish Tandoor", "type": "seafood", "prices": {"full": 650}},
        {"name": "Surmai Tawa Fry", "type": "seafood", "prices": {"full": 550}},
        {"name": "Rawas Fry", "type": "seafood", "prices": {"full": 350}},
        {"name": "Bombil Rawa Tawa Fry", "type": "seafood", "prices": {"full": 280}},
        {"name": "Mandeli Tawa Fry", "type": "seafood", "prices": {"full": 250}}
      ]
    },

    {
      "category": "Veg Main Course",
      "items": [
        {"name": "Subz Falguni", "type": "veg", "prices": {"full": 320}},
        {"name": "Subz Miloni", "type": "veg", "prices": {"full": 320}},
        {"name": "Subz Doaba", "type": "veg", "prices": {"full": 340}},
        {"name": "Subz Bhuna Masala", "type": "veg", "prices": {"full": 320}},
        {"name": "Subz Phaldari Kofta", "type": "veg", "prices": {"full": 340}},
        {"name": "Lasooni Kofta", "type": "veg", "prices": {"full": 330}},
        {"name": "Subz Kolhapuri", "type": "veg", "prices": {"full": 310}},
        {"name": "Paneer Tikka Masala", "type": "veg", "prices": {"full": 340}},
        {"name": "Paneer Kadhai", "type": "veg", "prices": {"full": 330}},
        {"name": "Veg Kadhai", "type": "veg", "prices": {"full": 310}},
        {"name": "Paneer Pasanda", "type": "veg", "prices": {"full": 350}},
        {"name": "Paneer Garlic Masala", "type": "veg", "prices": {"full": 330}},
        {"name": "Noon To Moon Special Subz", "type": "veg", "prices": {"full": 385}},
        {"name": "Subz Tawa Masala", "type": "veg", "prices": {"full": 340}},
        {"name": "Dm Ka Khumb", "type": "veg", "prices": {"full": 330}},
        {"name": "Subz Maratha", "type": "veg", "prices": {"full": 320}},
        {"name": "Paneer Lahori", "type": "veg", "prices": {"full": 350}},
        {"name": "Paneer Reshmi Masala", "type": "veg", "prices": {"full": 340}},
        {"name": "Paneer Makhanwala", "type": "veg", "prices": {"full": 340}},
        {"name": "Palak Paneer", "type": "veg", "prices": {"full": 310}},
        {"name": "Veg Keema Masala", "type": "veg", "prices": {"full": 285}},
        {"name": "Jeera Aloo", "type": "veg", "prices": {"full": 285}},
        {"name": "Paneer Mutter Masala", "type": "veg", "prices": {"full": 310}},
        {"name": "Paneer Butter Masala", "type": "veg", "prices": {"full": 320}}
      ]
    },

    {
      "category": "Biryani",
      "items": [
        {"name": "Vegetable Biryani", "type": "veg", "prices": {"full": 310}},
        {"name": "Chicken Biryani", "type": "nonveg", "prices": {"full": 350}},
        {"name": "Prawns Biryani", "type": "seafood", "prices": {"full": 430}},
        {"name": "Mutton Biryani", "type": "nonveg", "prices": {"full": 430}}
      ]
    },

    {
      "category": "Oriental Non Veg Starter",
      "items": [
        {"name": "Crispy Chicken", "type": "nonveg", "prices": {"full": 360}},
        {"name": "Chicken Lollipop", "type": "nonveg", "prices": {"full": 360}},
        {"name": "Chicken Black Pepper Dry", "type": "nonveg", "prices": {"full": 420}},
        {"name": "Butter Garlic Prawns", "type": "seafood", "prices": {"full": 420}},
        {"name": "Drums Of Heaven", "type": "nonveg", "prices": {"full": 430}},
        {"name": "Chicken 65", "type": "nonveg", "prices": {"full": 375}},
        {"name": "Chicken Spring Roll", "type": "nonveg", "prices": {"full": 385}},
        {"name": "Pomfret Tandoori", "type": "seafood", "price_on_request": true}
      ]
    }
  ]
};

let output = `
import { Category, MenuItem } from './types';

export const COLORS = {
  primary: '#F57C00', // Orange
  secondary: '#262626', // Dark Grey
  success: '#22c55e', // Green
  danger: '#ef4444', // Red
};

export const INITIAL_CATEGORIES: Category[] = [
`;

const categories = data.menu.map((cat, i) => ({ id: \`cat\${i+1}\`, name: cat.category }));
categories.forEach(cat => {
  output += \`  { id: '\${cat.id}', name: '\${cat.name}' },\\n\`;
});
output += \`];\\n\\nexport const INITIAL_MENU_ITEMS: MenuItem[] = [\\n\`;

let itemId = 1;
data.menu.forEach((cat, catIdx) => {
  const cId = \`cat\${catIdx+1}\`;
  output += \`  // \${cat.category} (\${cId})\\n\`;
  cat.items.forEach(item => {
    let vegTypeStr = 'VEG';
    let isVeg = true;
    if (item.type === 'nonveg') {
        vegTypeStr = 'NON_VEG';
        isVeg = false;
    } else if (item.type === 'seafood') {
        vegTypeStr = 'SEAFOOD';
        isVeg = false;
    }

    if (item.price_on_request) {
        output += \`  { id: 'item\${itemId++}', name: '\${item.name} (Price on Request)', price: 0, categoryId: '\${cId}', isVeg: \${isVeg}, vegType: '\${vegTypeStr}' },\\n\`;
    } else if (item.prices.half && item.prices.full) {
        output += \`  { id: 'item\${itemId++}', name: '\${item.name} (Half)', price: \${item.prices.half}, categoryId: '\${cId}', isVeg: \${isVeg}, vegType: '\${vegTypeStr}' },\\n\`;
        output += \`  { id: 'item\${itemId++}', name: '\${item.name} (Full)', price: \${item.prices.full}, categoryId: '\${cId}', isVeg: \${isVeg}, vegType: '\${vegTypeStr}' },\\n\`;
    } else {
        output += \`  { id: 'item\${itemId++}', name: '\${item.name}', price: \${item.prices.full}, categoryId: '\${cId}', isVeg: \${isVeg}, vegType: '\${vegTypeStr}' },\\n\`;
    }
  });
  output += \`\\n\`;
});

output += \`];\\n\\nexport const TAX_RATE = 0.05;\\n\`;

fs.writeFileSync('c:/Users/A1/drona-pos/constants.tsx', output);
console.log('Done!');
