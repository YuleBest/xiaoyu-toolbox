import request from './request'

export interface NcmSongAr {
  id: number
  name: string
}

export interface NcmSongAl {
  id: number
  name: string
  picUrl: string
}

export interface NcmSong {
  id: number
  name: string
  ar: NcmSongAr[]
  al: NcmSongAl
  publishTime: number
}

export interface NcmPlaylistResponse {
  songs: NcmSong[]
  code?: number
}

export interface NcmPlaylistDetail {
  id: number
  name: string
  coverImgUrl: string
  description: string | null
  playCount: number
  trackCount: number
  tags: string[]
  creator: {
    nickname: string
    avatarUrl: string
  }
}

export interface NcmPlaylistDetailResponse {
  playlist: NcmPlaylistDetail
  code?: number
}

export const getPlaylistDetail = async (id: string | number): Promise<NcmPlaylistDetail | null> => {
  try {
    const res = await request.get<NcmPlaylistDetailResponse>(
      `https://ncmapi.yule.ink/playlist/detail?id=${id}`,
    )
    if (res.data?.playlist) {
      return res.data.playlist
    }
    return null
  } catch (error) {
    console.error('Failed to fetch NCM playlist detail', error)
    throw error
  }
}

export const getPlaylistTracks = async (
  id: string | number,
  limit: number = 200,
  offset: number = 0,
): Promise<NcmSong[]> => {
  try {
    const res = await request.get<NcmPlaylistResponse>(
      `https://ncmapi.yule.ink/playlist/track/all?id=${id}&limit=${limit}&offset=${offset}`,
    )
    if (res.data?.songs) {
      return res.data.songs
    }
    return []
  } catch (error) {
    console.error('Failed to fetch NCM playlist tracks', error)
    throw error
  }
}
