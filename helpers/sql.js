const { BadRequestError } = require("../expressError");

// THIS NEEDS SOME GREAT DOCUMENTATION.
/**
* This function updates the data of a user or a company partially
*   dataToUpdate: Receive the data that will be updated
*     Data can include:
*       for users: { firstName, lastName, password, email }
*       for companies: {name, description, numEmployees, logoUrl}
*   jsToSql: Receive an object with the columns reassigning the name used in JS to the name used in the SQL tables
*/ 
function sqlForPartialUpdate(dataToUpdate, jsToSql) {
  // Returns an array with the string properties (column names) of the received object with the data to be updated
  const keys = Object.keys(dataToUpdate);
  // If it does not receive any data to be updated, it returns an error of "No data" received
  if (keys.length === 0) throw new BadRequestError("No data");

  // Creates a new array with the names of the columns already saved and checks them with the "jsToSql" object for a possible change in the column name.
  // The created array contains the name of the column and the variable assigned to be parsed by SQL when it is executed.
  // {firstName: 'Aliya', age: 32} => ['"first_name"=$1', '"age"=$2']
  const cols = keys.map((colName, idx) =>
      // Check if the name of the column is in the "jsToSql" object to make the change in the column name
      // if not it keeps the same column name
      `"${jsToSql[colName] || colName}"=$${idx + 1}`,
  );

  // Returns an object with the columns/variables for SQL and the values that will be updated
  return {
    setCols: cols.join(", "),
    values: Object.values(dataToUpdate),
  };
}

module.exports = { sqlForPartialUpdate };
