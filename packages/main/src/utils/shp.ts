import { parseFolder } from 'shapefile-to-geojson'

export async function readShpDir(path: string) {
  const geoJSON = await parseFolder(path)
  return geoJSON
}
