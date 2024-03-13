import { mkdir, readFile, stat, writeFile } from 'node:fs/promises'
import * as path from 'node:path'
import { dialog } from 'electron'
import * as tj from '@mapbox/togeojson'
import { DOMParser } from '@xmldom/xmldom'
import type { Feature } from '@turf/turf'
import { unzip } from './zip'
import { readShpDir } from './shp'
import { deleteFolder } from './file'

function padZero(num: number) {
  return num.toString().padStart(2, '0')
}
function formatDate(date: Date) {
  const year = date.getFullYear()
  const month = padZero(date.getMonth() + 1)
  const day = padZero(date.getDate())
  const hours = padZero(date.getHours())
  const minutes = padZero(date.getMinutes())
  const seconds = padZero(date.getSeconds())

  return `${year}-${month}-${day}_${hours}:${minutes}:${seconds}`
}

function checkFeatureType(features: Feature<any, any>[]): 'Point' | 'LineString' | 'Polygon' {
  function findMaxValueKey(obj: Record<'Point' | 'LineString' | 'Polygon', number>) {
    const entries = Object.entries(obj)

    const maxValueEntry = entries.reduce((maxEntry, currentEntry) => {
      if (currentEntry[1] > maxEntry[1])
        return currentEntry
      else
        return maxEntry
    })

    return maxValueEntry[0]
  }
  if (features.length === 0)
    throw new Error('Feature数组为空')

  const typeMap: any = {}
  for (let i = 1; i < features.length; i++) {
    if (typeMap[features[i].geometry.type]) {
      //
      typeMap[features[i].geometry.type]++
    }
    else {
      //
      typeMap[features[i].geometry.type] = 1
    }
    // if (features[i].geometry.type !== type)
    // throw new Error('Feature类型不一致')
  }
  return findMaxValueKey(typeMap) as 'Point' | 'LineString' | 'Polygon'
}

export function geojsonFileFeatureType(geojson: any) {
  if (geojson.features.length === 1)
    return geojson.features[0].geometry.type

  else if (geojson.features.length > 1)
    return checkFeatureType(geojson.features)
}

function kmlToGeosjon(data: string) {
  // 读取KML文件
  const kml = new DOMParser().parseFromString(data)

  // 转换为GeoJSON
  const converted = tj.kml(kml)
  return converted
}

export async function readKmlFile() {
  const filters = [
    { name: 'KML Files', extensions: ['kml'] },
  ]
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
    const data = await readFile(filePaths[0], 'utf8')
    const fileName = path.basename(filePaths[0])
    const fileInfo = await stat(filePaths[0])
    const converted = kmlToGeosjon(data)
    const type = geojsonFileFeatureType(converted)
    // const type = 'Polygon'
    return {
      code: 0,
      data: {
        converted,
        fileName,
        lastModified: formatDate(fileInfo.mtime),
      },
      extra: type,
    }
  }
}

export async function readShpFile() {
  const filters = [
    { name: 'Shp Files Zip', extensions: ['zip'] },
  ]
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
    const filePath = filePaths[0]
    const directoryPath = path.dirname(filePath)
    const fileName = path.basename(filePath)
    const newPath = path.join(directoryPath, './shp-file/')
    try {
      await mkdir(newPath, { recursive: true })
      await unzip(filePath, newPath)
      const converted = await readShpDir(newPath)
      const fileInfo = await stat(filePath)
      const type = geojsonFileFeatureType(converted)

      return {
        code: 0,
        data: {
          converted,
          fileName,
          lastModified: formatDate(fileInfo.mtime),
        },
        extra: type,
      }
    }
    catch (error) {
      return {
        code: 1,
        msg: `解压失败: ${error}`,
      }
    }
    finally {
      deleteFolder(newPath)
    }
  }
}

export async function b2eKmlToGeosjon(data: string) {
  // 转换为GeoJSON
  const converted = kmlToGeosjon(data)
  return {
    code: 0,
    data: converted,
  }
}

export async function uploadKMLFileToGeojson() {
  const { code, data, msg } = await readKmlFile()
  if (code === 1) {
    return {
      code,
      msg,
    }
  }
  else {
    return {
      code,
      data,
    }
  }
}

export async function uploadShpFileToGeojson() {
  const { code, data, msg } = await readShpFile()
  if (code === 1) {
    return {
      code,
      msg,
    }
  }
  else {
    return {
      code,
      data,
    }
  }
}

export async function downloadKMLFileToGeojson() {
  const { code, data, msg } = await readKmlFile()
  if (code === 1) {
    return {
      code,
      msg,
    }
  }
  else {
    // 处理GeoJSON数据
    // 将 geojson 对象转换为字符串
    const geojsonString = JSON.stringify(data)

    // 使用 dialog.showSaveDialog 方法显示保存文件对话框
    const { canceled, filePath } = await dialog.showSaveDialog({
      filters: [
        { name: 'GeoJSON', extensions: ['geojson'] },
        { name: 'All Files', extensions: ['*'] },
      ],
    })
    if (!canceled) {
      // 使用 fs.writeFile 将字符串写入文件

      try {
        if (filePath)
          await writeFile(path.resolve(filePath), geojsonString)
        return {
          code: 0,
          data,
        }
      }
      catch (err) {
        return {
          code: 1,
          data: err,
        }
      }
    }

    return {
      code,
      data,
    }
  }
}
