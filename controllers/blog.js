const mongoose = require("mongoose");
const AWS = require("aws-sdk");
const { v4: uuidv4 } = require("uuid");

const Post = require("../models/post");
const User = require("../models/user");
const Series = require("../models/series");
const Comment = require("../models/comments");
const { validationResult } = require("express-validator");

exports.getIndex = async (req, res, next) => {
  let finalPosts = [];
  const ITEMS_PER_PAGE = 5;
  const page = +req.query.page || 1;
  let totalItems;
  const typeOfFeed = req.query.feed;
  //   const featured = [];
  //   const posts = [];
  let variableX;
  let lastXdays;

  try {
    if (req.session.isLoggedIn) {
      const user = await User.findById(req.user._id);
      const feed = [];
      if (!user) {
        const err = new Error("Unautherized!!");
        err.statusCode = 404;
        throw err;
      }
      const followers = user.followers;
      const following = user.following;

      const mutualFollowers = [];
      followers.forEach((follower) => {
        if (following.includes(follower)) {
          mutualFollowers.push(follower);
        }
      });

      if (!typeOfFeed) {
        finalPosts = await Post.find(
          {
            $or: [
              {
                $and: [{ featured: true }],
              },
              {
                $and: [
                  { creator: { $in: mutualFollowers } },
                  {
                    $or: [{ publish: "everyone" }, { publish: "friends" }],
                  },
                ],
              },
              {
                $and: [{ publish: "everyone" }],
              },
            ],
          },
          { pro: false, publish: false, updatedAt: false }
        )
          .countDocuments()
          .then((numPosts) => {
            totalItems = numPosts;
            return Post.find(
              {
                $or: [
                  {
                    $and: [{ featured: true }],
                  },
                  {
                    $and: [
                      { creator: { $in: mutualFollowers } },
                      {
                        $or: [{ publish: "everyone" }, { publish: "friends" }],
                      },
                    ],
                  },
                  {
                    $and: [{ publish: "everyone" }],
                  },
                ],
              },
              { pro: false, publish: false, updatedAt: false }
            )
              .sort({ featured: -1, createdAt: -1 })
              .populate({
                path: "creator",
                select: "_id firstName lastName imageUrl",
              })
              .skip((page - 1) * ITEMS_PER_PAGE)
              .limit(ITEMS_PER_PAGE);
          });
      } else {
        if (typeOfFeed === "week") {
          variableX = 7;
        } else if (typeOfFeed === "month") {
          variableX = 30;
        } else if (typeOfFeed === "year") {
          variableX = 365;
        }

        let currentDate = new Date();
        lastXdays = new Date(
          currentDate.setDate(currentDate.getDate() - variableX)
        );

        finalPosts = await Post.find(
          {
            $and: [
              {
                $or: [
                  {
                    $and: [{ featured: true }],
                  },
                  {
                    $and: [
                      { creator: { $in: mutualFollowers } },
                      {
                        $or: [{ publish: "everyone" }, { publish: "friends" }],
                      },
                    ],
                  },
                  {
                    $and: [{ publish: "everyone" }],
                  },
                ],
              },
              {
                createdAt: { $gt: lastXdays },
              },
            ],
          },
          { pro: false, publish: false, updatedAt: false }
        )
          .countDocuments()
          .then((numPosts) => {
            totalItems = numPosts;
            return Post.find(
              {
                $and: [
                  {
                    $or: [
                      {
                        $and: [{ featured: true }],
                      },
                      {
                        $and: [
                          { creator: { $in: mutualFollowers } },
                          {
                            $or: [
                              { publish: "everyone" },
                              { publish: "friends" },
                            ],
                          },
                        ],
                      },
                      {
                        $and: [{ publish: "everyone" }],
                      },
                    ],
                  },
                  {
                    createdAt: { $gt: lastXdays },
                  },
                ],
              },
              { pro: false, publish: false, updatedAt: false }
            )
              .sort({ featured: -1, createdAt: -1 })
              .populate({
                path: "creator",
                select: "_id firstName lastName imageUrl",
              })
              .skip((page - 1) * ITEMS_PER_PAGE)
              .limit(ITEMS_PER_PAGE);
          });
      }
      res.status(200).render("blog/home.ejs", {
        pageTitle: "Home",
        isAuthenticated: req.session.isLoggedIn,
        posts: finalPosts,
        lastXdays: lastXdays,
        currentPage: page,
        hasNextPage: ITEMS_PER_PAGE * page < totalItems,
        hasPreviousPage: page > 1,
        nextPage: page + 1,
        previousPage: page - 1,
        lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE),
        profilePicUrl: req.user.imageUrl,
        fullName: req.user.fullName,
        userhandle: req.user.userhandle,
        featuredPosts: req.featuredPosts,
        hasTypeOfFeed: typeOfFeed,
      });
    } else {
      if (!typeOfFeed) {
        finalPosts = await Post.find(
          {
            publish: "everyone",
          },
          { pro: false, publish: false }
        )
          .countDocuments()
          .then((numPosts) => {
            totalItems = numPosts;
            return Post.find(
              {
                publish: "everyone",
              },
              { pro: false, publish: false }
            )
              .sort({ featured: -1, createdAt: -1 })
              .populate({
                path: "creator",
                select: "_id firstName lastName imageUrl",
              })
              .skip((page - 1) * ITEMS_PER_PAGE)
              .limit(ITEMS_PER_PAGE);
          });
      } else {
        if (typeOfFeed === "week") {
          variableX = 7;
        } else if (typeOfFeed === "month") {
          variableX = 30;
        } else if (typeOfFeed === "year") {
          variableX = 365;
        }

        let currentDate = new Date();
        lastXdays = new Date(
          currentDate.setDate(currentDate.getDate() - variableX)
        );
        finalPosts = await Post.find(
          {
            $and: [
              {
                publish: "everyone",
              },
              {
                createdAt: { $gt: lastXdays },
              },
            ],
          },
          { pro: false, publish: false, updatedAt: false }
        )
          .countDocuments()
          .then((numPosts) => {
            totalItems = numPosts;
            return Post.find(
              {
                $and: [
                  {
                    publish: "everyone",
                  },
                  {
                    createdAt: { $gt: lastXdays },
                  },
                ],
              },
              { pro: false, publish: false, updatedAt: false }
            )
              .sort({ featured: -1, createdAt: -1 })
              .populate({
                path: "creator",
                select: "_id firstName lastName imageUrl",
              })
              .skip((page - 1) * ITEMS_PER_PAGE)
              .limit(ITEMS_PER_PAGE);
          });
      }
      res.status(200).render("blog/home.ejs", {
        pageTitle: "Home",
        isAuthenticated: req.session.isLoggedIn,
        posts: finalPosts,
        currentPage: page,
        hasNextPage: ITEMS_PER_PAGE * page < totalItems,
        hasPreviousPage: page > 1,
        nextPage: page + 1,
        previousPage: page - 1,
        lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE),
        featuredPosts: req.featuredPosts,
        hasTypeOfFeed: typeOfFeed,
      });
    }
  } catch (err) {
    console.log(err);
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.getAbout = (req, res, next) => {
  if (req.session.isLoggedIn) {
    res.status(200).render("other/about", {
      pageTitle: "About Us",
      isAuthenticated: req.session.isLoggedIn,
      profilePicUrl: req.user.imageUrl,
      fullName: req.user.fullName,
      userhandle: req.user.userhandle,
    });
  } else {
    res.status(200).render("other/about", {
      pageTitle: "About Us",
      isAuthenticated: req.session.isLoggedIn,
    });
  }
};

exports.getSponsors = (req, res, next) => {
  if (req.session.isLoggedIn) {
    res.status(200).render("other/sponsors", {
      pageTitle: "About Us",
      isAuthenticated: req.session.isLoggedIn,
      profilePicUrl: req.user.imageUrl,
      fullName: req.user.fullName,
      userhandle: req.user.userhandle,
    });
  } else {
    res.status(200).render("other/sponsors", {
      pageTitle: "About Us",
      isAuthenticated: req.session.isLoggedIn,
    });
  }
};

exports.getContact = (req, res, next) => {
  if (req.session.isLoggedIn) {
    res.status(200).render("other/contact", {
      pageTitle: "About Us",
      isAuthenticated: req.session.isLoggedIn,
      profilePicUrl: req.user.imageUrl,
      fullName: req.user.fullName,
      userhandle: req.user.userhandle,
    });
  } else {
    res.status(200).render("other/contact", {
      pageTitle: "About Us",
      isAuthenticated: req.session.isLoggedIn,
    });
  }
};

exports.getCreatePost = (req, res, next) => {
  Series.find({ creator: req.user._id })
    .then((userSeries) => {
      res.status(200).render("blog/add-post", {
        pageTitle: "Create New Post",
        userSeries: userSeries,
        editing: false,
        errorDetails: null,
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

exports.getEditPost = (req, res, next) => {
  const postId = req.params.postId;

  Series.find({ creator: req.user._id })
    .then((userSeries) => {
      Post.findById(postId)
        .then((post) => {
          if (!post) {
            const err = new Error("Post Was Not Found");
            err.statusCode = 404;
            throw err;
          }
          res.status(200).render("blog/add-post", {
            pageTitle: "Create New Post",
            userSeries: userSeries,
            oldDetails: post,
            editing: true,
            errorDetails: null,
          });
        })
        .catch((err) => {
          if (!err.statusCode) {
            err.statusCode = 500;
          }
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

exports.postCreatePost = async (req, res, next) => {
  const { title, description, publish } = req.body;

  const seriesQuery = req.query.series;
  let seriesName;
  let oldSeries;
  let isSeriesExists;
  let post;
  const userSeries = await Series.find({ creator: req.user._id });

  const errors = validationResult(req);
  console.log(errors.errors);
  if (!errors.isEmpty()) {
    return res.status(200).render("blog/add-post", {
      pageTitle: "Create New Post",
      userSeries: userSeries,
      editing: false,
      errorDetails: errors.array(),
      profilePicUrl: req.user.imageUrl,
      fullName: req.user.fullName,
      userhandle: req.user.userhandle,
      userSeries: userSeries,
    });
  }
  if (!title || !description) {
    return res.status(422).render("blog/add-post", {
      editing: false,
      pageTitle: "Create New Post",
      profilePicUrl: req.user.imageUrl,
      fullName: req.user.fullName,
      userhandle: req.user.userhandle,
      userSeries: userSeries,
      errorDetails: null,
    });
  }

  // console.log("getting Here");

  if (!seriesQuery || seriesQuery === "none") {
    User.findOne({ _id: req.user._id })
      .then((user) => {
        if (!user) {
          const error = new Error("No User found for given user!");
          error.statusCode = 422;
          err.oldDetails = req.body;
          throw error;
        }
        if (req.file) {
          let imageUrl = req.file.path;

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
          //   // imageUrl = req.file.path;
          //   // imageUrl = `/img/${data.Key}`;

          // });
          post = new Post({
            title,
            description,
            coverImgUrl: imageUrl,
            creator: req.user._id,
            publish,
          });
          post
            .save()
            .then((post) => {
              user.posts.push(post._id);
              user
                .save()
                .then((user) => {
                  res.status(200).redirect("/blog/post/" + post._id);
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
          // console.log(req.file);
        } else {
          post = new Post({
            title,
            description,
            creator: req.user._id,
            publish,
          });
          post
            .save()
            .then((post) => {
              user.posts.push(post._id);
              user
                .save()
                .then((user) => {
                  res.status(200).redirect("/blog/post/" + post._id);
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
        }
      })
      .catch((err) => {
        console.log(err);
        if (!err.statusCode) {
          err.statusCode = 500;
        }
        next(err);
      });
  } else {
    seriesName = seriesQuery.trim();
    Series.find({ creator: req.user._id })
      .then((userSeriesList) => {
        if (!userSeriesList) {
          const error = new Error("No Series Found for given user");
          error.statusCode = 422;
          error.oldDetails = req.body;
          throw error;
        }
        if (userSeriesList.length > 0) {
          userSeriesList.map((ser) => {
            if (ser.name.toLowerCase() == seriesName.toLowerCase()) {
              oldSeries = ser;
            }
          });
        }
        return new Promise(function (resolve, reject) {
          resolve("Done");
        });
      })
      .then((data) => {
        User.findOne({ _id: req.user._id })
          .then((user) => {
            if (!user) {
              console.log("User was not found!!");
              const error = new Error("User wasn't found");
              error.statusCode = 404;
              error.oldDetails = req.body;
              throw error;
            }

            Series.findOne({ _id: oldSeries })
              .then((existedSeries) => {
                if (existedSeries) {
                  isSeriesExists = true;
                } else {
                  isSeriesExists = false;
                }
                if (!isSeriesExists) {
                  if (req.file) {
                    let imageUrl = req.file.path;

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
                    //   // imageUrl = req.file.path;
                    //   // imageUrl = `/img/${data.Key}`;

                    // });
                    post = new Post({
                      title,
                      description,
                      coverImgUrl: imageUrl,
                      creator: req.user._id,
                      publish,
                    });
                    post
                      .save()
                      .then((post) => {
                        const series = new Series({
                          name: seriesName,
                          posts: {
                            postId: post._id,
                            title: post.title,
                          },
                          creator: req.user._id,
                        });
                        series
                          .save()
                          .then((series) => {
                            series.populate("posts");
                            post.series = series._id;
                            post
                              .save()
                              .then((post) => {
                                user.series.push(series._id);
                                user.posts.push(post._id);
                                user.save().then((user) => {
                                  res
                                    .status(200)
                                    .redirect("/blog/post/" + post._id);
                                });
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
                      })
                      .catch((err) => {
                        console.log(err);
                        if (!err.statusCode) {
                          err.statusCode = 500;
                        }
                        next(err);
                      });
                  } else {
                    post = new Post({
                      title,
                      description,
                      creator: req.user._id,
                      publish,
                    });
                    post
                      .save()
                      .then((post) => {
                        const series = new Series({
                          name: seriesName,
                          posts: {
                            postId: post._id,
                            title: post.title,
                          },
                          creator: req.user._id,
                        });
                        series
                          .save()
                          .then((series) => {
                            series.populate("posts");
                            post.series = series._id;
                            post
                              .save()
                              .then((post) => {
                                user.series.push(series._id);
                                user.posts.push(post._id);
                                user.save().then((user) => {
                                  res
                                    .status(200)
                                    .redirect("/blog/post/" + post._id);
                                });
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
                      })
                      .catch((err) => {
                        console.log(err);
                        if (!err.statusCode) {
                          err.statusCode = 500;
                        }
                        next(err);
                      });
                  }
                } else {
                  if (req.file) {
                    let imageUrl = req.file.path;

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
                    //   // imageUrl = req.file.path;
                    //   // imageUrl = `/img/${data.Key}`;

                    // });
                    post = new Post({
                      title,
                      description,
                      coverImgUrl: imageUrl,
                      creator: req.user._id,
                      publish,
                    });
                    post
                      .save()
                      .then((post) => {
                        Series.findOne({ _id: oldSeries })
                          .then((seriesData) => {
                            if (!seriesData) {
                              const err = new Error(
                                "The Series in whichn you are trying to add post doesn't exists!"
                              );
                              err.oldDetails = req.body;
                              err.statusCode = 404;
                              throw err;
                            }
                            seriesData.posts.push({
                              postId: post._id,
                              title: post.title,
                            });
                            return seriesData.save();
                          })
                          .then((ser) => {
                            ser.populate("posts");
                            post.series = ser._id;
                            post
                              .save()
                              .then((post) => {
                                user.posts.push(post._id);
                                return user.save();
                              })
                              .then((user) => {
                                res
                                  .status(200)
                                  .redirect("/blog/post/" + post._id);
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
                      })
                      .catch((err) => {
                        console.log(err);
                        if (!err.statusCode) {
                          err.statusCode = 500;
                        }
                        next(err);
                      });
                  } else {
                    post = new Post({
                      title,
                      description,
                      creator: req.user._id,
                      publish,
                    });
                    post
                      .save()
                      .then((post) => {
                        Series.findOne({ _id: oldSeries })
                          .then((seriesData) => {
                            if (!seriesData) {
                              const err = new Error(
                                "The Series in whichn you are trying to add post doesn't exists!"
                              );
                              err.oldDetails = req.body;
                              err.statusCode = 404;
                              throw err;
                            }
                            seriesData.posts.push({
                              postId: post._id,
                              title: post.title,
                            });
                            return seriesData.save();
                          })
                          .then((ser) => {
                            ser.populate("posts");
                            post.series = ser._id;
                            post
                              .save()
                              .then((post) => {
                                user.posts.push(post._id);
                                return user.save();
                              })
                              .then((user) => {
                                res
                                  .status(200)
                                  .redirect("/blog/post/" + post._id);
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
                      })
                      .catch((err) => {
                        console.log(err);
                        if (!err.statusCode) {
                          err.statusCode = 500;
                        }
                        next(err);
                      });
                  }
                }
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
      })
      .catch((err) => {
        console.log(err);
        if (!err.statusCode) {
          err.statusCode = 500;
        }
      });
  }
};

exports.getPost = (req, res, next) => {
  const postId = req.params.postId;
  let isFollowing;
  let isLiked;
  let isSaved;
  let isEditingComment = req.query.editComment;
  if (!isEditingComment) {
    isEditingComment = "false";
  }

  Post.findOne({ _id: postId })
    .populate(["series", "creator"])
    .then((post) => {
      console.log(post);
      if (!post) {
        const err = new Error("Post With that Post Id doesn't exists!");
        err.statusCode = 404;
        throw err;
      }
      if (req.user) {
        if (
          req.user.following.includes(mongoose.Types.ObjectId(post.creator._id))
        ) {
          isFollowing = "Unfollow";
        } else {
          isFollowing = "Follow";
        }
        if (post.likes.includes(mongoose.Types.ObjectId(req.user._id))) {
          isLiked = true;
        } else {
          isLiked = false;
        }
        if (req.user.readingList.includes(mongoose.Types.ObjectId(postId))) {
          isSaved = true;
        } else {
          isSaved = false;
        }
      }

      Comment.find({ postId: post._id })
        .populate("userId")
        .then((comments) => {
          if (req.session.isLoggedIn) {
            if (post.series) {
              res.status(200).render("blog/post-detail", {
                pageTitle: "Post Detail",
                isAuthenticated: req.session.isLoggedIn,
                postDetails: post,
                seriesPosts: post.series.posts,
                profilePicUrl: req.user.imageUrl,
                fullName: req.user.fullName,
                userhandle: req.user.userhandle,
                userId: req.user._id,
                commentsDetails: comments,
                commentEditing: isEditingComment,
                following: isFollowing,
                isLiked: isLiked,
                isSaved: isSaved,
              });
            } else {
              res.status(200).render("blog/post-detail", {
                pageTitle: "Post Detail",
                isAuthenticated: req.session.isLoggedIn,
                postDetails: post,
                profilePicUrl: req.user.imageUrl,
                fullName: req.user.fullName,
                userhandle: req.user.userhandle,
                userId: req.user._id,
                seriesPosts: [],
                commentsDetails: comments,
                commentEditing: isEditingComment,
                following: isFollowing,
                isLiked: isLiked,
                isSaved: isSaved,
              });
            }
          } else {
            if (post.series) {
              res.status(200).render("blog/post-detail", {
                pageTitle: "Post Detail",
                isAuthenticated: req.session.isLoggedIn,
                postDetails: post,
                seriesPosts: post.series.posts,
                commentsDetails: comments,
                userId: "",
                commentEditing: isEditingComment,
                isLiked: false,
                isSaved: false,
              });
            } else {
              res.status(200).render("blog/post-detail", {
                pageTitle: "Post Detail",
                isAuthenticated: req.session.isLoggedIn,
                postDetails: post,
                seriesPosts: [],
                commentsDetails: comments,
                userId: "",
                commentEditing: isEditingComment,
                isLiked: false,
                isSaved: false,
              });
            }
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

exports.postEditPost = (req, res, next) => {
  const seriesQuery = req.query.series;
  const { title, description, coverImgUrl, publish } = req.body;
  const postId = req.params.postId;
  const newPosts = [];
  let isSeriesOld;
  let seriesName;
  let seriesToBeDeleted;
  let imageUrl;
  if (seriesQuery) {
    seriesName = seriesQuery.trim();
    if (seriesName === "none") {
      User.findOne({ _id: req.user._id })
        .then((user) => {
          if (!user) {
            const err = new Error("User Not Found!!");
            err.statusCode = 404;
            err.oldDetails = req.body;
            throw err;
          }
          Post.findById(postId)
            .then((post) => {
              if (!post) {
                const err = new Error("Post Not Found!!");
                err.statusCode = 404;
                err.oldDetails = req.body;
                throw err;
              }
              if (post.creator.toString() !== req.user._id.toString()) {
                const err = new Error(
                  "You are Not Authorized to edit this Post"
                );
                err.statusCode = 422;
                err.oldDetails = req.body;
                throw err;
              }
              Series.findOne({
                "posts.postId": { $in: postId },
                creator: req.user._id,
              })
                .then((series) => {
                  if (series) {
                    if (series.posts.length === 0) {
                      return Series.findByIdAndRemove(series._id)
                        .then((series) => {
                          user.series.pull(series._id);
                          return user.save();
                        })
                        .catch((err) => {
                          if (!err.statusCode) {
                            err.statusCode = 500;
                          }
                          next(err);
                        });
                    } else {
                      return new Promise((resolve, reject) => {
                        resolve("Continue Processing!");
                      });
                    }
                  }
                })
                .then((user) => {
                  if (req.file) {
                    imageUrl = req.file.path;
                    post.title = title;
                    post.description = description;
                    post.coverImgUrl = imageUrl;
                    post.series = undefined;
                    post.publish = publish;
                  } else {
                    post.title = title;
                    post.description = description;
                    post.series = undefined;
                    post.publish = publish;
                  }
                  return post.save();
                })
                .then((post) => {
                  res.status(200).redirect("/blog/post/" + post._id);
                })
                .catch((err) => {
                  if (!err.statusCode) {
                    err.statusCode = 500;
                  }
                  next(err);
                });
            })
            .catch((err) => {
              if (!err.statusCode) {
                err.statusCode = 500;
              }
              next(err);
            });
        })
        .catch((err) => {
          if (!err.statusCode) {
            err.statusCode = 500;
          }
          next(err);
        });
    } else if (seriesName === "dots") {
      Post.findById(postId)
        .then((post) => {
          if (!post) {
            const err = new Error("Post Not Found!");
            err.statusCode = 500;
            err.oldDetails = req.body;
            throw err;
          }
          if (req.file) {
            imageUrl = req.file.path;
            post.title = title;
            post.description = description;
            post.coverImgUrl = imageUrl;
            post.series = undefined;
            post.publish = publish;
          } else {
            post.title = title;
            post.description = description;
            post.series = undefined;
            post.publish = publish;
          }

          return post.save();
        })
        .then((post) => {
          res.status(200).redirect("/blog/post/" + post._id);
        })
        .catch((err) => {
          if (!err.statusCode) {
            err.statusCode = 500;
          }
          next(err);
        });
    } else {
      Post.findOne({ _id: postId })
        .then((post) => {
          if (!post) {
            const err = new Error("Post Not Found for PostId");
            err.statusCode = 404;
            err.oldDetails = req.body;
            throw err;
          }
          User.findOne({ _id: req.user._id })
            .then((user) => {
              if (!user) {
                const err = new Error("User Not Found!!");
                err.statusCode = 404;
                err.oldDetails = req.body;
                throw err;
              }
              Series.find({
                "posts.postId": { $in: postId },
                creator: req.user._id,
              })
                .then((series) => {
                  if (series) {
                    if (series.length > 0) {
                      seriesToBeDeleted = series[0];
                      // seriesLength = seriesToBeDeleted.posts.length;

                      // if (seriesLength >= 2) {
                      seriesToBeDeleted.posts.forEach((it) => {
                        if (it.postId.toString() !== postId) {
                          newPosts.push(it);
                        }
                      });
                      seriesToBeDeleted.posts = newPosts;
                      return seriesToBeDeleted
                        .save()
                        .then((series) => {
                          if (seriesToBeDeleted.posts.length === 0) {
                            return Series.findByIdAndRemove(
                              seriesToBeDeleted._id
                            )
                              .then((series) => {
                                user.series.pull(series._id);
                                return user.save();
                              })
                              .catch((err) => {
                                if (!err.statusCode) {
                                  err.statusCode = 500;
                                }
                                next(err);
                              });
                          }
                          return new Promise((resolve, reject) => {
                            resolve("Continue Processing!");
                          });
                        })
                        .catch((err) => {
                          console.log(err);
                          if (!err.statusCode) {
                            err.statusCode = 500;
                          }
                          next(err);
                        });
                      // } else {
                      //   user.series.pull(series[0]._id);
                      //   return user.save();
                      // }
                    } else {
                      return new Promise(function (resolve, reject) {
                        resolve("Done");
                      });
                    }
                  }
                })
                .then((user) => {
                  return Series.findOne({
                    name: seriesName,
                    creator: req.user._id,
                  });
                })
                .then((series) => {
                  // if (!series) {
                  //   const err = new Error(
                  //     "No Series Found with The Provided name and User"
                  //   );
                  //   err.statusCode = 404;
                  //   next(err);
                  // }

                  if (series) {
                    isSeriesOld = true;
                  } else {
                    isSeriesOld = false;
                  }
                  if (isSeriesOld) {
                    series.posts.push({
                      postId: post._id,
                      title: post.title,
                    });
                    return series.save();
                  } else {
                    const newSeries = new Series({
                      name: seriesName,
                      posts: [
                        {
                          postId: post._id,
                          title: post.title,
                        },
                      ],
                      creator: req.user._id,
                    });
                    return newSeries.save();
                  }
                })
                .then((series) => {
                  if (!series) {
                    const err = new Error("Series Was Not saved Successfully");
                    err.statusCode = 500;
                    throw err;
                  }
                  if (!isSeriesOld) {
                    user.series.push(series._id);
                    return user.save();
                  } else {
                    return new Promise((resolve, reject) => {
                      resolve("done");
                    });
                  }
                })
                .then((user) => {
                  Series.findOne({ name: seriesName, creator: req.user._id })
                    .then((series) => {
                      if (req.file) {
                        imageUrl = req.file.path;
                        post.title = title;
                        post.description = description;
                        post.coverImgUrl = imageUrl;
                        post.series = series._id;
                        post.publish = publish;
                      } else {
                        post.title = title;
                        post.description = description;
                        post.series = series._id;
                        post.publish = publish;
                      }
                      return post.save();
                    })
                    .then((post) => {
                      if (!post) {
                        const err = new Error(
                          "Post doesn't saved Successfully"
                        );
                        err.statusCode = 500;
                        err.oldDetails = req.body;
                        throw err;
                      }
                      res.status(200).redirect("/blog/post/" + post._id);
                    })
                    .catch((err) => {
                      if (!err.statusCode) {
                        err.statusCode = 500;
                      }
                      next(err);
                    });
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
        })
        .catch((err) => {
          console.log(err);
          if (!err.statusCode) {
            err.statusCode = 500;
          }
          next(err);
        });
    }
  } else {
    Post.findById(postId)
      .then((post) => {
        if (!post) {
          const err = new Error("Post Not Found!");
          err.statusCode = 500;
          err.oldDetails = req.body;
          throw err;
        }
        if (req.file) {
          imageUrl = req.file.path;
          post.title = title;
          post.description = description;
          post.coverImgUrl = imageUrl;
          post.series = undefined;
          post.publish = publish;
        } else {
          post.title = title;
          post.description = description;
          post.series = undefined;
          post.publish = publish;
        }

        return post.save();
      })
      .then((post) => {
        res.status(200).redirect("/blog/post/" + post._id);
      })
      .catch((err) => {
        if (!err.statusCode) {
          err.statusCode = 500;
        }
        next(err);
      });
  }
};

exports.postAddComent = (req, res, next) => {
  const postId = req.params.postId;
  const commentTobeSaved = req.body.comment;
  Post.findOne({ _id: postId })
    .then((post) => {
      if (!post) {
        const error = new Error("Post Doesnt Exists!!");
        error.statusCode = 404;
        throw error;
      }
      const comment = new Comment({
        userId: req.user._id,
        postId: postId,
        comment: commentTobeSaved,
      });
      comment
        .save()
        .then((comment) => {
          if (!post.comments.includes(mongoose.Types.ObjectId(comment._id))) {
            post.comments.push(comment._id);
            post
              .save()
              .then((post) => {
                res.status(201).redirect("/blog/post/" + post._id);
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
              "Comment With That Comment Id already Exists!!"
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
    })
    .catch((err) => {
      console.log(err);
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.postEditComment = (req, res, next) => {
  const commentId = req.params.commentId;
  const commentToBeUpdated = req.body.comment;
  Comment.findOne({ _id: commentId })
    .then((comment) => {
      if (!comment) {
        const err = new Error("Comment Not Found");
        err.statusCode = 404;
        throw err;
      }
      if (comment.userId.toString() !== req.user._id.toString()) {
        const err = new Error("Unauthorized!!");
        err.statusCode = 404;
        throw err;
      }
      comment.comment = commentToBeUpdated;
      return comment.save();
    })
    .then((comment) => {
      res.status(201).redirect("/blog/post/" + comment.postId);
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.postDeleteComment = (req, res, next) => {
  const commentTobeRemoved = req.params.commentId;
  Comment.findOne({ _id: commentTobeRemoved })
    .then((comment) => {
      Post.findOne({ _id: comment.postId })
        .then((post) => {
          if (!post) {
            const err = new Error("Post Doesn't exists!!");
            err.statusCode = 404;
            throw err;
          }
          if (post.comments.includes(mongoose.Types.ObjectId(comment._id))) {
            post.comments.pull(comment._id);
            post
              .save()
              .then((post) => {
                return Comment.findByIdAndRemove(comment._id);
              })
              .then((comment) => {
                res.status(201).redirect("/blog/post/" + comment.postId);
              })
              .catch((err) => {
                if (!err.statusCode) {
                  err.statusCode = 500;
                }
                next(err);
              });
          } else {
            const err = new Error("Comment Unavailable!!");
            err.statusCode = 404;
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
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.postAddLike = (req, res, next) => {
  const postId = req.params.postId;
  // const userId = req.params.userId;
  Post.findOne({ _id: postId })
    .then((post) => {
      if (!post) {
        const err = new Error("Post Doesn't Exists!");
        err.statusCode = 404;
        throw err;
      }
      if (!post.likes.includes(mongoose.Types.ObjectId(req.user._id))) {
        post.likes.push(req.user._id);
        post
          .save()
          .then((post) => {
            res.status(201).redirect("/blog/post/" + postId);
          })
          .catch((err) => {
            if (!err.statusCode) {
              err.statusCode = 422;
            }
            next(err);
          });
      } else {
        res.status(422).json({
          message: "User Already Liked the Post!!",
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

exports.postRemoveLike = (req, res, next) => {
  const postId = req.params.postId;
  // const userId = req.params.userId;
  Post.findOne({ _id: postId })
    .then((post) => {
      if (!post) {
        const err = new Error();
        err.statusCode = 404;
        throw err;
      }
      if (post.likes.includes(mongoose.Types.ObjectId(req.user._id))) {
        post.likes.pull(req.user._id);
        post
          .save()
          .then((post) => {
            res.status(201).redirect("/blog/post/" + postId);
          })
          .catch((err) => {
            if (!err.statusCode) {
              err.statusCode = 422;
            }
            next(err);
          });
      } else {
        const err = new Error("User doesn't Liked the Post Previosly!!");
        err.statusCode = 422;
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

exports.postSearch = async (req, res, next) => {
  let stopWords =
    "a,able,about,above,abst,accordance,according,accordingly,across,act,actually,added,adj,\
    affected,affecting,affects,after,afterwards,again,against,ah,all,almost,alone,along,already,also,although,\
    always,am,among,amongst,an,and,announce,another,any,anybody,anyhow,anymore,anyone,anything,anyway,anyways,\
    anywhere,apparently,approximately,are,aren,arent,arise,around,as,aside,ask,asking,at,auth,available,away,awfully,\
    b,back,be,became,because,become,becomes,becoming,been,before,beforehand,begin,beginning,beginnings,begins,behind,\
    being,believe,below,beside,besides,between,beyond,biol,both,brief,briefly,but,by,c,ca,came,can,cannot,can't,cause,causes,\
    certain,certainly,co,com,come,comes,contain,containing,contains,could,couldnt,d,date,did,didn't,different,do,does,doesn't,\
    doing,done,don't,down,downwards,due,during,e,each,ed,edu,effect,eg,eight,eighty,either,else,elsewhere,end,ending,enough,\
    especially,et,et-al,etc,even,ever,every,everybody,everyone,everything,everywhere,ex,except,f,far,few,ff,fifth,first,five,fix,\
    followed,following,follows,for,former,formerly,forth,found,four,from,further,furthermore,g,gave,get,gets,getting,give,given,gives,\
    giving,go,goes,gone,got,gotten,h,had,happens,hardly,has,hasn't,have,haven't,having,he,hed,hence,her,here,hereafter,hereby,herein,\
    heres,hereupon,hers,herself,hes,hi,hid,him,himself,his,hither,home,how,howbeit,however,hundred,i,id,ie,if,i'll,im,immediate,\
    immediately,importance,important,in,inc,indeed,index,information,instead,into,invention,inward,is,isn't,it,itd,it'll,its,itself,\
    i've,j,just,k,keep,keeps,kept,kg,km,know,known,knows,l,largely,last,lately,later,latter,latterly,least,less,lest,let,lets,like,\
    liked,likely,line,little,'ll,look,looking,looks,ltd,m,made,mainly,make,makes,many,may,maybe,me,mean,means,meantime,meanwhile,\
    merely,mg,might,million,miss,ml,more,moreover,most,mostly,mr,mrs,much,mug,must,my,myself,n,na,name,namely,nay,nd,near,nearly,\
    necessarily,necessary,need,needs,neither,never,nevertheless,new,next,nine,ninety,no,nobody,non,none,nonetheless,noone,nor,\
    normally,nos,not,noted,nothing,now,nowhere,o,obtain,obtained,obviously,of,off,often,oh,ok,okay,old,omitted,on,once,one,ones,\
    only,onto,or,ord,other,others,otherwise,ought,our,ours,ourselves,out,outside,over,overall,owing,own,p,page,pages,part,\
    particular,particularly,past,per,perhaps,placed,please,plus,poorly,possible,possibly,potentially,pp,predominantly,present,\
    previously,primarily,probably,promptly,proud,provides,put,q,que,quickly,quite,qv,r,ran,rather,rd,re,readily,really,recent,\
    recently,ref,refs,regarding,regardless,regards,related,relatively,research,respectively,resulted,resulting,results,right,run,s,\
    said,same,saw,say,saying,says,sec,section,see,seeing,seem,seemed,seeming,seems,seen,self,selves,sent,seven,several,shall,she,shed,\
    she'll,shes,should,shouldn't,show,showed,shown,showns,shows,significant,significantly,similar,similarly,since,six,slightly,so,\
    some,somebody,somehow,someone,somethan,something,sometime,sometimes,somewhat,somewhere,soon,sorry,specifically,specified,specify,\
    specifying,still,stop,strongly,sub,substantially,successfully,such,sufficiently,suggest,sup,sure,t,take,taken,taking,tell,tends,\
    th,than,thank,thanks,thanx,that,that'll,thats,that've,the,their,theirs,them,themselves,then,thence,there,thereafter,thereby,\
    thered,therefore,therein,there'll,thereof,therere,theres,thereto,thereupon,there've,these,they,theyd,they'll,theyre,they've,\
    think,this,those,thou,though,thoughh,thousand,throug,through,throughout,thru,thus,til,tip,to,together,too,took,toward,towards,\
    tried,tries,truly,try,trying,ts,twice,two,u,un,under,unfortunately,unless,unlike,unlikely,until,unto,up,upon,ups,us,use,used,\
    useful,usefully,usefulness,uses,using,usually,v,value,various,'ve,very,via,viz,vol,vols,vs,w,want,wants,was,wasn't,way,we,wed,\
    welcome,we'll,went,were,weren't,we've,what,whatever,what'll,whats,when,whence,whenever,where,whereafter,whereas,whereby,wherein,\
    wheres,whereupon,wherever,whether,which,while,whim,whither,who,whod,whoever,whole,who'll,whom,whomever,whos,whose,why,widely,\
    willing,wish,with,within,without,won't,words,world,would,wouldn't,www,x,y,yes,yet,you,youd,you'll,your,youre,yours,yourself,\
    yourselves,you've,z,zero";
  const query = req.query.query;

  try {
    String.isStopWord = function (word) {
      const regex = new RegExp("\\b" + word + "\\b", "i");
      if (stopWords.search(regex) < 0) {
        return false;
      } else {
        return true;
      }
    };

    String.prototype.removeStopWords = function () {
      words = new Array();

      this.replace(/\b[\w]+\b/g, function ($0) {
        if (!String.isStopWord($0)) {
          words[words.length] = $0.trim();
        }
      });
      return words;
    };

    const filteredQueryWords = query.removeStopWords();
    const filteredPosts = [];

    const posts = await Post.find({
      publish: "everyone",
    });

    const mainStringposts = await Post.find({
      $text: { $search: filteredQueryWords.join(" ") },
    });

    filteredQueryWords.forEach(async (query) => {
      const subPosts = await Post.find({
        $text: { $search: query },
      });
      subPosts.forEach((post) => {
        if (mainStringposts.length === 0) {
          mainStringposts.push(post);
        } else {
          let push = true;
          mainStringposts.forEach((it) => {
            if (it._id === post._id) {
              push: false;
            }
          });
          if (push) {
            mainStringposts.push(post);
          }
        }
      });
    });

    res.json({
      msg: "Still Work in Progress!",
      str: query.removeStopWords(),
      count: mainStringposts.length,
      actualPostsCount: mainStringposts.length,
      posts: filteredPosts,
      data: mainStringposts,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};
