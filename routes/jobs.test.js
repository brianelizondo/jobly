"use strict";

const request = require("supertest");

const db = require("../db");
const app = require("../app");

const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  u1Token,
  uAdminToken
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

let jobTestValid;

/************************************** POST /jobs */

describe("POST /jobs", function () {
  const newJob = {
    title: "new",
    salary: 1000,
    equity: 1,
    companyHandle: "c1",
  };

  test("ok for admin users", async function () {
    const resp = await request(app)
        .post("/jobs")
        .send(newJob)
        .set("authorization", `Bearer ${uAdminToken}`);
    expect(resp.statusCode).toEqual(201);
    expect(resp.body).toEqual({
      job: {
        id: expect.any(Number),
        title: "new",
        salary: 1000,
        equity: "1",
        companyHandle: "c1",
      }
    });
  });

  test("bad request for regular users", async function () {
    const resp = await request(app)
        .post("/jobs")
        .send(newJob)
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("bad request with missing data", async function () {
    const resp = await request(app)
        .post("/jobs")
        .send({
            salary: 1000,
            equity: 1,
            companyHandle: "c1",
        })
        .set("authorization", `Bearer ${uAdminToken}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("bad request with invalid data", async function () {
    const resp = await request(app)
        .post("/jobs")
        .send({
          ...newJob,
          companyHandle: 1,
        })
        .set("authorization", `Bearer ${uAdminToken}`);
    expect(resp.statusCode).toEqual(400);
  });
});

/************************************** GET /jobs */
describe("GET /jobs", function () {
  test("ok for anon", async function () {
    const resp = await request(app).get("/jobs");
    expect(resp.body).toEqual({
        jobs:
          [
            {
              id: expect.any(Number),
              title: "j1",
              salary: 1000,
              equity: "1",
              companyHandle: "c1",
            },
            {
              id: expect.any(Number),
              title: "j2",
              salary: 2000,
              equity: "1",
              companyHandle: "c2",
            },
            {
              id: expect.any(Number),
              title: "j3",
              salary: 3000,
              equity: "1",
              companyHandle: "c3",
            },
          ],
    });
    jobTestValid = resp.body.jobs[0];
  });
});

/************************************** GET /jobs/:id */

describe("GET /jobs/:id", function () {
  test("works for anon", async function () {
    const resp = await request(app).get(`/jobs/${jobTestValid.id}`);
    expect(resp.body).toEqual({
        job: {
            id: jobTestValid.id,
            title: jobTestValid.title,
            salary: jobTestValid.salary,
            equity: jobTestValid.equity,
            companyHandle: jobTestValid.companyHandle,
        },
    });
  });

  test("not found for no such jobs", async function () {
    const resp = await request(app).get("/jobs/0");
    expect(resp.statusCode).toEqual(404);
  });
});

/************************************** PATCH /jobs/:id */

describe("PATCH /jobs/:id", function () {
  test("works for users", async function () {
    const resp = await request(app)
        .patch(`/jobs/${jobTestValid.id}`)
        .send({
          title: "j1-new",
        })
        .set("authorization", `Bearer ${uAdminToken}`);
    expect(resp.body).toEqual({
      job: {
        id: jobTestValid.id,
        title: "j1-new",
        salary: jobTestValid.salary,
        equity: jobTestValid.equity,
        companyHandle: jobTestValid.companyHandle,
      },
    });
  });

  test("bad request for regular users", async function () {
    const resp = await request(app)
        .patch(`/jobs/${jobTestValid.id}`)
        .send({
          title: "j1-new",
        })
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("unauth for anon", async function () {
    const resp = await request(app)
        .patch(`/jobs/${jobTestValid.id}`)
        .send({
          title: "j1-new",
        });
    expect(resp.statusCode).toEqual(401);
  });

  test("not found on no such job", async function () {
    const resp = await request(app)
        .patch(`/jobs/${jobTestValid.id - 1}`)
        .send({
          name: "new nope",
        })
        .set("authorization", `Bearer ${uAdminToken}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("bad request on invalid data", async function () {
    const resp = await request(app)
        .patch(`/jobs/${jobTestValid.id}`)
        .send({
            title: "j1-new",
            salary: "not-a-number",
        })
        .set("authorization", `Bearer ${uAdminToken}`);
    expect(resp.statusCode).toEqual(400);
  });
});

/************************************** DELETE /jobs/:id */

describe("DELETE /jobs/:id", function () {
  test("works for users", async function () {
    const resp = await request(app)
        .delete(`/jobs/${jobTestValid.id}`)
        .set("authorization", `Bearer ${uAdminToken}`);
    expect(resp.body).toEqual({ deleted: `${jobTestValid.id}` });
  });

  test("bad request for regular users", async function () {
    const resp = await request(app)
        .delete(`/jobs/${jobTestValid.id + 1}`)
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("unauth for anon", async function () {
    const resp = await request(app)
        .delete(`/jobs/${jobTestValid.id + 1}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("not found for no such job", async function () {
    const resp = await request(app)
        .delete("/jobs/0")
        .set("authorization", `Bearer ${uAdminToken}`);
    expect(resp.statusCode).toEqual(404);
  });
});
