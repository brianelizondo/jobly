"use strict";

/** Routes for users. */

const jsonschema = require("jsonschema");

const express = require("express");
const generatorPassword = require("generate-password");
const { ensureLoggedIn, ensureCorrectUser } = require("../middleware/auth");
const { BadRequestError } = require("../expressError");
const User = require("../models/user");
const { createToken } = require("../helpers/tokens");
const userNewSchema = require("../schemas/userNew.json");
const userUpdateSchema = require("../schemas/userUpdate.json");
const jobApplicationNew = require("../schemas/jobApplicationNew.json");

const router = express.Router();


/** POST / { user }  => { user, token }
 *
 * Adds a new user. This is not the registration endpoint --- instead, this is
 * only for admin users to add new users. The new user being added can be an
 * admin.
 *
 * This returns the newly created user and an authentication token for them:
 *  {user: { username, firstName, lastName, email, isAdmin }, token }
 *
 * Authorization required: login
 **/
router.post("/", ensureLoggedIn, async function (req, res, next) {
  try {
    if(!req.body.password || req.body.password === ""){
      req.body.password = generatorPassword.generate({
        length: 10,
        numbers: true
      });
    }
    const validator = jsonschema.validate(req.body, userNewSchema);
    if (!validator.valid) {
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    }

    const user = await User.register({ ...req.body, isAdmin: false });
    const token = createToken(user);
    return res.status(201).json({ user, token });
  } catch (err) {
    return next(err);
  }
});


/** GET / => { users: [ {username, firstName, lastName, email }, ... ] }
 *
 * Returns list of all users.
 *
 * Authorization required: login
 **/
router.get("/", ensureLoggedIn, async function (req, res, next) {
  try {
    const users = await User.findAll();
    return res.json({ users });
  } catch (err) {
    return next(err);
  }
});


/** GET /[username] => { user }
 *
 * Returns { username, firstName, lastName, isAdmin }
 *
 * Authorization required: login and correct user
 **/
router.get("/:username", ensureCorrectUser, async function (req, res, next) {
  try {
    const user = await User.get(req.params.username);
    return res.json({ user });
  } catch (err) {
    return next(err);
  }
});


/** PATCH /[username] { user } => { user }
*
* Data can include:
*   { firstName, lastName, password, email }
*
* Returns { username, firstName, lastName, email, isAdmin }
*
* Authorization required: login and correct user
**/
router.patch("/:username", ensureCorrectUser, async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, userUpdateSchema);
    if (!validator.valid) {
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    }

    const user = await User.update(req.params.username, req.body);
    return res.json({ user });
  } catch (err) {
    return next(err);
  }
});


/** POST /users/[username]/jobs/[id]  => { user, token }
*
* Adds applications to a job. 
*   Only for admin users to add users applications or the user can apply by self.
*
* This returns JSON like:
*  { applied: jobId }
*
* Authorization required: login and correct user
**/
 router.post("/:username/jobs/:id", ensureCorrectUser, async function (req, res, next) {
  try {
    const applicationData = {
      username: req.params.username,
      jobId: parseInt(req.params.id)
    }
    const validator = jsonschema.validate(applicationData, jobApplicationNew);
    if (!validator.valid) {
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    }

    const jobApp = await User.applyJob(applicationData.username, applicationData.jobId);
    return res.json({ applied: jobApp.job_id });
  } catch (err) {
    return next(err);
  }
});


/** DELETE /[username]  =>  { deleted: username }
*
* Authorization required: login
**/
router.delete("/:username", ensureCorrectUser, async function (req, res, next) {
  try {
    await User.remove(req.params.username);
    return res.json({ deleted: req.params.username });
  } catch (err) {
    return next(err);
  }
});


module.exports = router;
