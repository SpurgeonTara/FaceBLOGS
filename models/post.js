const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const postSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    comments: [
      {
        type: Schema.Types.ObjectId,
        ref: "Comment",
        required: true,
      },
    ],
    likes: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    coverImgUrl: {
      type: String,
    },
    creator: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    series: {
      type: Schema.Types.ObjectId,
      ref: "Series",
    },
    views: {
      type: Number,
      default: 0,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    pro: {
      type: Boolean,
      default: false,
    },
    publish: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

postSchema.index({ title: "text", description: "text" });

module.exports = mongoose.model("Post", postSchema);
