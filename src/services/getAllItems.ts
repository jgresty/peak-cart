import { Item, BasketItem, getItems, getAllItems } from "../store";

type ItemDetail = Omit<BasketItem, "item"> & { item: Item };

export default async function (): Promise<ItemDetail[]> {
  const basketItems = await getAllItems();
  // this kind of join would usually be done by the databse, but we don't have one
  const itemIds = basketItems.map((basketItem) => basketItem.item);
  const items = await getItems(itemIds);
  const result = basketItems.map((basketItem) => ({
    id: basketItem.id,
    item: items.find((item) => item.id === basketItem.item),
  }));
  return result;
}
