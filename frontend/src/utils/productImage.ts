// Curated Unsplash photo IDs per category — 5 per category so products vary within same category
const CATEGORY_PHOTOS: Record<string, string[]> = {
  Electronics: [
    'photo-1498049794561-7780e7231661', // laptop on desk
    'photo-1519389950473-47ba0277781c', // phones
    'photo-1505740420928-5e560c06d30e', // headphones
    'photo-1526170375885-f04d97f2a2bc', // camera
    'photo-1593642632559-0c6d3fc62b89', // tech devices
  ],
  Clothing: [
    'photo-1523381210434-271e8be1f52b', // clothing rack
    'photo-1441986300917-64674bd600d8', // store
    'photo-1490481651871-ab68de25d43d', // casual wear
    'photo-1515886657613-9f3515b0c78f', // fashion
    'photo-1558618666-fcd25c85cd64', // colorful clothes
  ],
  Books: [
    'photo-1512820790803-83ca734da794', // books on shelf
    'photo-1507842217343-583bb7270b66', // reading
    'photo-1481627834876-b7833e8f5d75', // library
    'photo-1495640388908-05fa85288e61', // open book
    'photo-1544716278-ca5e3f4abd8c', // stacked books
  ],
  Home: [
    'photo-1556909114-f6e7ad7d3136', // kitchen
    'photo-1555041469-a586c61ea9bc', // sofa
    'photo-1484101403633-562f891dc89a', // interior
    'photo-1618220179428-22790b461013', // home decor
    'photo-1507089947368-19c1da9775ae', // modern home
  ],
  Sports: [
    'photo-1461896836934-ffe607ba8211', // sports
    'photo-1517649763962-0c623066013b', // running shoes
    'photo-1571019613454-1cb2f99b2d8b', // gym
    'photo-1541534741688-6078c6bfb5c5', // fitness
    'photo-1599058917765-a780eda07a3e', // sports gear
  ],
  Toys: [
    'photo-1558060370-d644479cb6f7', // colorful toys
    'photo-1587654780291-39c9404d746b', // lego
    'photo-1515488042361-ee00e0ddd4e4', // toy car
    'photo-1582652803853-4d8127ec19f0', // building blocks
    'photo-1594736797933-d0401ba2fe65', // stuffed animals
  ],
  Food: [
    'photo-1498837167922-ddd27525d352', // healthy food
    'photo-1567620905732-2d1ec7ab7445', // food variety
    'photo-1476224203421-9ac39bcb3327', // breakfast
    'photo-1504674900247-0877df9cc836', // cooking
    'photo-1540189549336-e6e99a3a8520', // salad
  ],
  Beauty: [
    'photo-1512207736890-6ffed8a84e8d', // beauty products
    'photo-1596462502278-27bfdc403348', // makeup
    'photo-1522335789203-aabd1fc54bc9', // skincare
    'photo-1590156206657-aec437ef3b3c', // beauty flat lay
    'photo-1571781926291-c477ebfd024b', // perfume
  ],
};

// Price-tier photos for products with no category
const PRICE_PHOTOS: Record<'low' | 'mid' | 'high', string[]> = {
  low: [
    'photo-1542601906990-b4d3fb778b09', // simple colorful items
    'photo-1523275335684-37898b6baf30', // watch (budget)
    'photo-1491553895911-0055eca6402d', // sneakers
  ],
  mid: [
    'photo-1553062407-98eeb64c6a62', // backpack
    'photo-1491553895911-0055eca6402d', // sneakers
    'photo-1523275335684-37898b6baf30', // watch
  ],
  high: [
    'photo-1542621334-a254cf47733d', // premium watch
    'photo-1553062407-98eeb64c6a62', // leather bag
    'photo-1445205170230-053b83016050', // luxury
  ],
};

export function getProductImage(product: {
  id: number;
  category?: string | null;
  price: number;
  imageUrl?: string | null;
}): string {
  if (product.imageUrl) return product.imageUrl;

  const categoryPhotos = product.category ? CATEGORY_PHOTOS[product.category] : null;
  if (categoryPhotos) {
    return `https://images.unsplash.com/${categoryPhotos[product.id % categoryPhotos.length]}?w=400&h=280&fit=crop&auto=format&q=80`;
  }

  const tier: 'low' | 'mid' | 'high' =
    product.price < 20 ? 'low' : product.price < 100 ? 'mid' : 'high';
  const fallbacks = PRICE_PHOTOS[tier];
  return `https://images.unsplash.com/${fallbacks[product.id % fallbacks.length]}?w=400&h=280&fit=crop&auto=format&q=80`;
}
