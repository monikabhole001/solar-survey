import { NextResponse } from "next/server";
import { surveySchema } from "@/lib/validation";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = surveySchema.safeParse(body);
    if (!parsed.success) {
      const errors = parsed.error.flatten();
      return NextResponse.json({ errors }, { status: 400 });
    }
    const verdict = Math.random() < 0.5 ? "yes" : "no";
    return NextResponse.json({ verdict });
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
}
