import { NextResponse } from "next/server";
import { Rating } from "@/models/Rating";
import { Store } from "@/models/Store";
import jwt from "jsonwebtoken";
import connectDB from "@/lib/connectDB";

const JWT_SECRET = process.env.JWT_SECRET!;

// 🔒 get token
function getToken(req: Request) {
  const cookie = req.headers.get("cookie") || "";
  return cookie
    .split("; ")
    .find((c) => c.startsWith("token="))
    ?.split("=")[1];
}

export async function POST(req: Request) {
  try {
    await connectDB();

    // 🔐 1. Auth
    const token = getToken(req);

    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const decoded: any = jwt.verify(token, JWT_SECRET);

    if (decoded.role !== "user") {
      return NextResponse.json(
        { error: "Only users can rate stores" },
        { status: 403 }
      );
    }

    const userId = decoded.userId;

    // 🔴 2. Body
    const { storeId, value } = await req.json();

    if (!storeId || value == null) {
      return NextResponse.json(
        { error: "StoreId and rating value required" },
        { status: 400 }
      );
    }

    // 🔴 3. Validate rating
    if (value < 1 || value > 5) {
      return NextResponse.json(
        { error: "Rating must be between 1 and 5" },
        { status: 400 }
      );
    }

    // 🔴 4. Check store exists
    const store = await Store.findById(storeId);

    if (!store) {
      return NextResponse.json(
        { error: "Store not found" },
        { status: 404 }
      );
    }

    // 🔥 5. Upsert rating (IMPORTANT)
    const existing = await Rating.findOne({ userId, storeId });

    let rating;

    if (existing) {
      // 🔁 update
      existing.value = value;
      await existing.save();
      rating = existing;
    } else {
      // ➕ create
      rating = await Rating.create({
        userId,
        storeId,
        value,
      });
    }

    // 🔥 6. Calculate new average
    const ratings = await Rating.find({ storeId });

    const avg =
      ratings.length > 0
        ? ratings.reduce((acc, r) => acc + r.value, 0) /
          ratings.length
        : 0;

    // ✅ 7. Response
    return NextResponse.json({
      message: existing ? "Rating updated" : "Rating added",
      rating: {
        id: rating._id,
        value: rating.value,
      },
      avgRating: Number(avg.toFixed(2)),
    });
  } catch (error) {
    console.error("Rate Store Error:", error);

    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}