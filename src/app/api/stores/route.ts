import { NextResponse } from "next/server";
import { Store } from "@/models/Store";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
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

    // 🔐 user decode (optional)
    let user: any = null;
    const token = getToken(req);

    if (token) {
      try {
        user = jwt.verify(token, JWT_SECRET);
      } catch {}
    }

    // 🔥 IMPORTANT: convert to string for safe compare
    const userIdStr = user?.userId ? String(user.userId) : null;

    // 🔍 filter
    const match: any = {};

    if (search) {
      match.$or = [
        { name: { $regex: search, $options: "i" } },
        { address: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    // 👤 owner filter
    if (user?.role === "owner") {
      match.ownerId = new mongoose.Types.ObjectId(user.userId);
    }

    // 🔥 AGGREGATION PIPELINE
    const stores = await Store.aggregate([
      { $match: match },

      // 🔗 join ratings
      {
        $lookup: {
          from: "ratings",
          localField: "_id",
          foreignField: "storeId",
          as: "ratings",
        },
      },

      // ⭐ average rating
      {
        $addFields: {
          avgRating: {
            $cond: [
              { $gt: [{ $size: "$ratings" }, 0] },
              { $avg: "$ratings.value" },
              0,
            ],
          },
        },
      },

      // 👤 user's rating (FIXED 🔥)
      {
        $addFields: {
          myRating: userIdStr
            ? {
                $let: {
                  vars: {
                    my: {
                      $filter: {
                        input: "$ratings",
                        as: "r",
                        cond: {
                          $eq: [
                            { $toString: "$$r.userId" },
                            userIdStr,
                          ],
                        },
                      },
                    },
                  },
                  in: {
                    $cond: [
                      { $gt: [{ $size: "$$my" }, 0] },
                      { $arrayElemAt: ["$$my.value", 0] },
                      null,
                    ],
                  },
                },
              }
            : null,
        },
      },

      // 🎯 clean response
      {
        $project: {
          name: 1,
          email: 1,
          address: 1,
          ownerId: 1,
          avgRating: { $round: ["$avgRating", 2] },
          myRating: 1,
        },
      },

      { $sort: { createdAt: -1 } },
    ]);

    return NextResponse.json({ stores });
  } catch (error) {
    console.error("Stores API Error:", error);

    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}