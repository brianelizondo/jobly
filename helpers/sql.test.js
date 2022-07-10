const { BadRequestError } = require("../expressError");
const { sqlForPartialUpdate, findCompanyFilterSQL } = require("./sql");

describe("Function to SQL partial update", function () {
    let userTest = {
        firstName: "first name updated", 
        lastName: "last name updated",  
        email: "email@updated.com"
    }
    
    let usersColumns = {
        firstName: "first_name",
        lastName: "last_name",
        isAdmin: "is_admin",
    };
    
    test("works: update without columns in jsToSql object", function () {
        let response = sqlForPartialUpdate({ email: userTest.email }, usersColumns);
        expect(response).toEqual({
            setCols: '"email"=$1',
            values: [userTest.email]
        });
    });

    test("works: update with one column in jsToSql object and one not", function () {
        let response = sqlForPartialUpdate({ firstName: userTest.firstName, email: userTest.email }, usersColumns);
        expect(response).toEqual({
            setCols: '"first_name"=$1, "email"=$2',
            values: [userTest.firstName, userTest.email]
        });
    });

    test("works: update with both columns in jsToSql object", function () {
        let response = sqlForPartialUpdate({ firstName: userTest.firstName, lastName: userTest.lastName }, usersColumns);
        expect(response).toEqual({
            setCols: '"first_name"=$1, "last_name"=$2',
            values: [userTest.firstName, userTest.lastName]
        });
    });

    test("works: update with both columns in jsToSql object", function () {
        let response = sqlForPartialUpdate({ firstName: userTest.firstName, lastName: userTest.lastName }, usersColumns);
        expect(response).toEqual({
            setCols: '"first_name"=$1, "last_name"=$2',
            values: [userTest.firstName, userTest.lastName]
        });
    });

    test("bad request error for no data received", async function () {
        try {
            sqlForPartialUpdate({ }, usersColumns);
            fail();
        } catch (err) {
            expect(err instanceof BadRequestError).toBeTruthy();
        }
    });
});

describe("Function to filter the results of the companies", function () {
    let filters = {
        nameLike: "test", 
        minEmployees: 10,  
        maxEmployees: 100
    }
    let filtersSQL = {
        nameLike: `name ILIKE`, 
        minEmployees: `num_employees >=`,  
        maxEmployees: `num_employees <=`
    }

    test("works: filter with all filters received", function () {
        let response = findCompanyFilterSQL(filters);
        expect(response).toEqual({
            whereCols: `WHERE ${filtersSQL.nameLike} $1 AND ${filtersSQL.minEmployees} $2 AND ${filtersSQL.maxEmployees} $3`,
            values: [filters.nameLike, filters.minEmployees, filters.maxEmployees]
        });
    });
    
    test("works: filter with one filter received", function () {
        let response = findCompanyFilterSQL({ minEmployees: filters.minEmployees });
        expect(response).toEqual({
            whereCols: `WHERE ${filtersSQL.minEmployees} $1`,
            values: [filters.minEmployees]
        });
    });

    test("bad request error for contain inappropriate filtering fields", function () {
        try {
            findCompanyFilterSQL({ description: "test" });
            fail();
        } catch (err) {
            expect(err instanceof BadRequestError).toBeTruthy();
        }
    });

    test("bad request error for 'minEmployees' greater than 'maxEmployees'", function () {
        try {
            findCompanyFilterSQL({ minEmployees: 100, maxEmployees: 50 });
            fail();
        } catch (err) {
            expect(err instanceof BadRequestError).toBeTruthy();
        }
    });

    test("bad request error for no data received", function () {
        try {
            findCompanyFilterSQL({ });
            fail();
        } catch (err) {
            expect(err instanceof BadRequestError).toBeTruthy();
        }
    });
});