import { NextResponse } from "next/server";
import { User } from "@/models/User";
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

    // 🔐 Auth check
    const token = getToken(req);

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded: any = jwt.verify(token, JWT_SECRET);

    if (decoded.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // 🔥 1. Counts (parallel)
    const [totalUsers, totalStores, totalRatings] = await Promise.all([
      User.countDocuments(),
      Store.countDocuments(),
      Rating.countDocuments(),
    ]);

    // 🔥 2. Recent Users
    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select("name role");

    // 🔥 3. Recent Stores
    const stores = await Store.find()
      .sort({ createdAt: -1 })
      .limit(5);

    // 🔥 4. Attach average rating to stores
    const recentStores = await Promise.all(
      stores.map(async (store) => {
        const ratings = await Rating.find({ storeId: store._id });

        const avg =
          ratings.length > 0
            ? ratings.reduce((acc, r) => acc + r.value, 0) /
              ratings.length
            : 0;

        return {
          id: store._id,
          name: store.name,
          avgRating: Number(avg.toFixed(1)),
        };
      })
    );

    // ✅ Final response
    return NextResponse.json({
      stats: {
        totalUsers,
        totalStores,
        totalRatings,
      },
      recentUsers,
      recentStores,
    });
  } catch (error) {
    console.error("Dashboard API Error:", error);

    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}