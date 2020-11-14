import * as request from "supertest";
import app from "../src/app";
import { getAllItems, clearItems } from "../src/store";

describe("POST /", () => {
  beforeEach(clearItems);

  it("returns 201", async () => {
    const res = await request(app).post("/").send({ items: [] });
    expect(res.statusCode).toEqual(201);
  });

  it("adds items by id to the basket", async () => {
    const items = [
      "01e9f083-1c18-4769-a6ce-d2c75e68e0f1",
      "ec663273-9dff-461d-bbe1-dfbe2c7f3d51",
    ];
    await request(app).post("/").send({ items });
    const basket = await getAllItems();
    expect(basket).toEqual(items);
  });

  it("does not overwrite basket contents with sucessive calls", async () => {
    const itemsA = ["01e9f083-1c18-4769-a6ce-d2c75e68e0f1"];
    await request(app).post("/").send({ items: itemsA });
    let basket = await getAllItems();
    expect(basket).toEqual(itemsA);

    const itemsB = ["ec663273-9dff-461d-bbe1-dfbe2c7f3d51"];
    await request(app).post("/").send({ items: itemsB });
    basket = await getAllItems();
    expect(basket).toEqual([...itemsA, ...itemsB]);
  });
});
