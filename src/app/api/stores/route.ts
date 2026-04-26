import { NextResponse } from "next/server";
import { Store } from "@/models/Store";
import { Rating } from "@/models/Rating";
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

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { address: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    // 👤 owner → only their stores
    if (user?.role === "owner") {
      filter.ownerId = user.userId;
    }

    // 📊 get stores
    const [stores, total] = await Promise.all([
      Store.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),

      Store.countDocuments(filter),
    ]);

    // 🔥 attach avg rating
    const storesWithAvg = await Promise.all(
      stores.map(async (store) => {
        const ratings = await Rating.find({ storeId: store._id });

        const avg =
          ratings.length > 0
            ? ratings.reduce((acc, r) => acc + r.value, 0) /
              ratings.length
            : 0;

        return {
          _id: store._id,
          name: store.name,
          email: store.email,
          address: store.address,
          ownerId: store.ownerId,
          avgRating: Number(avg.toFixed(2)),
        };
      })
    );

    return NextResponse.json({
      stores: storesWithAvg,
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