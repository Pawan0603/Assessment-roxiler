import mongoose, { Schema, model, models, Document } from "mongoose";

export interface IRating extends Document {
  storeId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  value: number;
}

const RatingSchema = new Schema<IRating>(
  {
    storeId: {
      type: Schema.Types.ObjectId,
      ref: "Store",
      required: [true, "Store ID is required"],
    },

    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
    },

    value: {
      type: Number,
      required: [true, "Rating value is required"],
      min: [1, "Rating must be at least 1"],
      max: [5, "Rating must be at most 5"],
    },
  },
  { timestamps: true }
);

// 🔥 Prevent duplicate rating
RatingSchema.index({ storeId: 1, userId: 1 }, { unique: true });

export const Rating = models.Rating || model<IRating>("Rating", RatingSchema);