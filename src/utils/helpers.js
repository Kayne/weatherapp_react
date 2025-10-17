export function unitToOWMUnit(unit) {
    if (unit === 'C') return 'metric'
    if (unit === 'F') return 'imperial'
    return null // metric, kelvin
}

export function getWindDirection(deg) {
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW']
  const index = Math.round(deg / 45) % 8
  return directions[index]
}

export function getWeatherIconUrl(icon) {
    return icon ? `https://openweathermap.org/img/wn/${icon}@2x.png` : null
}