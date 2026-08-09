import { NextResponse } from "next/server";

export class ApiError extends Error {
  status: number;
  details?: unknown;
  constructor(message: string, status = 500, details?: unknown) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

export function jsonSuccess<T extends Record<string, unknown>>(data: T, status = 200) {
  return NextResponse.json({ success: true, ...data }, { status });
}

export function jsonError(message: string, status = 500, details?: unknown) {
  return NextResponse.json({ success: false, error: message, details }, { status });
}

export function handleApiError(error: unknown) {
  console.error(error);
  if (error instanceof ApiError) return jsonError(error.message, error.status, error.details);
  if (error instanceof Error) return jsonError(error.message, 500);
  return jsonError("Internal server error", 500);
}
