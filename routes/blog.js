const router = require("express").Router();
const { body } = require("express-validator");

const blogController = require("../controllers/blog");

const isAuth = require("../middlewares/is-Auth");
const isConfirmed = require("../middlewares/isConfirmed");

const User = require("../models/user");

router.get("/", blogController.getIndex);

router.get("/about", blogController.getAbout);
router.get("/contact", blogController.getContact);
router.get("/sponsors", blogController.getSponsors);

router.get("/new", isAuth, isConfirmed, blogController.getCreatePost);
router.get(
  "/edit/post/:postId",
  isAuth,
  isConfirmed,
  blogController.getEditPost
);
router.post(
  "/edit/post/:postId",
  isAuth,
  isConfirmed,
  blogController.postEditPost
);
router.post(
  "/new",
  [
    body("imageUrl").custom((val, { req }) => {
      console.log(req.file);
      if (req.file.size > 2097152) {
        console.log(req.file.size);
        throw new Error("File Size shouldn't exceed 2mb");
      }
      return true;
    }),
  ],
  isAuth,
  isConfirmed,
  blogController.postCreatePost
);

router.get("/post/:postId", blogController.getPost);
router.post(
  "/post/:postId/comment",
  isAuth,
  isConfirmed,
  blogController.postAddComent
);

router.post(
  "/edit/comment/:commentId",
  isAuth,
  isConfirmed,
  blogController.postEditComment
);
router.post(
  "/delete/comment/:commentId",
  isAuth,
  isConfirmed,
  blogController.postDeleteComment
);

router.post(
  "/addLike/post/:postId",
  isAuth,
  isConfirmed,
  blogController.postAddLike
);
router.post(
  "/removeLike/post/:postId",
  isAuth,
  isConfirmed,
  blogController.postRemoveLike
);

router.get("/search", blogController.postSearch);

module.exports = router;
