import { MAPBOX_SECRET_TOKEN } from './constant'

// Here's the code to delete a Mapbox tileset using the Mapbox API and fetch:
export async function deleteTileset(tilesetId: string) {
  const response = await fetch(`https://api.mapbox.com/tilesets/v1/${tilesetId}?access_token=${MAPBOX_SECRET_TOKEN}`, {
    method: 'DELETE',
  })
  const json = await response.json()
  return json
}
