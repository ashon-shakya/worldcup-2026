import { NextResponse } from "next/server";
import { auth } from "@/auth";
import runSendMatchEmails from "@/lib/sendMatchEmails";

export async function POST(request: Request) {
    const session = await auth();
    if (!session || (session.user as any).role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const result = await runSendMatchEmails();
        return NextResponse.json({ ok: true, result });
    } catch (err: any) {
        console.error(err);
        return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
    }
}
