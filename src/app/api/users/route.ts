import { NextResponse } from "next/server";
import { User } from "@/models/User";
import jwt from "jsonwebtoken";
import connectDB from "@/lib/connectDB";

const JWT_SECRET = process.env.JWT_SECRET!;

// 🔒 extract token
function getToken(req: Request) {
  const cookie = req.headers.get("cookie") || "";
  return cookie
    .split("; ")
    .find((c) => c.startsWith("token="))
    ?.split("=")[1];
}

export async function GET(req: Request) {
  try {
    await connectDB();

    // 🔐 1. Auth check
    const token = getToken(req);

    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const decoded: any = jwt.verify(token, JWT_SECRET);

    // 🔐 2. Role check
    if (decoded.role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    // 🔎 3. Query params (search + filter + pagination)
    const { searchParams } = new URL(req.url);

    const search = searchParams.get("search") || "";
    const role = searchParams.get("role") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    const skip = (page - 1) * limit;

    // 🔍 4. Build filter
    const filter: any = {};

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    if (role && role !== "all") {
      filter.role = role;
    }

    // 📊 5. Query DB
    const [users, total] = await Promise.all([
      User.find(filter)
        .select("-password")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),

      User.countDocuments(filter),
    ]);

    // ✅ 6. Response
    return NextResponse.json({
      users,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get Users Error:", error);

    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}



// ====================================== POST route for creating new users (admin only) ======================================

import bcrypt from "bcryptjs";

// 🔒 helper: get token from cookie
function GetToken(req: Request) {
  const cookie = req.headers.get("cookie") || "";
  return cookie
    .split("; ")
    .find((c) => c.startsWith("token="))
    ?.split("=")[1];
}

// 🔒 sanitize response
const sanitizeUser = (user: any) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  address: user.address,
  role: user.role,
});

export async function POST(req: Request) {
  try {
    await connectDB();

    // 🔐 1. Auth check
    const token = GetToken(req);

    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const decoded: any = jwt.verify(token, JWT_SECRET);

    // 🔐 2. Role check (admin only)
    if (decoded.role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { name, email, password, address, role } = body;

    // 🔴 3. Validation
    if (!name || !email || !password || !address) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    // email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // password rules
    if (password.length < 8 || password.length > 16) {
      return NextResponse.json(
        { error: "Password must be 8-16 characters" },
        { status: 400 }
      );
    }

    if (!/[A-Z]/.test(password)) {
      return NextResponse.json(
        { error: "Password must include uppercase letter" },
        { status: 400 }
      );
    }

    if (!/[!@#$%^&*]/.test(password)) {
      return NextResponse.json(
        { error: "Password must include special character" },
        { status: 400 }
      );
    }

    // 🔴 4. Check duplicate email
    const existing = await User.findOne({ email });

    if (existing) {
      return NextResponse.json(
        { error: "Email already exists" },
        { status: 409 }
      );
    }

    // 🔐 5. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ 6. Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      address,
      role: role || "user",
    });

    // ✅ 7. Response
    return NextResponse.json(
      {
        message: "User created successfully",
        user: sanitizeUser(user),
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Add User Error:", error);

    // mongoose validation error
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map(
        (e: any) => e.message
      );

      return NextResponse.json(
        { error: messages.join(", ") },
        { status: 400 }
      );
    }

    // duplicate key
    if (error.code === 11000) {
      return NextResponse.json(
        { error: "Email already exists" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}