const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcrypt");
var jwt = require("jsonwebtoken");
const fetchuser=require('../middleware/fetchuser')

JWT_SECRET = "29@January";
//ROUTE 1 :Create a user using POST "/api/auth/createuser".  No login required
router.post(
  "/createuser",
  [
    body("name").isLength({ min: 3 }),
    body("email").isEmail(),
    body("password").isLength({ min: 5 }), //Validation the data to be entered in db with help of express validator package
  ],
  async (req, res) => {
    //if there are error return bad request and error
    let success=false;
    const error = validationResult(req);
    if (!error.isEmpty()) {
      console.log(" error is empty");
      return res.status(400).json({ success,errors: error.array() }); //show any error while inserting data into db
    }

    try {
      console.log(" in try");
      const salt = await bcrypt.genSalt(10);
      secPass = await bcrypt.hash(req.body.password[0], salt);
      console.log("Sec pass",secPass)
      const user = await User.create({
        name: req.body.name[0],
        email: req.body.email[0],
        password: secPass,
      });
      const data = {
        user: {
          id: user.id,
        },
      };
      const authtoken = jwt.sign(data, JWT_SECRET);
      success=true;
      // res.json (user);
      res.json({ success, authtoken });
    } catch (error) {
      console.log(error);
      if (error.code === 11000) {
        //if user with same email address exist in db express-validator automatically returns error
        // Duplicate key error
        return res.status(400).json({ success,error: "Email already exists" });
      }
    }
  }
);

//ROUTE 2 :Authentication of user using POST "/api/auth/createuser".  No login required
router.post(
  "/login",
  [
    body("email").isEmail(),
    body("password", "Cannot be blank").exists(), //Validation the data to be entered in db with help of express validator package
  ],
  async (req, res) => {
    let success=false;
    const error = validationResult(req);
    if (!error.isEmpty()) {
      console.log(" error");
      return res.status(400).json({ success,errors: error.array() }); //show any error while inserting data into db
    }

    const { email, password } = req.body;
    try {
      let user = await User.findOne({ email });
      if (!user) {
      return res.status(400).json({success,error:"please login with correct credentials"});
      }

      const passwordCompare = await bcrypt.compare(password, user.password);
      if (!passwordCompare) {
        return res.status(400).json({success,error:"please login with correct credentials"});
      }

      const data = {
        user: {
          id: user.id,
        },
      };
      const authtoken = jwt.sign(data, JWT_SECRET);
      success=true;
      res.send({success, authtoken });
    } catch (error) {
      console.log(error.message);
      success=false;
      return res.status(500).send({success,error:"Error occured"});
    }
  }
);

//ROUTE 3 :Get logged in user details POST "/api/auth/getuser". login required
router.post(
  "/getuser" ,fetchuser,  async (req, res) => {
    try {
      userId = req.user.id;
      const user = await User.findById(userId).select("-password");
      res.send(user);
    } catch (error) {
      console.log(error.message);
      return res.status(500).send("Error occured");
    }
  }
);
module.exports = router;
