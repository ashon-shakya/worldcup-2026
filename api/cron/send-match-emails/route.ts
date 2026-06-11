import { NextResponse } from "next/server";
import runSendMatchEmails from "@/lib/sendMatchEmails";

export async function GET(request: Request) {
    // Vercel Cron requests include header x-vercel-cron: true
    const isCron = request.headers.get("x-vercel-cron");
    if (!isCron && process.env.NODE_ENV === "production") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    try {
        const result = await runSendMatchEmails();
        return NextResponse.json({ ok: true, result });
    } catch (err: any) {
        console.error(err);
        return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
    }
}
