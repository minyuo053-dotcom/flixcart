import { getDb } from "../api/queries/connection";
import { categories, products } from "./schema";

async function seed() {
  const db = getDb();

  // Seed categories
  const cats = await db.insert(categories).values([
    { name: "Food", slug: "food", color: "#22D3EE", icon: "UtensilsCrossed" },
    { name: "Fashion", slug: "fashion", color: "#F472B6", icon: "Shirt" },
    { name: "Gadgets", slug: "gadgets", color: "#A78BFA", icon: "Headphones" },
    { name: "Home", slug: "home", color: "#34D399", icon: "Home" },
  ]).onDuplicateKeyUpdate({ set: { name: categories.name } });

  console.log("Categories seeded:", cats);

  // Seed products
  const prods = await db.insert(products).values([
    // Food
    { name: "Gourmet Burger", description: "Juicy beef patty with melted cheese, fresh lettuce, and caramelized onions on a brioche bun.", price: "12.99", image: "/images/product-burger.jpg", categoryId: 1, stock: 50, rating: "4.8" },
    { name: "Fresh Organic Bowl", description: "Colorful rice bowl with grilled chicken, avocado, edamame, and fresh vegetables.", price: "15.99", image: "/images/food-dish.jpg", categoryId: 1, stock: 40, rating: "4.9" },
    { name: "Artisan Coffee", description: "Premium single-origin latte with beautiful latte art, made from freshly roasted beans.", price: "5.99", image: "/images/product-coffee.jpg", categoryId: 1, stock: 100, rating: "4.7" },
    { name: "Fresh Produce Box", description: "Curated selection of seasonal organic fruits and vegetables delivered farm-fresh.", price: "24.99", image: "/images/product-groceries.jpg", categoryId: 1, stock: 30, rating: "4.6" },
    // Fashion
    { name: "Street Sneakers", description: "Trendy white canvas sneakers with blue accents, perfect for everyday urban style.", price: "89.99", image: "/images/fashion-sneakers.jpg", categoryId: 2, stock: 25, rating: "4.7" },
    { name: "Denim Jacket", description: "Classic dark wash denim jacket with silver buttons, a timeless wardrobe staple.", price: "79.99", image: "/images/product-jacket.jpg", categoryId: 2, stock: 20, rating: "4.5" },
    { name: "Premium Black Tee", description: "Ultra-soft organic cotton t-shirt with a minimal embroidered logo detail.", price: "34.99", image: "/images/product-tshirt.jpg", categoryId: 2, stock: 60, rating: "4.4" },
    // Gadgets
    { name: "Pro Headphones", description: "Premium over-ear wireless headphones with active noise cancellation and 30-hour battery.", price: "199.99", image: "/images/gadgets-headphones.jpg", categoryId: 3, stock: 15, rating: "4.9" },
    { name: "Smart Watch", description: "Modern fitness tracker with heart rate monitor, GPS, and 7-day battery life.", price: "149.99", image: "/images/product-watch.jpg", categoryId: 3, stock: 20, rating: "4.6" },
    { name: "Bluetooth Speaker", description: "Portable 360-degree speaker with deep bass, waterproof design, and 12-hour playtime.", price: "79.99", image: "/images/product-speaker.jpg", categoryId: 3, stock: 35, rating: "4.5" },
    // Home
    { name: "Smart Desk Lamp", description: "Adjustable LED desk lamp with warm light, touch controls, and USB charging port.", price: "49.99", image: "/images/product-lamp.jpg", categoryId: 4, stock: 40, rating: "4.7" },
  ]).onDuplicateKeyUpdate({ set: { name: products.name } });

  console.log("Products seeded:", prods);
  console.log("Seed complete!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
