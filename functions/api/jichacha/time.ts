import { PagesFunction } from "@cloudflare/workers-types";

export const onRequest: PagesFunction = async () => {
  const url =
    "https://raw.githubusercontent.com/YuleBest/MobileModels-SQL/refs/heads/master/update_time.txt";
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Content-Type": "text/plain; charset=utf-8",
  };

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch update time: ${response.statusText}`);
    }
    const text = await response.text();
    return new Response(text, {
      headers: {
        ...corsHeaders,
        "Cache-Control": "public, max-age=60", // Short cache for update time
      },
    });
  } catch (err: any) {
    return new Response(`Error: ${err.message}`, {
      status: 500,
      headers: corsHeaders,
    });
  }
};
