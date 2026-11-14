import { prisma } from "../config/db";

// Las categorías se comparan en el front sin tildes ni mayúsculas
const LAPTOPS = "Laptops";
const PERIFERICOS = "Periféricos";
const AUDIO = "Audio";
const COMPONENTES = "Componentes";

const productos = [
  // Laptops
  { title: "Netbook 11.6 pulgadas Celeron", description: "Liviana y portátil, 4 GB de RAM y 128 GB de almacenamiento", category: LAPTOPS, price: 389000, stock: 15, rating: 4.0 },
  { title: "Notebook 15.6 pulgadas Ryzen 5", description: "16 GB de RAM, SSD de 512 GB y pantalla Full HD", category: LAPTOPS, price: 920000, stock: 10, rating: 4.5 },
  { title: "Ultrabook 14 pulgadas Core i7", description: "Delgada, 16 GB de RAM, SSD de 1 TB y batería de larga duración", category: LAPTOPS, price: 1450000, stock: 6, rating: 4.7 },

  // Periféricos
  { title: "Teclado Mecánico RGB", description: "Switches rojos, retroiluminado, formato completo", category: PERIFERICOS, price: 59000, stock: 30, rating: 4.6 },
  { title: "Mouse Gamer Inalámbrico", description: "Sensor óptico de 16000 DPI y batería recargable", category: PERIFERICOS, price: 32000, stock: 45, rating: 4.3 },
  { title: "Monitor 24 pulgadas Full HD 144 Hz", description: "Panel IPS con tiempo de respuesta de 1 ms", category: PERIFERICOS, price: 289000, stock: 12, rating: 4.4 },

  // Audio
  { title: "Auriculares Bluetooth", description: "Inalámbricos con micrófono y cancelación de ruido", category: AUDIO, price: 78000, stock: 28, rating: 4.2 },
  { title: "Auriculares Gamer con Micrófono", description: "Sonido envolvente 7.1 y almohadillas acolchadas", category: AUDIO, price: 54000, stock: 20, rating: 4.1 },
  { title: "Parlante Bluetooth Portátil", description: "Resistente al agua, hasta 12 horas de batería", category: AUDIO, price: 46000, stock: 35, rating: 4.5 },

  // Componentes
  { title: "Disco SSD NVMe 1 TB", description: "Velocidades de lectura de hasta 3500 MB/s", category: COMPONENTES, price: 98000, stock: 25, rating: 4.8 },
  { title: "Memoria RAM 16 GB DDR4", description: "3200 MHz, ideal para notebooks y PC de escritorio", category: COMPONENTES, price: 52000, stock: 40, rating: 4.6 },
  { title: "Placa de Video 8 GB", description: "GDDR6, ideal para gaming en Full HD", category: COMPONENTES, price: 640000, stock: 8, rating: 4.7 },
];

async function main() {
  // El orden importa: primero lo que depende de los productos
  await prisma.$executeRawUnsafe("DELETE FROM order_items");
  await prisma.$executeRawUnsafe("DELETE FROM orders");
  await prisma.products.deleteMany();
  await prisma.$executeRawUnsafe("DBCC CHECKIDENT ('products', RESEED, 0)");

  await prisma.products.createMany({ data: productos });

  console.log(`Se cargaron ${productos.length} productos de prueba.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });