import { NextResponse } from "next/server";
import { User } from "@/models/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import connectDB from "@/lib/connectDB";

const JWT_SECRET = process.env.JWT_SECRET!;

function getToken(req: Request) {
  const cookie = req.headers.get("cookie") || "";
  return cookie
    .split("; ")
    .find((c) => c.startsWith("token="))
    ?.split("=")[1];
}

export async function PUT(req: Request) {
  try {
    await connectDB();

    const token = getToken(req);
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded: any = jwt.verify(token, JWT_SECRET);

    const { currentPassword, newPassword } = await req.json();

    const user = await User.findById(decoded.userId);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);

    if (!isMatch) {
      return NextResponse.json(
        { error: "Current password is incorrect" },
        { status: 400 }
      );
    }

    const hashed = await bcrypt.hash(newPassword, 10);

    user.password = hashed;
    await user.save();

    return NextResponse.json({ message: "Password updated" });
  } catch (error) {
    console.error("Password Update Error:", error);

    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}