import { writeFile } from 'node:fs/promises'
import { existsSync, lstatSync, readdirSync, rmdirSync, unlinkSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { nanoid } from 'nanoid'

// 获取系统的临时文件夹路径
const tempDir = tmpdir()

export async function createTempFile(data: any, ext = 'geojson') {
  // 生成一个随机的文件名
  const randomFilename = `${nanoid(5)}.${ext}`

  // 构造临时文件的完整路径
  const tempFilePath = join(tempDir, randomFilename)

  // 使用 fs.writeFile 将字符串写入文件
  await writeFile(tempFilePath, data)
  console.warn('GeoJSON 文件已保存到临时文件夹：', tempFilePath)
  return tempFilePath
}

export function deleteFolder(folderPath: string): void {
  if (existsSync(folderPath)) {
    readdirSync(folderPath).forEach((file) => {
      const curPath = `${folderPath}/${file}`

      if (lstatSync(curPath).isDirectory())
        deleteFolder(curPath) // 递归删除子文件夹
      else
        unlinkSync(curPath) // 删除文件
    })

    rmdirSync(folderPath) // 删除空文件夹
    console.warn(`Folder ${folderPath} deleted successfully.`)
  }
  else {
    console.warn(`Folder ${folderPath} does not exist.`)
  }
}
