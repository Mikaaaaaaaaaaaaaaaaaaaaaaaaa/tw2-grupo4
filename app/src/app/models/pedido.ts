export interface ItemPedido {
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
}

export interface NuevoItemPedido {
  productId: number;
  quantity: number;
}

export interface Pedido {
  id: number;
  userId: number;
  items: ItemPedido[];
  total: number;
  date: string; // ISO
}
