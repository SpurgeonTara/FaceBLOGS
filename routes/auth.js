const router = require("express").Router();
const { body } = require("express-validator");

const authController = require("../controllers/auth");

const User = require("../models/user");

const isAuth = require("../middlewares/is-Auth");

router.get("/signup", authController.getSignup);

router.post(
  "/signup",
  [
    body("userName")
      .trim()
      .custom((val, { req }) => {
        return User.findOne({
          userName: val,
        }).then((userData) => {
          if (userData) {
            return Promise.reject("User Name already Taken!!");
          } else {
            const allSmallalphadigits = /^([a-z0-9]+)$/g.test(val);
            if (!allSmallalphadigits) {
              return Promise.reject(
                "Username should be combo of small letters and numbers without spaces. eg: johndoe77."
              );
            }
          }
          if (val === "") {
            return Promise.reject("UserName should Not be empty");
          }
        });
      }),
    body("email")
      .trim()
      .isEmail()
      .withMessage("Please Enter Proper Email")

      .custom((val, { req }) => {
        return User.findOne({ email: val }).then((userData) => {
          if (userData) {
            return Promise.reject("Email already Exists!!");
          }
          const domainList = [
            "gmail.com",
            "yahoo.com",
            "outlook.com",
            "bulldogs.mgccc.edu",
          ];
          const domain = val.split("@")[1];
          if (!domainList.includes(domain)) {
            return Promise.reject("The domain is not Accepptable");
          }
          if (val === "") {
            return Promise.reject("Email should Not be empty");
          }
        });
      }),
    body("password", "Password Has to be Valid")
      .trim()
      .isLength({ min: 5 })
      .custom((val, req) => {
        const patterns = {
          special: /[@_#$]/g,
          digit: /[0-9]/g,
          small: /[a-z]/g,
          capital: /[A-Z]/g,
        };
        if (val === "") {
          throw new Error("Password should Not be empty");
        }
        if (!patterns.small.test(val)) {
          throw new Error("Password Doesn't Contain atleast one small letter");
        }
        if (!patterns.capital.test(val)) {
          throw new Error(
            "Password Doesn't Contain atleast one capital letter"
          );
        }
        if (!patterns.digit.test(val)) {
          throw new Error("Password Doesn't Contain atleast one digit");
        }
        if (!patterns.special.test(val)) {
          throw new Error(
            "Password Doesn't Contain Atleast One Special(@,_,$,#) Character"
          );
        }
        return true;
      }),
    body("confirmPassword")
      .trim()
      .custom((val, { req }) => {
        if (val === "") {
          throw new Error("Confirm Password should Not be empty");
        }
        if (val !== req.body.password) {
          throw new Error("Passwords have to match!");
        }
        return true;
      }),
    body("firstName").custom((val) => {
      if (val === "") {
        throw new Error("firstName should Not be empty");
      } else {
        return true;
      }
    }),
    body("lastName").custom((val) => {
      if (val === "") {
        throw new Error("lastName should Not be empty");
      } else {
        return true;
      }
    }),
    body("occupation").custom((val) => {
      if (val === "") {
        throw new Error("Occupation should Not be empty");
      } else {
        return true;
      }
    }),
  ],
  authController.postSignup
);

router.get(
  "/login",

  authController.getLogin
);

router.get("/confirm/:userId/:token", authController.confirmEmail);

router.get("/send/confirmation/:email", authController.sendConfirmMail);

router.post(
  "/login",
  body("email")
    .trim()
    .isEmail()
    .withMessage("Please Enter Proper Email")
    .custom((val, { req }) => {
      return User.findOne({ email: val }).then((user) => {
        if (!user) {
          return Promise.reject("Credentials Doesnt Match");
        }
        const domainList = [
          "gmail.com",
          "yahoo.com",
          "outlook.com",
          "bulldogs.mgccc.edu",
        ];
        const domain = val.split("@")[1];
        if (!domainList.includes(domain)) {
          return Promise.reject("Credentials Doesnt Match");
        }
      });
    }),
  authController.postLogin
);

router.post("/logout", isAuth, authController.postLogout);

router.post(
  "/follow/user/:userId/post/:postId",
  isAuth,
  authController.postAddFollower
);

router.post(
  "/unfollow/user/:userId/",
  isAuth,
  authController.postRemoveFollower
);

router.post(
  "/savedList/save/post/:postId",
  isAuth,
  authController.postReadingList
);

router.post(
  "/savedList/remove/post/:postId",
  isAuth,
  authController.deleteReadingList
);

router.get("/readingList", isAuth, authController.getReadingList);

module.exports = router;
