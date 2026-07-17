export const nigeriaBoundary = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      id: 'NGA',
      properties: { name: 'Nigeria' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [8.500288, 4.771983], [7.462108, 4.412108], [7.082596, 4.464689],
          [6.698072, 4.240594], [5.898173, 4.262453], [5.362805, 4.887971],
          [5.033574, 5.611802], [4.325607, 6.270651], [3.57418, 6.2583],
          [2.691702, 6.258817], [2.749063, 7.870734], [2.723793, 8.506845],
          [2.912308, 9.137608], [3.220352, 9.444153], [3.705438, 10.06321],
          [3.60007, 10.332186], [3.797112, 10.734746], [3.572216, 11.327939],
          [3.61118, 11.660167], [3.680634, 12.552903], [3.967283, 12.956109],
          [4.107946, 13.531216], [4.368344, 13.747482], [5.443058, 13.865924],
          [6.445426, 13.492768], [6.820442, 13.115091], [7.330747, 13.098038],
          [7.804671, 13.343527], [9.014933, 12.826659], [9.524928, 12.851102],
          [10.114814, 13.277252], [10.701032, 13.246918], [10.989593, 13.387323],
          [11.527803, 13.32898], [12.302071, 13.037189], [13.083987, 13.596147],
          [13.318702, 13.556356], [13.995353, 12.461565], [14.181336, 12.483657],
          [14.577178, 12.085361], [14.468192, 11.904752], [14.415379, 11.572369],
          [13.57295, 10.798566], [13.308676, 10.160362], [13.1676, 9.640626],
          [12.955468, 9.417772], [12.753672, 8.717763], [12.218872, 8.305824],
          [12.063946, 7.799808], [11.839309, 7.397042], [11.745774, 6.981383],
          [11.058788, 6.644427], [10.497375, 7.055358], [10.118277, 7.03877],
          [9.522706, 6.453482], [9.233163, 6.444491], [8.757533, 5.479666],
          [8.500288, 4.771983],
        ]],
      },
    },
  ],
}

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

export const nigeriaBounds = [[2.2, 3.8], [15.1, 14.25]]
