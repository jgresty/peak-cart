import { UUID, addItems } from "../store";

export default async function ({ items }: { items: UUID[] }): Promise<void> {
  await addItems(items);
  return;
}
