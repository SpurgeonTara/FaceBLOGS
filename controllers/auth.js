const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const mongoose = require("mongoose");
const AWS = require("aws-sdk");
const { v4: uuidv4 } = require("uuid");

const { validationResult } = require("express-validator");

const isUserUnique = require("../util/isUserUnique");
const sendMail = require("../util/sendMail");
const User = require("../models/user");
const Post = require("../models/post");

exports.getSignup = (req, res, next) => {
  res.status(200).render("auth/signup", {
    pageTitle: "Sign Up",
    errorDetails: null,
    oldDetails: null,
    isAuthenticated: false,
  });
};

exports.postSignup = (req, res, next) => {
  const {
    email,
    password,
    confirmPassword,
    userName,
    firstName,
    lastName,
    occupation,
  } = req.body;

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    console.log(errors);
    return res.status(404).render("auth/signup", {
      pageTitle: "SignUp",
      errorDetails: errors.array(),
      oldDetails: req.body,
      isAuthenticated: false,
    });
  }

  let imageUrl;

  let user;

  bcrypt.hash(password, 12).then((hashedPassword) => {
    if (req.file) {
      // const s3 = new AWS.S3({
      //   accessKeyId: process.env.AWS_ACCESS_KEY,
      //   secretAccessKey: process.env.AWS_SECRET,
      // });

      // const fileType =
      //   req.file.originalname.split(".")[
      //     req.file.originalname.split(".").length - 1
      //   ];

      // const params = {
      //   Bucket: process.env.AWS_BUCKET_NAME,
      //   Key: `${uuidv4()}.${fileType}`,
      //   Body: req.file.buffer,
      // };

      // s3.upload(params, (err, data) => {
      //   if (err) {
      //     if (!err.statusCode) {
      //       err.statusCode = 500;
      //     }
      //     next(err);
      //   }
      //   console.log(data);

      // });
      // imageUrl = `/img/${data.Key}`;
      imageUrl = req.file.path;
      user = new User({
        email,
        password: hashedPassword,
        userName: userName.toLowerCase(),
        firstName,
        lastName,
        imageUrl: imageUrl,
        occupation,
      });
      user
        .save()
        .then((user) => {
          res.redirect(`/auth/send/confirmation/${user.email}`);
        })
        .catch((err) => {
          if (!err.statusCode) {
            err.statusCode = 500;
          }
          next(err);
        });
    } else {
      user = new User({
        email,
        password: hashedPassword,
        userName: userName.toLowerCase(),
        firstName,
        lastName,
        occupation,
      });
      user
        .save()
        .then((user) => {
          res.redirect(`/auth/send/confirmation/${user.email}`);
        })
        .catch((err) => {
          if (!err.statusCode) {
            err.statusCode = 500;
          }
          next(err);
        });
    }
  });
};

