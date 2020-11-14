import * as faker from "faker";

import * as store from "../src/store";

describe("getItems", () => {
  it("return an item given its id", async () => {
    const table = [
      {
        id: faker.random.uuid(),
        title: faker.random.word(),
        price: faker.random.number,
      },
      {
        id: faker.random.uuid(),
        title: faker.random.word(),
        price: faker.random.number,
      },
      {
        id: faker.random.uuid(),
        title: faker.random.word(),
        price: faker.random.number,
      },
    ];
    const res = await store.getItems(
      table.map((item) => item.id),
      table
    );
    expect(res).toEqual(table);
  });

  it("filters out items when id is not provided", async () => {
    const table = [
      {
        id: faker.random.uuid(),
        title: faker.random.word(),
        price: faker.random.number,
      },
      {
        id: faker.random.uuid(),
        title: faker.random.word(),
        price: faker.random.number,
      },
    ];
    const res = await store.getItems([table[0].id], table);
    expect(res).toEqual([table[0]]);
  });

  it("returns nothing with an empty id list", async () => {
    const table = [
      {
        id: faker.random.uuid(),
        title: faker.random.word(),
        price: faker.random.number,
      },
    ];
    const res = await store.getItems([], table);
    expect(res).toEqual([]);
  });
});
