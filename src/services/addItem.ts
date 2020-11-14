import { UUID, BasketItem, addItems } from "../store";

export default async function (
  user: UUID,
  {
    items,
  }: {
    items: UUID[];
  }
): Promise<BasketItem[]> {
  return addItems(user, items);
}
