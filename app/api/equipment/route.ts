import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => request.cookies.getAll(), setAll: () => {} } }
  );

  let query = supabase
    .from("equipment")
    .select("*, owner:profiles!owner_id(*)", { count: "exact" }) as any;

  const category = searchParams.get("category");
  const minPrice = searchParams.get("minPrice");
  const maxPrice = searchParams.get("maxPrice");
  const condition = searchParams.get("condition");
  const minRating = searchParams.get("minRating");
  const onlyAvailable = searchParams.get("onlyAvailable");
  const search = searchParams.get("search");
  const sortBy = searchParams.get("sortBy") || "newest";
  const page = parseInt(searchParams.get("page") || "1");

  if (category) query = query.eq("category", category);
  if (minPrice) query = query.gte("daily_price", Number(minPrice));
  if (maxPrice) query = query.lte("daily_price", Number(maxPrice));
  if (condition) query = query.eq("condition", condition);
  if (minRating) query = query.gte("rating", Number(minRating));
  if (onlyAvailable === "true") query = query.eq("is_available", true);
  if (search) query = query.ilike("title", `%${search}%`);

  switch (sortBy) {
    case "cheapest": query = query.order("daily_price", { ascending: true }); break;
    case "expensive": query = query.order("daily_price", { ascending: false }); break;
    case "best_rated": query = query.order("rating", { ascending: false }); break;
    default: query = query.order("created_at", { ascending: false });
  }

  const from = (page - 1) * 12;
  query = query.range(from, from + 11);

  const { data, count, error } = await query;
  if (error) return NextResponse.json({ data: [], count: 0 });
  return NextResponse.json({ data: data || [], count: count || 0 });
}
