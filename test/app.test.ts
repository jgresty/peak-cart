import * as request from "supertest";
import * as faker from "faker";

import createApp from "../src/app";
import { addItems, getAllItems, clearItems } from "../src/store";

function fakeAuth(user) {
  return function (app) {
    app.use((req, res, next) => {
      req.user = { sub: user };
      next();
    });
    return app;
  };
}

describe("POST /", () => {
  const user = faker.random.uuid();
  const app = createApp(fakeAuth(user));
  beforeEach(() => clearItems());

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
    const basket = await getAllItems(user);
    const addedItems = basket.map((basketItem) => basketItem.item);
    expect(addedItems).toEqual(items);
  });

  it("does not overwrite basket contents with sucessive calls", async () => {
    const itemsA = ["01e9f083-1c18-4769-a6ce-d2c75e68e0f1"];
    await request(app).post("/").send({ items: itemsA });
    let basket = await getAllItems(user);
    let addedItems = basket.map((basketItem) => basketItem.item);
    expect(addedItems).toEqual(itemsA);

    const itemsB = ["ec663273-9dff-461d-bbe1-dfbe2c7f3d51"];
    await request(app).post("/").send({ items: itemsB });
    basket = await getAllItems(user);
    addedItems = basket.map((basketItem) => basketItem.item);
    expect(addedItems).toEqual([...itemsA, ...itemsB]);
  });

  it("returns basket items for each item added", async () => {
    const items = [
      "01e9f083-1c18-4769-a6ce-d2c75e68e0f1",
      "ec663273-9dff-461d-bbe1-dfbe2c7f3d51",
    ];
    const response = await request(app).post("/").send({ items });
    const basket = await getAllItems(user);
    expect(response.body).toEqual(basket);
  });

  it("returns 400 with a bad body", async () => {
    const response = await request(app).post("/").send({ foo: "bar" });
    expect(response.statusCode).toEqual(400);
  });

  it("does not add item ids which don't correspond to real items", async () => {
    const items = [
      "01e9f083-1c18-4769-a6ce-d2c75e68e0f1",
      "00000000-0000-0000-0000-000000000000",
    ];
    await request(app).post("/").send({ items });
    const basket = await getAllItems(user);
    const addedItems = basket.map((basketItem) => basketItem.item);
    expect(addedItems).toEqual([items[0]]);
  });
});

describe("DELETE /:id", () => {
  const user = faker.random.uuid();
  const app = createApp(fakeAuth(user));
  beforeEach(() => clearItems());

  it("returns 204", async () => {
    const basketItems = await addItems(user, [
      "01e9f083-1c18-4769-a6ce-d2c75e68e0f1",
    ]);
    const res = await request(app).delete(`/${basketItems[0].id}`);
    expect(res.statusCode).toEqual(204);
  });

  it("removes an item from the basket", async () => {
    const basketItems = await addItems(user, [
      "01e9f083-1c18-4769-a6ce-d2c75e68e0f1",
    ]);
    await request(app).delete(`/${basketItems[0].id}`);

    const basket = await getAllItems(user);
    expect(basket).toEqual([]);
  });

  it("only removes the specified item from the basket", async () => {
    const basketItems = await addItems(user, [
      "01e9f083-1c18-4769-a6ce-d2c75e68e0f1",
      "ec663273-9dff-461d-bbe1-dfbe2c7f3d51",
    ]);
    await request(app).delete(`/${basketItems[0].id}`);

    const basket = await getAllItems(user);
    expect(basket[0]).toEqual(basketItems[1]);
  });

  it("returns 400 with an invalid uuid", async () => {
    const res = await request(app).delete("/asdf");
    expect(res.statusCode).toEqual(400);
  });
});

