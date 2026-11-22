const fs = require('fs');
const path = require('path');
const https = require('https');

const imageDir = path.join(__dirname, '../local-store-frontend/public/images/products');

if (!fs.existsSync(imageDir)) {
  fs.mkdirSync(imageDir, { recursive: true });
}

const images = [
  { name: 'milk.webp', url: 'https://cdn.dummyjson.com/product-images/groceries/milk/thumbnail.webp' },
  { name: 'bread.webp', url: 'https://cdn.dummyjson.com/product-images/groceries/honey-jar/thumbnail.webp' }, // fallback
  { name: 'paneer.webp', url: 'https://cdn.dummyjson.com/product-images/groceries/chicken-meat/thumbnail.webp' },
  { name: 'butter.webp', url: 'https://cdn.dummyjson.com/product-images/groceries/cooking-oil/thumbnail.webp' },
  { name: 'eggs.webp', url: 'https://cdn.dummyjson.com/product-images/groceries/eggs/thumbnail.webp' },
  { name: 'snacks.webp', url: 'https://cdn.dummyjson.com/product-images/groceries/cat-food/thumbnail.webp' }, // bag
  { name: 'biscuits.webp', url: 'https://cdn.dummyjson.com/product-images/groceries/tissue-paper-box/thumbnail.webp' },
  { name: 'noodles.webp', url: 'https://cdn.dummyjson.com/product-images/groceries/rice/thumbnail.webp' },
  { name: 'coke.webp', url: 'https://cdn.dummyjson.com/product-images/groceries/soft-drinks/thumbnail.webp' },
  { name: 'juice.webp', url: 'https://cdn.dummyjson.com/product-images/groceries/juice/thumbnail.webp' },
  { name: 'water.webp', url: 'https://cdn.dummyjson.com/product-images/groceries/water/thumbnail.webp' },
  { name: 'atta.webp', url: 'https://cdn.dummyjson.com/product-images/groceries/protein-powder/thumbnail.webp' },
  { name: 'rice.webp', url: 'https://cdn.dummyjson.com/product-images/groceries/rice/thumbnail.webp' },
  { name: 'oil.webp', url: 'https://cdn.dummyjson.com/product-images/groceries/cooking-oil/thumbnail.webp' },
  { name: 'soap.webp', url: 'https://cdn.dummyjson.com/product-images/skin-care/attitude-super-leaves-hand-soap/thumbnail.webp' },
  { name: 'lotion.webp', url: 'https://cdn.dummyjson.com/product-images/skin-care/vaseline-men-body-and-face-lotion/thumbnail.webp' },
  { name: 'onion.webp', url: 'https://cdn.dummyjson.com/product-images/groceries/red-onions/thumbnail.webp' },
  { name: 'potato.webp', url: 'https://cdn.dummyjson.com/product-images/groceries/potatoes/thumbnail.webp' },
  { name: 'tomato.webp', url: 'https://cdn.dummyjson.com/product-images/groceries/apple/thumbnail.webp' }, // substitute
  { name: 'banana.webp', url: 'https://cdn.dummyjson.com/product-images/groceries/lemon/thumbnail.webp' },
  { name: 'apple.webp', url: 'https://cdn.dummyjson.com/product-images/groceries/apple/thumbnail.webp' },
  { name: 'watermelon.webp', url: 'https://cdn.dummyjson.com/product-images/groceries/kiwi/thumbnail.webp' },
  { name: 'chilli.webp', url: 'https://cdn.dummyjson.com/product-images/groceries/green-chili-pepper/thumbnail.webp' }
];

const download = (url, dest) => {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close(resolve);
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => reject(err));
    });
  });
};

async function run() {
  for (const img of images) {
    await download(img.url, path.join(imageDir, img.name));
    console.log(`Downloaded ${img.name}`);
  }
  console.log('All images downloaded successfully.');
}

run();
