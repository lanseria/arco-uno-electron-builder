import { extract } from 'zip-lib'

export async function unzip(unzipPath: string, destPath: string) {
  // extract a file
  await extract(unzipPath, destPath)
}
