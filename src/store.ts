// Fake in memory database, this would be swapped out for something more persistant in a real application
import { v4 as uuidv4 } from "uuid";

export type UUID = string;

export type Item = {
  id: UUID;
  title: string;
  // price in pence
  price: number;
};
export type BasketItem = {
  id: UUID;
  item: UUID;
};

// Lookup table for items, these would be lookups from an external service in reality
const items: Item[] = [
  { id: "01e9f083-1c18-4769-a6ce-d2c75e68e0f1", title: "aaa", price: 100 },
  { id: "a614113c-ffd7-4ab7-b50d-ada831e640c8", title: "bbb", price: 150 },
  { id: "599698c9-eb35-446b-a0eb-c6bdb51ea823", title: "ccc", price: 199 },
  { id: "bfbbde57-6546-4ccc-8d0c-c414636e0e4d", title: "ddd", price: 249 },
  { id: "1ec2ee52-c5ef-4220-b430-0caf3fde3c84", title: "eee", price: 50 },
  { id: "7bcfb069-9752-4965-b559-1bd79f250680", title: "fff", price: 1000 },
  { id: "9dd39e77-7818-4851-a7db-d3f599db1e82", title: "ggg", price: 999 },
  { id: "ada23c07-29ab-4ba9-9d51-7f8269ce1910", title: "eee", price: 640 },
  { id: "337f24c5-9da4-4301-9e27-bf229f8db847", title: "hhh", price: 123 },
  { id: "fc5ea0e9-cf51-4f71-8c08-e2f5fc931eaa", title: "iii", price: 654 },
  { id: "ec663273-9dff-461d-bbe1-dfbe2c7f3d51", title: "jjj", price: 345 },
];

// Mimics an external service lookup
export function getItems(ids: UUID[], table: Item[] = items): Promise<Item[]> {
  const filtered = table.filter((item) => ids.includes(item.id));
  return Promise.resolve(filtered);
}

let basket: BasketItem[] = [];

export function addItems(itemIds: UUID[]): Promise<BasketItem[]> {
  const newItems = itemIds.map((item) => ({ id: uuidv4(), item }));
  basket = [...basket, ...newItems];
  return Promise.resolve(newItems);
}
export function getAllItems(): Promise<BasketItem[]> {
  // Return a copy so we don't accedently modify it
  return Promise.resolve([...basket]);
}
export function clearItems(): Promise<void> {
  basket = [];
  return Promise.resolve();
}
export function removeItem(id: UUID): Promise<void> {
  basket = basket.filter((basketItem) => basketItem.id !== id);
  return Promise.resolve();
}