exports.sendConfirmMail = async (req, res, next) => {
  try {
    const email = req.params.email;
    const user = await User.findOne({ email: email });
    if (!user) {
      const err = new Error("No Email Found!");
      err.statusCode = 404;
      throw err;
    }
    if (user.confirmed) {
      res.status(422).render("auth/login", {
        message: "user confirmed already..!!",
        pageTitle: "Login",
        errorDetails: [
          {
            value: null,
            msg: "Your Account is already Confirmed!. Please Login",
            param: "email",
            location: "body",
          },
        ],
        isAuthenticated: false,
      });
    }
    crypto.randomBytes(32, (err, buffer) => {
      if (err) {
        console.log(err);
        throw err;
      }
      const token = buffer.toString("hex");
      user.confirmToken = token;
      user.confirmTokenExpiration = Date.now() + 360000;
      user
        .save()
        .then((user) => {
          const mailSubject = "Mail Confirmation";
          const mailContent = `
              <p>You Signed Up Successfully, Please </p>
              <p>Click this <a href="${process.env.HOST}/auth/confirm/${user._id}/${token}">LINK</a> to confirm Your Account</p>
            `;
          console.log(mailContent);
          sendMail(user.email, mailSubject, mailContent);
          res.status(201).render("confirmation/status", {
            email: user.email,
            pageTitle: "Pending Confirmation",
            header: "Mail Sent, Please Confirm and Login",
            content:
              "Please Check Your Email Address. A Confirmation email has been sent to " +
              user.email,
            isAuthenticated: false,
          });
        })
        .catch((err) => {
          if (!err.statusCode) {
            err.statusCode = 500;
          }
          console.log(err);
          next(err);
        });
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    console.log(err);
    next(err);
  }
};

exports.confirmEmail = async (req, res, next) => {
  const confirmToken = req.params.token;
  const userId = req.params.userId;

  try {
    const user = await User.findOne({
      confirmToken: confirmToken,
      confirmTokenExpiration: { $gt: Date.now() },
      _id: userId,
    });

    if (!user) {
      const error = new Error("No Error Found!!");
      throw error;
    }
    console.log("user", req.user);
    user.confirmedUser = true;
    user.confirmToken = undefined;
    user.confirmTokenExpiration = undefined;
    await user.save();
    res.status(200).render("confirmation/status", {
      pageTitle: "Confirmed Successfully",
      header: "Confirmation Successfull",
      content: "Please Login",
      isAuthenticated: req.session.isLoggedIn,
      profilePicUrl: user.imageUrl,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    console.log(err);
    next(err);
  }
};

exports.getLogin = (req, res, next) => {
  res.status(200).render("auth/login.ejs", {
    pageTitle: "Login",
    errorDetails: null,
    oldDetails: null,
    isAuthenticated: false,
  });
};

exports.postLogin = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(404).render("auth/login", {
      pageTitle: "Login",
      errorDetails: errors.array(),
      oldDetails: req.body,
      isAuthenticated: false,
    });
  }
  User.findOne({ email: req.body.email })
    .then((user) => {
      bcrypt
        .compare(req.body.password, user.password)
        .then((doMatch) => {
          if (doMatch) {
            req.session.isLoggedIn = true;
            req.session.user = user;
            return req.session.save((err) => {
              res.redirect("/blog");
            });
          }
          return res.status(422).render("auth/login", {
            pageTitle: "Login",
            errorDetails: [
              {
                value: null,
                msg: "Credentials Donot Match!",
                param: "",
                location: "body",
              },
            ],
            oldDetails: null,
            isAuthenticated: false,
          });
        })
        .catch((err) => {
          console.log(err);
          res.redirect("/login");
        });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postAddFollower = (req, res, next) => {
  const followerId = req.params.userId;
  const postId = req.params.postId;
  User.findOne({ _id: req.user._id })
    .then((user) => {
      if (!user) {
        const err = new Error("User Doesnt Exists!");
        err.statusCode = 500;
        throw err;
      }
      if (
        !user.following.includes(mongoose.Types.ObjectId(followerId)) &&
        req.user._id !== followerId
      ) {
        user.following.push(followerId.toString());
        user
          .save()
          .then((user) => {
            User.findOne({ _id: followerId })
              .then((followee) => {
                if (!followee.followers.includes(req.user._id)) {
                  followee.followers.push(req.user._id.toString());
                  return followee.save();
                }
              })
              .then((followee) => {
                res.status(201).redirect("/blog/post/" + postId);
              })
              .catch((err) => {
                console.log(err);
                if (!err.statusCode) {
                  err.statusCode = 500;
                }
                next(err);
              });
          })
          .catch((err) => {
            console.log(err);
            if (!err.statusCode) {
              err.statusCode = 500;
            }
            next(err);
          });
      } else {
        if (req.user._id === followerId) {
          const error = new Error("Cannot Follow Yourself. Try Other Person!");
          error.statusCode = 422;
          throw error;
        }
        const err = new Error("Follower already Exists!");
        err.statusCode = 404;
        throw err;
      }
    })
    .catch((err) => {
      console.log(err);
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.postRemoveFollower = (req, res, next) => {
  const followerId = req.params.userId;
  const postId = req.params.postId;
  User.findOne({ _id: req.user._id })
    .then((user) => {
      if (!user) {
        const err = new Error("User Doesnt Exists!!");
        err.statusCode = 500;
        throw err;
      }
      if (user.following.includes(mongoose.Types.ObjectId(followerId))) {
        user.following.pull(followerId);
        user
          .save()
          .then((user) => {
            User.findOne({ _id: followerId })
              .then((followee) => {
                if (followee.followers.includes(req.user._id.toString())) {
                  followee.followers.pull(req.user._id);
                  return followee.save();
                }
              })
              .then((followee) => {
                res.status(201).redirect("/blog/post/" + postId);
              })
              .catch((err) => {
                console.log(err);
                if (!err.statusCode) {
                  err.statusCode = 500;
                }
                next(err);
              });
          })
          .catch((err) => {
            console.log(err);
            if (!err.statusCode) {
              err.statusCode = 500;
            }
            next(err);
          });
      } else {
        const err = new Error("Follower doesn't Exists!");
        err.statusCode = 404;
        throw err;
      }
    })
    .catch((err) => {
      console.log(err);
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.getReadingList = (req, res, next) => {
  User.findById(req.user._id)
    .populate("readingList")
    .then((user) => {
      if (!user) {
        const err = new Error("User Doesnt Exists!");
        err.statusCode = 404;
        throw err;
      }
      if (user.readingList.length > 0) {
        res.status(200).json({
          count: user.readingList.length,
          readingList: user.readingList,
        });
      } else {
        res.json({
          message: "Thisn user doesnt have any posts in ReadingList",
          count: 0,
          readingList: [],
        });
      }
    })
    .catch((err) => {
      console.log(err);
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.postReadingList = (req, res, next) => {
  const postId = req.params.postId;
  User.findById(req.user._id)
    .then((user) => {
      if (!user) {
        const err = new Error("User Not Found!!");
        err.statusCode = 404;
        throw err;
      }
      Post.findById(postId)
        .then((post) => {
          if (post.creator.toString() === req.user._id) {
            const err = new Error(
              "Cant add to readinglist since the post was created by you."
            );
            err.statusCode = 422;
            throw err;
          }
          if (!user.readingList.includes(postId)) {
            user.readingList.push(postId);
            user
              .save()
              .then((user) => {
                res.status(201).redirect("/blog/post/" + postId);
              })
              .catch((err) => {
                console.log(err);
                if (!err.statusCode) {
                  err.statusCode = 500;
                }
                next(err);
              });
          } else {
            const err = new Error(
              "Post ALready in Reading List, Try different Post"
            );
            err.statusCode = 422;
            throw err;
          }
        })
        .catch((err) => {
          if (!err.statusCode) {
            err.statusCode = 500;
          }
          next(err);
        });
    })
    .catch((err) => {
      console.log(err);
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.deleteReadingList = (req, res, next) => {
  const postId = req.params.postId;
  User.findById(req.user._id)
    .then((user) => {
      if (!user) {
        const err = new Error("No User Found!!");
        err.statusCode = 404;
        throw err;
      }
      if (user.readingList.includes(postId)) {
        user.readingList.pull(postId);
        user
          .save()
          .then((user) => {
            res.status(201).redirect("/blog/post/" + postId);
          })
          .catch((err) => {
            console.log(err);
            if (!err.statusCode) {
              err.statusCode = 500;
            }
            next(err);
          });
      } else {
        const err = new Error(
          "Reading List Doesnt Includes the post yo are requesting to delete"
        );
        err.statusCode = 404;
        throw err;
      }
    })
    .catch((err) => {
      console.log(err);
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.postLogout = (req, res, next) => {
  req.session.destroy((err) => {
    console.log(err);
    res.redirect("/blog");
  });
};
