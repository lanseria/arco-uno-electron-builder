import { basename } from 'node:path'
import type { FileFilter } from 'electron'
import { dialog } from 'electron'
import { nanoid } from 'nanoid'
import { pinyin } from 'pinyin-pro'
import { fetchCredentials, pollUploadStatus, uploadTileset } from './fetch'
import { s3Run } from './s3Run'
import type { S3Object } from './types'
import { readKmlFile } from './geojson'
import { createTempFile } from './file'

export async function getAwsCredentials() {
  try {
    const data = await fetchCredentials()
    return data
  }
  catch (err: any) {
    return {
      code: 1,
      msg: err.message,
    }
  }
}

export async function uploadMapboxStudioFile(filters: FileFilter[], params: S3Object) {
  console.warn('aws file uploadFile:', params)
  const { canceled, filePaths } = await dialog.showOpenDialog({
    filters,
  })
  if (canceled) {
    return {
      code: 1,
      msg: '用户取消了操作',
    }
  }
  // 选了文件
  else {
    try {
      const awsResults = await s3Run(filePaths, params)
      const fileName = basename(filePaths[0])
      if (awsResults.$metadata.httpStatusCode === 200) {
        const id = nanoid(5)
        const pinyinName = pinyin(fileName, { toneType: 'none', type: 'array' }).join('')
        console.warn('pinyinName: ', pinyinName)
        const mapboxResults = await uploadTileset({
          name: pinyinName,
          tileset: `xuezhuhun.${id}`,
          bucket: params.bucket,
          key: params.key,
        })
        console.warn('mapboxResults: ', mapboxResults)
        const res = await pollUploadStatus(mapboxResults.id, 1000)
        return {
          code: 0,
          data: res,
        }
      }
      else {
        return {
          code: 1,
          data: awsResults,
        }
      }
    }
    catch (err: any) {
      console.warn('upload error: ', err.message)
      return {
        code: 1,
        msg: err.message,
      }
    }
  }
}

export async function uploadTIFFile(params: S3Object) {
  return await uploadMapboxStudioFile([
    { name: 'TIF Files', extensions: ['tif'] },
  ], params)
}
export async function uploadKMLFile(params: S3Object) {
  console.warn('uploadKMLFile first trans to geojson file')
  const { code, data, msg, extra } = await readKmlFile()
  if (code) {
    return {
      code,
      msg,
    }
  }
  // 选了文件
  else {
    try {
      console.warn('uploadKMLFile createTempFile')
      const tempFilePath = await createTempFile(JSON.stringify(data))
      console.warn(tempFilePath)
      const awsResults = await s3Run([tempFilePath], params)
      const fileName = basename(tempFilePath)
      if (awsResults.$metadata.httpStatusCode === 200) {
        const id = nanoid(5)
        const mapboxResults = await uploadTileset({
          name: `${extra}-${fileName}`,
          tileset: `xuezhuhun.${id}`,
          bucket: params.bucket,
          key: params.key,
        })
        console.warn('mapboxResults: ', mapboxResults)
        const res = await pollUploadStatus(mapboxResults.id, 1000)
        return {
          code: 0,
          data: { ...res, extra },
        }
      }
      else {
        return {
          code: 1,
          data: awsResults,
        }
      }
    }
    catch (err: any) {
      console.warn('upload error: ', err.message)
      return {
        code: 1,
        msg: err.message,
      }
    }
  }
}
