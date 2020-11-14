import * as request from "supertest";
import app from "../src/app";
import { addItems, getAllItems, clearItems } from "../src/store";

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
    const addedItems = basket.map((basketItem) => basketItem.item);
    expect(addedItems).toEqual(items);
  });

  it("does not overwrite basket contents with sucessive calls", async () => {
    const itemsA = ["01e9f083-1c18-4769-a6ce-d2c75e68e0f1"];
    await request(app).post("/").send({ items: itemsA });
    let basket = await getAllItems();
    let addedItems = basket.map((basketItem) => basketItem.item);
    expect(addedItems).toEqual(itemsA);

    const itemsB = ["ec663273-9dff-461d-bbe1-dfbe2c7f3d51"];
    await request(app).post("/").send({ items: itemsB });
    basket = await getAllItems();
    addedItems = basket.map((basketItem) => basketItem.item);
    expect(addedItems).toEqual([...itemsA, ...itemsB]);
  });

  it("returns basket items for each item added", async () => {
    const items = [
      "01e9f083-1c18-4769-a6ce-d2c75e68e0f1",
      "ec663273-9dff-461d-bbe1-dfbe2c7f3d51",
    ];
    const response = await request(app).post("/").send({ items });
    const basket = await getAllItems();
    expect(response.body).toEqual(basket);
  });
});

describe("DELETE /:id", () => {
  beforeEach(clearItems);

  it("returns 204", async () => {
    const basketItems = await addItems([
      "01e9f083-1c18-4769-a6ce-d2c75e68e0f1",
    ]);
    const res = await request(app).delete(`/${basketItems[0].id}`);
    expect(res.statusCode).toEqual(204);
  });

  it("removes an item from the basket", async () => {
    const basketItems = await addItems([
      "01e9f083-1c18-4769-a6ce-d2c75e68e0f1",
    ]);
    await request(app).delete(`/${basketItems[0].id}`);

    const basket = await getAllItems();
    expect(basket).toEqual([]);
  });

  it("only removes the specified item from the basket", async () => {
    const basketItems = await addItems([
      "01e9f083-1c18-4769-a6ce-d2c75e68e0f1",
      "ec663273-9dff-461d-bbe1-dfbe2c7f3d51",
    ]);
    await request(app).delete(`/${basketItems[0].id}`);

    const basket = await getAllItems();
    expect(basket[0]).toEqual(basketItems[1]);
  });
});

describe("PUT /", () => {
  beforeEach(clearItems);

  it("returns 204", async () => {
    const res = await request(app).put("/").send({ items: [] });
    expect(res.statusCode).toEqual(204);
  });

  it("removes all items from the basket", async () => {
    await addItems([
      "01e9f083-1c18-4769-a6ce-d2c75e68e0f1",
      "ec663273-9dff-461d-bbe1-dfbe2c7f3d51",
    ]);
    await request(app).put("/").send({ items: [] });

    const basket = await getAllItems();
    expect(basket).toEqual([]);
  });
});

describe("GET /", () => {
  beforeEach(clearItems);

  it("returns 200", async () => {
    const res = await request(app).get("/");
    expect(res.statusCode).toEqual(200);
  });

  it("returns an empty array with an empty basket", async () => {
    const res = await request(app).get("/");
    expect(res.body).toEqual([]);
  });

  it("returns all the basket items in the basket", async () => {
    const basketItems = await addItems([
      "01e9f083-1c18-4769-a6ce-d2c75e68e0f1",
      "ec663273-9dff-461d-bbe1-dfbe2c7f3d51",
    ]);
    const result = await request(app).get("/");
    expect(result.body.map((basketItem) => basketItem.id)).toEqual(
      basketItems.map((basketItem) => basketItem.id)
    );
  });

  it("returns the information about each item in the basket", async () => {
    await addItems([
      "01e9f083-1c18-4769-a6ce-d2c75e68e0f1",
      "ec663273-9dff-461d-bbe1-dfbe2c7f3d51",
    ]);
    const result = await request(app).get("/");
    expect(result.body.map((basketItem) => basketItem.item.title)).toEqual(
      // item titles are hardcoded in the store
      ["aaa", "jjj"]
    );
  });
});
