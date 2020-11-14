import { UUID, clearItems } from "../store";

export default function (user: UUID): Promise<void> {
  return clearItems(user);
}
