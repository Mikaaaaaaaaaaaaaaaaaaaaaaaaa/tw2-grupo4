import { prisma } from "../config/db";

async function main() {
  const cantidad = await prisma.products.count();
  if (cantidad > 0) {
    console.log("Ya hay productos cargados, no se agrega nada.");
    return;
  }

  await prisma.products.createMany({
    data: [
      { title: "Remera básica", description: "Remera de algodón", category: "Ropa", price: 12500, stock: 40, rating: 4.5 },
      { title: "Jean clásico", description: "Jean azul recto", category: "Ropa", price: 38000, stock: 25, rating: 4.2 },
      { title: "Zapatillas urbanas", description: "Zapatillas livianas", category: "Calzado", price: 65000, stock: 18, rating: 4.7 },
      { title: "Auriculares Bluetooth", description: "Con micrófono", category: "Electrónica", price: 29000, stock: 30, rating: 4.1 },
      { title: "Mouse inalámbrico", description: "Mouse óptico", category: "Electrónica", price: 14500, stock: 50, rating: 4.3 },
      { title: "Mochila escolar", description: "Mochila con 2 compartimentos", category: "Accesorios", price: 22000, stock: 35, rating: 4.4 },
      { title: "Botella térmica", description: "Mantiene el frío 12 horas", category: "Hogar", price: 11000, stock: 60, rating: 4.6 },
      { title: "Lámpara de escritorio", description: "Luz LED regulable", category: "Hogar", price: 17500, stock: 22, rating: 4.0 },
      { title: "Cuaderno A4", description: "120 hojas rayadas", category: "Librería", price: 4500, stock: 100, rating: 4.8 },
      { title: "Set de lapiceras", description: "Pack de 10 colores", category: "Librería", price: 3800, stock: 80, rating: 4.2 },
    ],
  });

  console.log("Se cargaron 10 productos de prueba.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });