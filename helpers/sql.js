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


/**
* Function to filter the results of the companies
*   { name, minEmployees, maxEmployees }
*   can receive at least 1 or all filters
*/
function findCompanyFilterSQL(companiesFilters){
  let filterSQL = [];
  let idx = 0;
  let { nameLike, minEmployees, maxEmployees } = companiesFilters;

  // If it does not receive any filter it shows an error
  if(!nameLike && !minEmployees && !maxEmployees){
    throw new BadRequestError("You must indicate at least one filter");
  }

  // Check that the received filters are allowed fields to filter the results
  const allowKeys = ["nameLike", "minEmployees", "maxEmployees"];
  for(let key of Object.keys(companiesFilters)){
    if(!allowKeys.includes(key)) throw new BadRequestError(`'${key}' is not allowed for filtering`);
  }

  // Verify that the value of 'minEmployees' is less than that 'maxEmployees' otherwise it shows an error
  if(minEmployees && maxEmployees){
    if (minEmployees >= maxEmployees) throw new BadRequestError("The 'minEmployees' must be less than 'maxEmployees'");
  }
  
  // If filter 'name' is received, SQL for filtering is added to the 'filterSQL' array
  if(nameLike){
    idx++;
    companiesFilters.nameLike = `%${ companiesFilters.nameLike }%`;
    filterSQL.push(`name ILIKE $${idx}`);
  }
  // If filter 'minEmployees' is received, SQL for filtering is added to the 'filterSQL' array
  if(minEmployees){
    idx++;
    filterSQL.push(`num_employees >= $${idx}`);
  }
  // If filter 'maxEmployees' is received, SQL for filtering is added to the 'filterSQL' array
  if(maxEmployees){
    idx++;
    filterSQL.push(`num_employees <= $${idx}`);
  }

  /**
  *   Returns an object with the final SQL for filtering the results
  *     whereCols: includes the columns that will be filtered and the variable that will be used by pg
  *     values: includes the values for each columns
  *     Example:
  *       {
  *         whereCols: 'WHERE name ILIKE $1 AND num_employees >= $2 AND num_employees <= $3',
  *         values: ['find name', 100, 500]
  *       }
  */
  return {
    whereCols: `WHERE ${filterSQL.join(" AND ")}`,
    values: Object.values(companiesFilters)
  };
}

/**
* Function to filter the results of the jobs (same like a 'findCompanyFilterSQL' function)
*   { titleLike, minSalary, hasEquity }
*   can receive at least 1 or all filters
*/
function findJobsFilterSQL(jobsFilters){
  let filterSQL = [];
  let idx = 0;
  
  // Check if filter 'hasEquity' is received
  if(jobsFilters.hasOwnProperty('hasEquity')){
    // Check if the values is "true" or "false", if not shows an error
    if(jobsFilters.hasEquity !== true && jobsFilters.hasEquity !== false){
      throw new BadRequestError("The 'hasEquity' must be 'true' or 'false'");
    }else{
      // if value is "true" update value to "0" else delete the property of the object to no create a filter for this
      if(jobsFilters.hasEquity == true){
        jobsFilters.hasEquity = 0;
      }else{
        delete jobsFilters.hasEquity;
      }
    }
  }
  let { titleLike, minSalary, hasEquity } = jobsFilters;

  // If it does not receive any filter it shows an error
  if(!titleLike && !minSalary && !hasEquity){
    throw new BadRequestError("You must indicate at least one filter");
  }

  // Check that the received filters are allowed fields to filter the results
  const allowKeys = ["titleLike", "minSalary", "hasEquity"];
  for(let key of Object.keys(jobsFilters)){
    if(!allowKeys.includes(key)) throw new BadRequestError(`'${key}' is not allowed for filtering`);
  }

  // If filter 'title' is received, SQL for filtering is added to the 'filterSQL' array
  if(titleLike){
    idx++;
    jobsFilters.titleLike = `%${ jobsFilters.titleLike }%`;
    filterSQL.push(`title ILIKE $${idx}`);
  }
  // If filter 'minSalary' is received, SQL for filtering is added to the 'filterSQL' array
  if(minSalary){
    if(minSalary < 0){
      throw new BadRequestError("The 'minSalary' must be greater than '0'");
    }

    idx++;
    filterSQL.push(`salary >= $${idx}`);
  }
  // If filter 'hasEquity' is received, SQL for filtering is added to the 'filterSQL' array
  if(hasEquity == 0){
    idx++;
    filterSQL.push(`equity != $${idx}`);
  }

  /**
  *   Returns an object with the final SQL for filtering the results
  *     whereCols: includes the columns that will be filtered and the variable that will be used by pg
  *     values: includes the values for each columns
  *     Example:
  *       {
  *         whereCols: 'WHERE title ILIKE $1 AND salary >= $2 AND equity != $3',
  *         values: ['find title', 100000, 0]
  *       }
  */
  return {
    whereCols: `WHERE ${filterSQL.join(" AND ")}`,
    values: Object.values(jobsFilters)
  };
}

module.exports = { sqlForPartialUpdate, findCompanyFilterSQL, findJobsFilterSQL };
