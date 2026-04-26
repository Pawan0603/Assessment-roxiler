import mongoose, { Schema, model, models, Document } from "mongoose";

export interface IStore extends Document {
  name: string;
  email: string;
  address: string;
  ownerId?: mongoose.Types.ObjectId;
}

const StoreSchema = new Schema<IStore>(
  {
    name: {
      type: String,
      required: [true, "Store name is required"],
      minlength: [20, "Store name must be at least 20 characters"],
      maxlength: [60, "Store name must be at most 60 characters"],
      trim: true,
    },

    email: {
      type: String,
      required: [true, "Store email is required"],
      lowercase: true,
      trim: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        "Invalid email format",
      ],
    },

    address: {
      type: String,
      required: [true, "Store address is required"],
      maxlength: [400, "Address must be at most 400 characters"],
      trim: true,
    },

    ownerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      validate: {
        validator: function (v: mongoose.Types.ObjectId) {
          return mongoose.Types.ObjectId.isValid(v);
        },
        message: "Invalid owner ID",
      },
    },
  },
  { timestamps: true }
);

export const Store = models.Store || model<IStore>("Store", StoreSchema);