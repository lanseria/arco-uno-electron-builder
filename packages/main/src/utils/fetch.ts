import { MAPBOX_SECRET_TOKEN } from './constant'
import type { S3Object } from './types'

interface UploadParams {
  name: string
  tileset: string
  bucket: string
  key: string
}

interface UploadRequestBody {
  url: string
  tileset: string
  name: string
}

interface UploadStatus {
  id: string
  name: string
  complete: boolean
  error: string | null
  created: string
  modified: string
  tileset: string
  owner: string
  progress: number
}

export async function fetchCredentials(): Promise<S3Object> {
  const data = (await fetch(`https://api.mapbox.com/uploads/v1/xuezhuhun/credentials?access_token=${MAPBOX_SECRET_TOKEN}`))
  return await data.json()
}

export async function fetchUploadStatusById(uploadId: string): Promise<UploadStatus> {
  const data = (await fetch(`https://api.mapbox.com/uploads/v1/xuezhuhun/${uploadId}?access_token=${MAPBOX_SECRET_TOKEN}`))
  return await data.json()
}

export async function pollUploadStatus(uploadId: string, interval: number, onProgress?: Function) {
  while (true) {
    const data = await fetchUploadStatusById(uploadId)

    // 检查上传进度是否为 1
    if (data.progress === 1)
      return data

    // 调用进度更新回调函数
    if (onProgress && typeof onProgress === 'function')
      onProgress(data.progress)
    console.warn('process: ', JSON.stringify(data))
    // 等待指定的时间间隔后再次查询上传状态信息
    await new Promise(resolve => setTimeout(resolve, interval))
  }
}

export async function uploadTileset(uploadParams: UploadParams): Promise<UploadStatus> {
  const uploadData: UploadRequestBody = {
    url: `http://${uploadParams.bucket}.s3.amazonaws.com/${uploadParams.key}`,
    tileset: uploadParams.tileset,
    name: uploadParams.name,
  }
  const url = `https://api.mapbox.com/uploads/v1/xuezhuhun?access_token=${MAPBOX_SECRET_TOKEN}`
  const headers = {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache',
  }
  const body = JSON.stringify(uploadData)
  const response = await fetch(url, {
    method: 'POST',
    headers,
    body,
  })
  return await response.json()
}

export async function fetchCityJson() {
  const url = 'https://jihulab.com/data1355712/digital-cartography/-/raw/main/places_min.json'
  try {
    const response = await fetch(url)
    const data = await response.json()
    return {
      code: 0,
      data,
    }
  }
  catch (err) {
    return {
      code: 1,
      msg: err,
    }
  }
}
