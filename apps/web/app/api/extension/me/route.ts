import { validateBearerToken } from "@/lib/extension-auth";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders });
}

export async function GET(request: Request) {
  const result = await validateBearerToken(request);
  if (!result) {
    return Response.json(
      { error: "unauthorized" },
      { status: 401, headers: corsHeaders },
    );
  }
  return Response.json({ user: result.user }, { headers: corsHeaders });
}
