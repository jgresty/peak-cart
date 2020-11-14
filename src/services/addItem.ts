import { UUID, BasketItem, addItems } from "../store";

export default async function ({
  items,
}: {
  items: UUID[];
}): Promise<BasketItem[]> {
  return addItems(items);
}
