"use strict";

const db = require("../db.js");
const { BadRequestError, NotFoundError } = require("../expressError");
const Job = require("./job.js");
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** create */
describe("create new job", function () {
  const newJob = {
    title: "new",
    salary: 50000,
    equity: "1",
    companyHandle: "c1"
  };

  test("works", async function () {
    let job = await Job.create(newJob);
    expect(job).toEqual({
        id: expect.any(Number),
        ...newJob,
    });
  }); 
});

/************************************** findAll */
describe("findAll jobs", function () {
  test("works: no filter", async function () {
    let jobs = await Job.findAll();
    expect(jobs).toEqual([
      {
        id: expect.any(Number),
        title: "j1",
        salary: 1000,
        equity: "1",
        companyHandle: "c1"
      },
      {
        id: expect.any(Number),
        title: "j2",
        salary: 2000,
        equity: "1",
        companyHandle: "c2"
      },
      {
        id: expect.any(Number),
        title: "j3",
        salary: 3000,
        equity: "1",
        companyHandle: "c3"
      }
    ]);
  });
});

/************************************** get */
describe("get job", function () {
  test("works", async function () {
    const result = await db.query(
        `SELECT 
            id, title, salary, equity, company_handle AS "companyHandle"
        FROM 
            jobs`);
    const jobTest = result.rows[0];

    let job = await Job.get(jobTest.id);
    expect(job).toEqual({
      id: jobTest.id,
      title: jobTest.title,
      salary: jobTest.salary,
      equity: jobTest.equity,
      companyHandle: jobTest.companyHandle
    });
  });

  test("not found if no such job", async function () {
    try {
      await Job.get(1000);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

/************************************** update */
describe("update job", function () {
  const updateData = {
    title: "Update",
    salary: 2500,
    equity: "0.5"
  };

  test("works", async function () {
    const result = await db.query(
      `SELECT 
        id, title, salary, equity, company_handle AS "companyHandle"
      FROM 
        jobs`);
    const jobTest = result.rows[0];

    let job = await Job.update(jobTest.id, updateData);
    expect(job).toEqual({
      id: jobTest.id,
      ...updateData,
      companyHandle: jobTest.companyHandle
    });
  });

  test("works: null fields", async function () {
    const result = await db.query(
      `SELECT 
        id, title, salary, equity, company_handle AS "companyHandle"
      FROM 
        jobs`);
    const jobTest = result.rows[0];
    
    const updateDataSetNulls = {
      title: "Update",
      salary: null,
      equity: null
    };

    let job = await Job.update(jobTest.id, updateDataSetNulls);
    expect(job).toEqual({
      id: jobTest.id,
      ...updateDataSetNulls,
      companyHandle: jobTest.companyHandle
    });
  });

  test("not found if no such job", async function () {
    try {
      await Job.update(1000, updateData);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });

  test("bad request with no data", async function () {
    const result = await db.query(
      `SELECT 
        id, title, salary, equity, company_handle AS "companyHandle"
      FROM 
        jobs`);
    const jobTest = result.rows[0];

    try {
      await Job.update(jobTest.id, {});
      fail();
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});

/************************************** remove */
describe("remove job", function () {
  test("works", async function () {
    const result = await db.query(
      `SELECT 
        id, title, salary, equity, company_handle AS "companyHandle"
      FROM 
        jobs`);
    const jobTest = result.rows[0];
    
    await Job.remove(jobTest.id);
    const res = await db.query(`SELECT id FROM jobs WHERE id=${jobTest.id + 1}`);
    expect(res.rows.length).toEqual(1);
  });

  test("not found if no such job", async function () {
    try {
      await Job.remove(1000);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});
