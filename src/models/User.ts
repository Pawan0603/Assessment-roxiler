import mongoose, { Schema, model, models, Document } from "mongoose";

export type Role = "admin" | "user" | "owner";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  address: string;
  role: Role;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      minlength: [5, "Name must be at least 5 characters"],
      maxlength: [60, "Name must be at most 60 characters"],
      trim: true,
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        "Invalid email format",
      ],
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      validate: {
        validator: function (v: string) {
          return /[A-Z]/.test(v) && /[!@#$%^&*(),.?":{}|<>_\-+=/\\[\]`~';]/.test(v);
        },
        message:
          "Password must include at least one uppercase letter and one special character",
      },
    },

    address: {
      type: String,
      required: [true, "Address is required"],
      maxlength: [400, "Address must be at most 400 characters"],
      trim: true,
    },

    role: {
      type: String,
      enum: {
        values: ["admin", "user", "owner"],
        message: "Role must be admin, user, or owner",
      },
      default: "user",
    },
  },
  { timestamps: true }
);

export const User = models.User || model<IUser>("User", UserSchema);