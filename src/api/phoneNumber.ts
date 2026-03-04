export interface PhoneNumberResult {
  province: string
  city: string
  isp: string
}

interface ConfigData {
  p: string[]
  c: string[]
  i: string[]
}

let configData: ConfigData | null = null

export async function loadConfig(): Promise<ConfigData> {
  if (configData) return configData
  const res = await fetch('/database/phone_number/config.json')
  if (!res.ok) throw new Error('Failed to load phone number config')
  configData = (await res.json()) as ConfigData
  return configData
}

const dataCache = new Map<string, Record<string, number[]>>()

async function loadPrefixData(prefix3: string): Promise<Record<string, number[]> | null> {
  if (dataCache.has(prefix3)) {
    return dataCache.get(prefix3)!
  }
  try {
    const res = await fetch(`/database/phone_number/${prefix3}.json`)
    if (!res.ok) return null
    const data = (await res.json()) as Record<string, number[]>
    dataCache.set(prefix3, data)
    return data
  } catch {
    return null
  }
}

export async function lookupPhoneNumber(phone: string): Promise<PhoneNumberResult | null> {
  // 清理输入：去除空格、横杠、+86 前缀
  const cleaned = phone.replace(/[\s\-+]/g, '').replace(/^86/, '')

  if (!/^1\d{6,10}$/.test(cleaned)) {
    return null
  }

  const config = await loadConfig()

  const prefix3 = cleaned.substring(0, 3)
  const prefix7 = cleaned.substring(0, 7)

  const data = await loadPrefixData(prefix3)
  if (!data) return null

  const indices = data[prefix7]
  if (!indices) return null

  const [pIdx, cIdx, iIdx] = indices

  return {
    province: (pIdx != null ? config.p[pIdx] : undefined) ?? '未知',
    city: (cIdx != null ? config.c[cIdx] : undefined) ?? '未知',
    isp: (iIdx != null ? config.i[iIdx] : undefined) ?? '未知',
  }
}
