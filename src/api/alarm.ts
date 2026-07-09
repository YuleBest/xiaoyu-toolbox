export interface AlarmItem {
  alertid: string
  issuetime: string
  title: string
  url: string
  pic: string
}

export interface AlarmListData {
  page: {
    pageNo: number
    pageSize: number
    count: number
    prev: number
    next: number
    list: AlarmItem[]
  }
}

export interface AlarmListResponse {
  code: number
  msg: string
  data: AlarmListData | null
}

export interface AlarmLists {
  signaltype: string[]
  signallevel: string[]
  province: string[]
}

export interface AlarmDetail {
  content: string
}

export interface AlarmListParams {
  pageNo?: number
  pageSize?: number
  province?: string
  signaltype?: string
  signallevel?: string
}

export async function fetchLists(): Promise<AlarmLists> {
  const res = await fetch('/database/alarm/lists.json')
  return res.json()
}

export async function fetchAlarmList(params: AlarmListParams): Promise<AlarmListResponse> {
  const sp = new URLSearchParams()
  sp.set('pageNo', String(params.pageNo ?? 1))
  sp.set('pageSize', String(params.pageSize ?? 20))
  sp.set('signaltype', params.signaltype || '')
  sp.set('signallevel', params.signallevel || '')
  sp.set('province', params.province || '')
  sp.set('_', String(Date.now()))

  const res = await fetch(`/api/alarm/list?${sp.toString()}`)
  return res.json()
}

export async function fetchAlarmDetail(url: string): Promise<AlarmDetail> {
  const res = await fetch(`/api/alarm/detail?url=${encodeURIComponent(url)}`)
  return res.json()
}
