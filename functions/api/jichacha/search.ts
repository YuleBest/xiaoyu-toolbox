import { PagesFunction } from "@cloudflare/workers-types";

interface Env {
  DB: D1Database;
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const { searchParams } = new URL(context.request.url);

  // 1. 获取通用关键词和分页参数
  const q = searchParams.get("q");
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "100");
  const offset = (page - 1) * limit;

  // 2. 获取特定字段参数 (对应表中的列名)
  const filterParams = [
    "model",
    // "dtype", // dtype 单独处理
    "brand",
    "code",
    "code_alias",
    "model_name",
    "ver_name",
  ];
  const dtypeParam = searchParams.get("dtype");

  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Content-Type": "application/json; charset=utf-8",
  };

  try {
    let whereClause = "WHERE 1=1";
    const bindings: any[] = [];

    // A. 处理通用关键词搜索 (对多个列进行 OR 匹配)
    if (q) {
      whereClause += ` AND (
        model LIKE ? OR 
        code LIKE ? OR 
        code_alias LIKE ? OR 
        model_name LIKE ?
      )`;
      bindings.push(`%${q}%`, `%${q}%`, `%${q}%`, `%${q}%`);
    }

    // B. 处理特定字段的精准/模糊搜索 (不含 dtype)
    for (const param of filterParams) {
      const val = searchParams.get(param);
      if (val) {
        whereClause += ` AND ${param} LIKE ?`;
        bindings.push(`%${val}%`);
      }
    }

    // C. 获取聚合信息 (基于当前搜索条件，但在应用 dtype 筛选之前)
    // 这样当用户选择了 dtype=phone 时，依然能看到 pad=5, watch=2 等信息
    const dtypeQuery = `SELECT dtype, COUNT(*) as count FROM phone_models ${whereClause} GROUP BY dtype ORDER BY count DESC`;
    const { results: dtypes } = await context.env.DB.prepare(dtypeQuery)
      .bind(...bindings)
      .all();

    // D. 应用 dtype 筛选 (用于后续的数据查询和总数计算)
    if (dtypeParam) {
      whereClause += ` AND dtype = ?`;
      bindings.push(dtypeParam);
    }

    // E. 获取总数
    const countQuery = `SELECT COUNT(*) as total FROM phone_models ${whereClause}`;
    const totalResult = await context.env.DB.prepare(countQuery)
      .bind(...bindings)
      .first();
    const total = totalResult?.total || 0;

    // F. 获取数据 (分页)
    const dataQuery = `SELECT * FROM phone_models ${whereClause} ORDER BY id DESC LIMIT ? OFFSET ?`;
    // 注意：bind 时需要追加 limit 和 offset，但不能修改原 bindings 数组，因为上面 countQuery 还需要用
    const { results } = await context.env.DB.prepare(dataQuery)
      .bind(...bindings, limit, offset)
      .all();

    return new Response(
      JSON.stringify({
        success: true,
        page,
        limit,
        total,
        dtypes, // 返回聚合的 dtype 统计
        results: results,
      }),
      { headers: corsHeaders },
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: "搜索失败", detail: err.message }),
      { status: 500, headers: corsHeaders },
    );
  }
};
