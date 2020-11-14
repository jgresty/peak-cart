import { UUID, removeItem } from "../store";

export default function (user: UUID, id: UUID): Promise<void> {
  return removeItem(user, id);
}
