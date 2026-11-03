import { handleEnquiry } from "@/lib/enquiry";

export const runtime = "nodejs";

export async function POST(req: Request) {
  return handleEnquiry(req, "apply");
}
