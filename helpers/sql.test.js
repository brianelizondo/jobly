const { BadRequestError } = require("../expressError");
const { sqlForPartialUpdate } = require("./sql");

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

describe("Function to SQL partial update", function () {
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