describe("PUT /", () => {
  const user = faker.random.uuid();
  const app = createApp(fakeAuth(user));
  beforeEach(() => clearItems());

  it("returns 204", async () => {
    const res = await request(app).put("/").send({ items: [] });
    expect(res.statusCode).toEqual(204);
  });

  it("removes all items from the basket", async () => {
    await addItems(user, [
      "01e9f083-1c18-4769-a6ce-d2c75e68e0f1",
      "ec663273-9dff-461d-bbe1-dfbe2c7f3d51",
    ]);
    await request(app).put("/").send({ items: [] });

    const basket = await getAllItems(user);
    expect(basket).toEqual([]);
  });

  it("returns 400 if items are provided in the body", async () => {
    // We only implement clearing the basket, not setting it to arbitrary things like a normal PUT would do
    const res = await request(app)
      .put("/")
      .send({ items: ["asdf"] });
    expect(res.statusCode).toEqual(400);
  });
});

describe("GET /", () => {
  const user = faker.random.uuid();
  const app = createApp(fakeAuth(user));
  beforeEach(() => clearItems());

  it("returns 200", async () => {
    const res = await request(app).get("/");
    expect(res.statusCode).toEqual(200);
  });

  it("returns an empty array with an empty basket", async () => {
    const res = await request(app).get("/");
    expect(res.body).toEqual([]);
  });

  it("returns all the basket items in the basket", async () => {
    const basketItems = await addItems(user, [
      "01e9f083-1c18-4769-a6ce-d2c75e68e0f1",
      "ec663273-9dff-461d-bbe1-dfbe2c7f3d51",
    ]);
    const result = await request(app).get("/");
    expect(result.body.map((basketItem) => basketItem.id)).toEqual(
      basketItems.map((basketItem) => basketItem.id)
    );
  });

  it("returns the information about each item in the basket", async () => {
    await addItems(user, [
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

describe("Multiple users", () => {
  beforeEach(() => clearItems());

  it("only adds items to the basket of the currently logged in user", async () => {
    const user = faker.random.uuid();
    const otherUser = faker.random.uuid();
    const app = createApp(fakeAuth(user));

    const items = [
      "01e9f083-1c18-4769-a6ce-d2c75e68e0f1",
      "ec663273-9dff-461d-bbe1-dfbe2c7f3d51",
    ];
    await request(app).post("/").send({ items });
    const otherUserBasket = await getAllItems(otherUser);
    expect(otherUserBasket).toEqual([]);
  });

  it("prevents user from deleting items from other users baskets", async () => {
    const user = faker.random.uuid();
    const otherUser = faker.random.uuid();
    const app = createApp(fakeAuth(otherUser));

    const basketItems = await addItems(user, [
      "01e9f083-1c18-4769-a6ce-d2c75e68e0f1",
    ]);
    await request(app).delete(`/${basketItems[0].id}`);

    const basket = await getAllItems(user);
    expect(basket[0].item).toEqual("01e9f083-1c18-4769-a6ce-d2c75e68e0f1");
  });

  it("only clears the basket of the current user", async () => {
    const user = faker.random.uuid();
    const otherUser = faker.random.uuid();
    const app = createApp(fakeAuth(otherUser));
    const items = [
      "01e9f083-1c18-4769-a6ce-d2c75e68e0f1",
      "ec663273-9dff-461d-bbe1-dfbe2c7f3d51",
    ];

    await addItems(user, items);
    await request(app).put("/").send({ items: [] });

    const basket = await getAllItems(user);
    expect(basket.map((basketItem) => basketItem.item)).toEqual(items);
  });

  it("only shows items in current users basket", async () => {
    const user = faker.random.uuid();
    const otherUser = faker.random.uuid();
    const app = createApp(fakeAuth(otherUser));

    await addItems(user, [
      "01e9f083-1c18-4769-a6ce-d2c75e68e0f1",
      "ec663273-9dff-461d-bbe1-dfbe2c7f3d51",
    ]);
    const result = await request(app).get("/");
    expect(result.body).toEqual([]);
  });
});

describe("POST /rpc/delivery", () => {
  const app = createApp();

  it("returns expected value", async () => {
    // This example is taken directly from the requirements
    const body = {
      id: ["Item1", "Item2", "Item3", "Item4", "Item5", "Item6"],
      weight: [1, 8, 7, 4, 3, 2],
      days: [4, 1, 2, 10, 3, 5],
    };
    const result = await request(app).post("/rpc/delivery").send(body);
    const expected = {
      id: ["Item2", "Item1"],
      days: 5,
    };
    expect(result.body).toEqual(expected);
  });
});
