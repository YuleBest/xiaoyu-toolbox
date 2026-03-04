import request from './request'

const API_PREFIX = '/api/frankfurter'

export interface FrankfurterRates {
  [currency: string]: number
}

export interface FrankfurterResponse {
  amount: number
  base: string
  date: string
  rates: FrankfurterRates
}

export interface FrankfurterTimeSeriesResponse {
  amount: number
  base: string
  start_date: string
  end_date: string
  rates: {
    [date: string]: FrankfurterRates
  }
}

export interface CurrenciesResponse {
  [code: string]: string
}

/**
 * 获取最新汇率
 * @param base 基准货币，默认 EUR
 * @param symbols 目标货币，逗号分隔，如 "USD,GBP"
 */
export async function getLatestRates(
  base?: string,
  symbols?: string,
): Promise<FrankfurterResponse> {
  const { data } = await request.get<FrankfurterResponse>(`${API_PREFIX}/latest`, {
    params: { base, symbols },
  })
  return data
}

/**
 * 获取历史汇率
 * @param date 日期，格式 YYYY-MM-DD
 * @param base 基准货币
 * @param symbols 目标货币
 */
export async function getHistoricalRates(
  date: string,
  base?: string,
  symbols?: string,
): Promise<FrankfurterResponse> {
  const { data } = await request.get<FrankfurterResponse>(`${API_PREFIX}/${date}`, {
    params: { base, symbols },
  })
  return data
}

/**
 * 获取时间序列数据
 * @param startDate 开始日期 YYYY-MM-DD
 * @param endDate 结束日期 YYYY-MM-DD
 * @param base 基准货币
 * @param symbols 目标货币
 */
export async function getTimeSeries(
  startDate: string,
  endDate: string,
  base?: string,
  symbols?: string,
): Promise<FrankfurterTimeSeriesResponse> {
  const { data } = await request.get<FrankfurterTimeSeriesResponse>(
    `${API_PREFIX}/${startDate}..${endDate}`,
    {
      params: { base, symbols },
    },
  )
  return data
}

/**
 * 获取支持的货币列表
 */
export async function getCurrencies(): Promise<CurrenciesResponse> {
  const { data } = await request.get<CurrenciesResponse>(`${API_PREFIX}/currencies`)
  return data
}
