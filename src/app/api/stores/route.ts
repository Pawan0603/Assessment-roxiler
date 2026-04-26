import { NextResponse } from "next/server";
import { Store } from "@/models/Store";
import jwt from "jsonwebtoken";
import connectDB from "@/lib/connectDB";

const JWT_SECRET = process.env.JWT_SECRET!;

// 🔒 get token from cookie
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

    const { searchParams } = new URL(req.url);

    const search = searchParams.get("search") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    const skip = (page - 1) * limit;

    // 🔐 optional auth (for owner filtering)
    let user: any = null;
    const token = getToken(req);

    if (token) {
      try {
        user = jwt.verify(token, JWT_SECRET);
      } catch {}
    }

    // 🔍 filter
    const filter: any = {};

    // 🔎 search
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { address: { $regex: search, $options: "i" } },
      ];
    }

    // 👤 if owner → only their stores
    if (user?.role === "owner") {
      filter.ownerId = user.userId;
    }

    // 📊 query
    const [stores, total] = await Promise.all([
      Store.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),

      Store.countDocuments(filter),
    ]);

    // ✅ response
    return NextResponse.json({
      stores,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get Stores Error:", error);

    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}



// ======================================= POST api for add store (owner only) =======================================

import { User } from "@/models/User";

// 🔒 get token
function GetToken(req: Request) {
  const cookie = req.headers.get("cookie") || "";
  return cookie
    .split("; ")
    .find((c) => c.startsWith("token="))
    ?.split("=")[1];
}

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

    // 🔐 2. Only admin can create store
    if (decoded.role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { name, email, address, ownerId } = body;

    // 🔴 3. Validation
    if (!name || !email || !address) {
      return NextResponse.json(
        { error: "Name, email and address are required" },
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

    // 🔴 4. Duplicate email check
    const existing = await Store.findOne({ email });

    if (existing) {
      return NextResponse.json(
        { error: "Store with this email already exists" },
        { status: 409 }
      );
    }

    // 🔴 5. Owner validation (optional)
    if (ownerId) {
      const owner = await User.findById(ownerId);

      if (!owner || owner.role !== "owner") {
        return NextResponse.json(
          { error: "Invalid owner selected" },
          { status: 400 }
        );
      }
    }

    // ✅ 6. Create store
    const store = await Store.create({
      name,
      email,
      address,
      ownerId: ownerId || null,
    });

    // ✅ 7. Response
    return NextResponse.json(
      {
        message: "Store created successfully",
        store: {
          id: store._id,
          name: store.name,
          email: store.email,
          address: store.address,
          ownerId: store.ownerId,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Add Store Error:", error);

    // mongoose validation
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
        { error: "Store already exists" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}