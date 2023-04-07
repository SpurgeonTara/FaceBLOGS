require("dotenv").config();
const path = require("path");

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const multer = require("multer");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const crypto = require("crypto");
const AWS = require("aws-sdk");

const User = require("./models/user");
const Post = require("./models/post");

const authRouter = require("./routes/auth");
const blogRouter = require("./routes/blog");

const app = express();
const store = new MongoDBStore({
  uri: process.env.MONGODB_URI,
  collection: "sessions",
});

app.set("view engine", "ejs");
app.set("views", "views");

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images");
  },
  filename: (req, file, cb) => {
    crypto.pseudoRandomBytes(16, function (err, raw) {
      console.log(
        raw.toString("hex") + Date.now() + "." + file.originalname.toLowerCase()
      );
      cb(
        null,
        raw.toString("hex") + Date.now() + "." + file.originalname.toLowerCase()
      );
    });
  },
});

// const fileStorage = multer.memoryStorage({
//   destination: (req, file, cb) => {
//     cb(null, "");
//   },
// });

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

app.use(
  multer({
    storage: fileStorage,
    fileFilter: fileFilter,
  }).single("imageUrl")
);

app.use("/images", express.static(path.join(__dirname, "images")));

app.use(
  session({
    secret: "my secret",
    resave: false,
    saveUninitialized: false,
    store: store,
  })
);

app.use((req, res, next) => {
  // throw new Error('Sync Dummy');
  if (!req.session.user) {
    return next();
  }

  User.findById(req.session.user._id)
    .then((user) => {
      if (!user) {
        return next();
      }
      req.user = user;
      next();
    })
    .catch((err) => {
      next(new Error(err));
    });
});

app.use(async (req, res, next) => {
  const featuredPosts = await Post.find(
    {
      $and: [
        {
          publish: "everyone",
        },
        {
          featured: true,
        },
      ],
    },
    { pro: false, publish: false }
  ).limit(5);

  req.featuredPosts = featuredPosts;
  next();
});

app.get("/", (req, res, next) => {
  res.redirect("/blog");
});
// app.get("/img/:key", (req, res) => {
//   const s3 = new AWS.S3({
//     accessKeyId: process.env.AWS_ACCESS_KEY,
//     secretAccessKey: process.env.AWS_SECRET,
//   });
//   const params = {
//     Bucket: process.env.AWS_BUCKET_NAME,
//     Key: req.params.key,
//   };
//   s3.getObject(params).createReadStream().pipe(res);
// });
// app.get("/blog/", (req, res, next) => {
//   res.redirect("/blog");
// });
app.use("/auth", authRouter);
app.use("/blog", blogRouter);

app.use((err, req, res, next) => {
  console.log(err);
  const statusCode = err.statusCode;
  const message = err.message;
  const oldData = err.oldDetails;

  res.status(statusCode).render("404/404.ejs", {
    message: message,
    oldDetails: oldData,
    pageTitle: "404",
    isAuthenticated: false,
  });
});

mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then((res) => {
    console.log("Connected to DB Successfully!");
    app.listen(process.env.PORT || 80, "0.0.0.0", () => {
      console.log("Server started Successfully on PORT:" + process.env.PORT);
    });
  });
