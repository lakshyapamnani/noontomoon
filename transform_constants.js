const fs = require('fs');

let content = fs.readFileSync('c:/Users/A1/drona-pos/constants.tsx', 'utf8');

// Replace Hyderabadi Tandoori
content = content.replace(
  /{ id: 'item21', name: 'Hyderabadi Tandoori \(Half\)', price: 310, categoryId: 'cat3', isVeg: false, vegType: 'NON_VEG' },\n  { id: 'item22', name: 'Hyderabadi Tandoori \(Full\)', price: 550, categoryId: 'cat3', isVeg: false, vegType: 'NON_VEG' },/g,
  "{ id: 'item21', name: 'Hyderabadi Tandoori', price: 550, categoryId: 'cat3', isVeg: false, vegType: 'NON_VEG', hasPortions: true, halfPrice: 310 },"
);

// Replace Murgh Tandoori
content = content.replace(
  /{ id: 'item23', name: 'Murgh Tandoori \(Half\)', price: 325, categoryId: 'cat3', isVeg: false, vegType: 'NON_VEG' },\n  { id: 'item24', name: 'Murgh Tandoori \(Full\)', price: 560, categoryId: 'cat3', isVeg: false, vegType: 'NON_VEG' },/g,
  "{ id: 'item23', name: 'Murgh Tandoori', price: 560, categoryId: 'cat3', isVeg: false, vegType: 'NON_VEG', hasPortions: true, halfPrice: 325 },"
);

// Replace Ghee Roast Tandoori
content = content.replace(
  /{ id: 'item25', name: 'Ghee Roast Tandoori \(Half\)', price: 340, categoryId: 'cat3', isVeg: false, vegType: 'NON_VEG' },\n  { id: 'item26', name: 'Ghee Roast Tandoori \(Full\)', price: 580, categoryId: 'cat3', isVeg: false, vegType: 'NON_VEG' },/g,
  "{ id: 'item25', name: 'Ghee Roast Tandoori', price: 580, categoryId: 'cat3', isVeg: false, vegType: 'NON_VEG', hasPortions: true, halfPrice: 340 },"
);

fs.writeFileSync('c:/Users/A1/drona-pos/constants.tsx', content);
console.log('constants.tsx updated');
