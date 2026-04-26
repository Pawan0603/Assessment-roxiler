import { NextResponse } from "next/server";
import { User } from "@/models/User";
import bcrypt from "bcryptjs";
import connectDB from "@/lib/connectDB";

// 🔥 helper: clean response (never send password)
const sanitizeUser = (user: any) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  address: user.address,
});

export async function POST(req: Request) {
  try {
    await connectDB();

    const body = await req.json();

    const { name, email, password, address } = body;

    // 🔴 1. Basic validation
    if (!name || !email || !password || !address) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    // 🔴 2. Email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // 🔴 3. Password validation
    if (password.length < 8 || password.length > 16) {
      return NextResponse.json(
        { error: "Password must be 8-16 characters" },
        { status: 400 }
      );
    }

    if (!/[A-Z]/.test(password)) {
      return NextResponse.json(
        { error: "Password must include an uppercase letter" },
        { status: 400 }
      );
    }

    if (!/[!@#$%^&*]/.test(password)) {
      return NextResponse.json(
        { error: "Password must include a special character" },
        { status: 400 }
      );
    }

    // 🔴 4. Check existing user
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email already registered" },
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
      role: "user",
    });

    // ✅ 7. Response (safe)
    return NextResponse.json(
      {
        message: "User created successfully",
        user: sanitizeUser(user),
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Signup Error:", error);

    // 🔥 mongoose validation error
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map(
        (err: any) => err.message
      );

      return NextResponse.json(
        { error: messages.join(", ") },
        { status: 400 }
      );
    }

    // 🔥 duplicate key
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