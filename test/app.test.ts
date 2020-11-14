import * as request from "supertest";
import app from "../src/app";

describe("the application", () => {
  it("returns 200", async () => {
    const res = await request(app).get("/");
    expect(res.statusCode).toEqual(200);
  });
});
