import { UUID, removeItem } from "../store";

export default function (id: UUID): Promise<void> {
  return removeItem(id);
}
