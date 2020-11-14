import { clearItems } from "../store";

export default function (): Promise<void> {
  return clearItems();
}
