import { NextResponse } from "next/server";

export function jsonOk<T>(data: T, status = 200): NextResponse<T> {
  return NextResponse.json(data, { status });
}

export function jsonError(message: string, status = 400, code = "BAD_REQUEST"): NextResponse<{ error: { code: string; message: string } }> {
  return NextResponse.json({ error: { code, message } }, { status });
}

export async function readJson<T>(request: Request): Promise<T> {
  return (await request.json()) as T;
}