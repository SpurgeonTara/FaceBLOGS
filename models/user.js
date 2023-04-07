const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    userName: {
      type: String,
      unique: true,
      required: true,
    },
    firstName: {
      type: String,
    },
    lastName: {
      type: String,
    },
    imageUrl: {
      type: String,
    },
    gender: {
      type: String,
    },
    dob: {
      type: Date,
    },
    nationality: {
      type: String,
    },
    pro: {
      type: Boolean,
      default: false,
    },
    education: {
      type: String,
    },
    occupation: {
      type: String,
    },
    followers: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    following: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    posts: [
      {
        type: Schema.Types.ObjectId,
        ref: "Post",
        required: true,
      },
    ],
    series: [
      {
        type: Schema.Types.ObjectId,
        ref: "Series",
        required: true,
      },
    ],
    readingList: [
      {
        type: Schema.Types.ObjectId,
        ref: "Post",
        required: true,
      },
    ],
    admin: {
      type: Boolean,
      default: false,
    },
    postsViewed: [
      {
        type: Schema.Types.ObjectId,
        ref: "Post",
        required: true,
      },
    ],
    confirmedUser: {
      type: Boolean,
      default: false,
    },
    confirmToken: String,
    confirmTokenExpiration: Date,
  },
  { timestamps: true }
);

userSchema.virtual("fullName").get(function () {
  console.log("virtual established");
  return this.firstName + " " + this.lastName;
});

userSchema.virtual("userhandle").get(function () {
  console.log("virtual established");
  return "@" + this.userName;
});

module.exports = mongoose.model("User", userSchema);
