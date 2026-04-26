import { NextResponse } from "next/server";
import { Store } from "@/models/Store";
import { Rating } from "@/models/Rating";
import { User } from "@/models/User";
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

    // 🔐 Auth
    const token = getToken(req);
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded: any = jwt.verify(token, JWT_SECRET);

    if (decoded.role !== "owner") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const ownerId = decoded.userId;

    // 🔥 1. Owner stores
    const stores = await Store.find({ ownerId });

    const storeIds = stores.map((s) => s._id);

    // 🔥 2. Ratings of these stores
    const ratings = await Rating.find({
      storeId: { $in: storeIds },
    });

    // 🔥 3. Stats
    const totalStores = stores.length;
    const totalRatings = ratings.length;

    const overallAvg =
      totalRatings > 0
        ? ratings.reduce((acc, r) => acc + r.value, 0) / totalRatings
        : 0;

    // 🔥 4. Stores with rating info
    const storesWithStats = stores.map((store) => {
      const storeRatings = ratings.filter(
        (r) => r.storeId.toString() === store._id.toString()
      );

      const avg =
        storeRatings.length > 0
          ? storeRatings.reduce((acc, r) => acc + r.value, 0) /
            storeRatings.length
          : 0;

      return {
        id: store._id,
        name: store.name,
        address: store.address,
        avgRating: Number(avg.toFixed(2)),
        totalRatings: storeRatings.length,
      };
    });

    // 🔥 5. Ratings table (join user + store)
    const ratingsTable = await Promise.all(
      ratings.map(async (r) => {
        const user = await User.findById(r.userId).select("name email");
        const store = stores.find(
          (s) => s._id.toString() === r.storeId.toString()
        );

        return {
          id: r._id,
          value: r.value,
          user: {
            name: user?.name || "—",
            email: user?.email || "—",
          },
          store: {
            name: store?.name || "—",
          },
        };
      })
    );

    return NextResponse.json({
      stats: {
        totalStores,
        totalRatings,
        averageRating: Number(overallAvg.toFixed(2)),
      },
      stores: storesWithStats,
      ratings: ratingsTable,
    });
  } catch (error) {
    console.error("Owner Dashboard Error:", error);

    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}