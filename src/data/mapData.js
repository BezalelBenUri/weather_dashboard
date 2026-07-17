export const mapHubs = {
  type: 'FeatureCollection',
  features: [
    { type: 'Feature', properties: { name: 'Kaduna Hub', shortName: 'Kaduna', status: 'favorable', temperature: '24°C', weather: 'Light Rain' }, geometry: { type: 'Point', coordinates: [7.4165, 10.5105] } },
    { type: 'Feature', properties: { name: 'Bayelsa Hub', shortName: 'Bayelsa', status: 'favorable', temperature: '26°C', weather: 'Cloudy' }, geometry: { type: 'Point', coordinates: [6.2642, 4.9247] } },
    { type: 'Feature', properties: { name: 'Cross River Hub', shortName: 'Calabar', status: 'caution', temperature: '25°C', weather: 'Thunderstorms' }, geometry: { type: 'Point', coordinates: [8.3417, 4.9757] } },
    { type: 'Feature', properties: { name: 'Kano (Potential)', shortName: 'Kano', status: 'caution', temperature: '23°C', weather: 'Moderate Rain' }, geometry: { type: 'Point', coordinates: [8.592, 12.0022] } },
    { type: 'Feature', properties: { name: 'Maiduguri (Potential)', shortName: 'Maiduguri', status: 'unfavorable', temperature: '22°C', weather: 'Strong Winds' }, geometry: { type: 'Point', coordinates: [13.1571, 11.8469] } },
  ],
}

export const mapCorridors = {
  type: 'FeatureCollection',
  features: [
    { type: 'Feature', properties: { code: 'KAD–ABV', risk: 18, status: 'favorable', label: 'Kaduna → Abuja' }, geometry: { type: 'LineString', coordinates: [[7.4165, 10.5105], [7.3986, 9.0765]] } },
    { type: 'Feature', properties: { code: 'BYL–CBR', risk: 42, status: 'caution', label: 'Bayelsa → Calabar' }, geometry: { type: 'LineString', coordinates: [[6.2642, 4.9247], [7.16, 4.76], [8.3417, 4.9757]] } },
    { type: 'Feature', properties: { code: 'KAN–MDG', risk: 74, status: 'unfavorable', label: 'Kano → Maiduguri' }, geometry: { type: 'LineString', coordinates: [[8.592, 12.0022], [10.5, 11.75], [13.1571, 11.8469]] } },
    { type: 'Feature', properties: { code: 'LOS–IBD', risk: 12, status: 'favorable', label: 'Lagos → Ibadan' }, geometry: { type: 'LineString', coordinates: [[3.3792, 6.5244], [3.947, 7.3775]] } },
  ],
}

function interpolateRoute(coordinates, progress) {
  const segments = coordinates.slice(1).map((coordinate, index) => ({
    from: coordinates[index],
    to: coordinate,
    length: Math.hypot(coordinate[0] - coordinates[index][0], coordinate[1] - coordinates[index][1]),
  }))
  const totalLength = segments.reduce((sum, segment) => sum + segment.length, 0)
  let remaining = ((progress % 1) + 1) % 1 * totalLength

  for (const segment of segments) {
    if (remaining <= segment.length) {
      const ratio = segment.length ? remaining / segment.length : 0
      return [
        segment.from[0] + (segment.to[0] - segment.from[0]) * ratio,
        segment.from[1] + (segment.to[1] - segment.from[1]) * ratio,
      ]
    }
    remaining -= segment.length
  }

  return coordinates.at(-1)
}

export function createCorridorTraffic(progress = 0) {
  const vehicleOffsets = [0, .48]
  const trailOffsets = [0, .012, .026, .043]

  return {
    type: 'FeatureCollection',
    features: mapCorridors.features.flatMap((corridor, routeIndex) => (
      vehicleOffsets.flatMap((vehicleOffset, vehicleIndex) => (
        trailOffsets.map((trailOffset, trailIndex) => ({
          type: 'Feature',
          properties: {
            code: corridor.properties.code,
            status: corridor.properties.status,
            strength: 1 - trailIndex * .23,
            head: trailIndex === 0 ? 1 : 0,
            vehicle: `${routeIndex}-${vehicleIndex}`,
          },
          geometry: {
            type: 'Point',
            coordinates: interpolateRoute(corridor.geometry.coordinates, progress + vehicleOffset - trailOffset),
          },
        }))
      ))
    )),
  }
}

export const alertZones = {
  type: 'FeatureCollection',
  features: [
    { type: 'Feature', properties: { title: 'Strong Winds', status: 'unfavorable', radius: 34 }, geometry: { type: 'Point', coordinates: [12.5, 12.1] } },
    { type: 'Feature', properties: { title: 'Moderate Rainfall', status: 'caution', radius: 40 }, geometry: { type: 'Point', coordinates: [8.2, 11.5] } },
    { type: 'Feature', properties: { title: 'Thunderstorms', status: 'caution', radius: 42 }, geometry: { type: 'Point', coordinates: [8.3, 5.15] } },
  ],
}

const weatherSeeds = [
  [12.9, 12.0, .88], [12.2, 11.45, .72], [10.4, 11.75, .46],
  [8.5, 11.75, .78], [7.7, 11.1, .58], [9.2, 9.8, .36],
  [10.2, 7.7, .34], [9.1, 6.8, .44], [8.35, 5.25, .9],
  [7.7, 4.9, .69], [6.8, 5.2, .48], [5.2, 6.4, .27],
]

export function createWeatherCells(phase = 0) {
  return {
    type: 'FeatureCollection',
    features: weatherSeeds.flatMap(([longitude, latitude, intensity], index) => (
      Array.from({ length: 6 }, (_, cellIndex) => {
        const angle = index * 1.71 + cellIndex * 1.23 + phase * .08
        const spread = cellIndex === 0 ? 0 : .1 + (cellIndex % 3) * .105
        const cellIntensity = intensity * (1 - cellIndex * .055) + Math.sin(phase + index * .85 + cellIndex * .42) * .1
        return {
          type: 'Feature',
          properties: {
            intensity: Math.max(.1, Math.min(1, cellIntensity)),
          },
          geometry: {
            type: 'Point',
            coordinates: [
              longitude + Math.cos(angle) * spread + Math.sin(phase * .32 + index) * .055,
              latitude + Math.sin(angle) * spread * .72 + Math.cos(phase * .27 + index * .7) * .04,
            ],
          },
        }
      })
    )),
  }
}

export const nigeriaBounds = [[2.55, 4.13], [14.82, 14.02]]
