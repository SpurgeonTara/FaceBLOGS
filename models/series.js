const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const seriesSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    creator: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    posts: [
      {
        postId: {
          type: Schema.Types.ObjectId,
          ref: "Post",
          required: true,
        },
        title: {
          type: String,
          required: true,
        },
      },
    ],
  },
  { timestamps: true },
  { toJson: { virtuals: true } },
  { toObject: { virtuals: true } }
);

seriesSchema.virtual("postDetails", {
  ref: "Post",
  localField: "_id",
  foreignField: "series",
  justOne: false,
});

seriesSchema.methods.addToSeries = function (postId) {
  this.posts.push(postId);
  return this.save();
};

seriesSchema.methods.removeFromSeries = function (postId) {
  const arrayAfterRemoval = [];
  this.posts.forEach((it) => {
    if (postId != it) {
      arrayAfterRemoval.push(it);
    }
  });
  this.posts = arrayAfterRemoval;
  return this.save();
};

module.exports = mongoose.model("Series", seriesSchema);
