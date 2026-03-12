import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { getJob } from "@/lib/llm/jobs";
import { authOptions } from "@/utils/auth-options";
import type { LlmJobRequest, LlmJobResponse } from "@/lib/llm/types";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json<LlmJobResponse>(
      { result: null, error: "Unauthorized" },
      { status: 401 },
    );
  }

  const body = (await req.json()) as LlmJobRequest;
  const { job: jobName, payload } = body;

  const job = getJob(jobName);

  if (!job) {
    return NextResponse.json<LlmJobResponse>(
      { result: null, error: `Unknown job: ${jobName}` },
      { status: 400 },
    );
  }

  try {
    const result = await job.run(payload);
    return NextResponse.json<LlmJobResponse>({ result });
  } catch (err) {
    console.error(`[llm] Job "${jobName}" failed:`, err);
    return NextResponse.json<LlmJobResponse>(
      { result: null, error: "Job execution failed" },
      { status: 500 },
    );
  }
}
