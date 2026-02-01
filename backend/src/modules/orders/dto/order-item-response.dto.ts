export class OrderItemResponseDto {
  id!: string;
  productId!: string | null;
  qty!: number;
  priceAmount!: string;
  totalAmount!: string;
}
