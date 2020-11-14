import { UUID } from "../store";

const MAX_WEIGHT = 10;

type Item = {
  id: UUID;
  weight: number;
  days: number;
};

function minDays(items: Item[]): [number, Item] {
  let index = 0;
  let value = items[0].days;
  for (let i = 1; i < items.length; i++) {
    if (items[i].days < value) {
      value = items[i].days;
      index = i;
    }
  }
  return [index, items[index]];
}

export default function (
  ids: UUID[],
  weights: number[],
  days: number[]
): { id: UUID[]; days: number } {
  // Get them into a more useable form, specifying them seperatly is helpful for
  // other algorithms (ie 0-1 knapsack) but the requirements just call for a
  // greedy algorithm which is easier when you don't have to keep looking up
  // items by id
  let items = ids.map((id, idx) => ({
    id,
    weight: weights[idx],
    days: days[idx],
  }));

  const selected = [];
  let remainingWeight = MAX_WEIGHT;
  while (items.length > 0) {
    const [selectedIdx, smallest] = minDays(items);
    selected.push(smallest);
    remainingWeight -= smallest.weight;
    items = items.filter(
      (item, idx) => idx !== selectedIdx && item.weight <= remainingWeight
    );
  }

  return {
    id: selected.map((item) => item.id),
    days: selected.map((item) => item.days).reduce((a, b) => a + b),
  };
}
