import axios from 'axios'

const API_KEY = import.meta.env.VITE_OPEN_WEATHER_API_KEY
const BASE = 'https://api.openweathermap.org/data/2.5'
const DEFAULT_UNITS = 'metric'

export async function fetchCurrentByCityName(name, units = DEFAULT_UNITS) {
    const res = await axios.get(`${BASE}/weather`, { params: { q: name, appid: API_KEY, units } })
    return res.data
}

export async function fetchCurrentByCityId(id, units = DEFAULT_UNITS) {
    const res = await axios.get(`${BASE}/weather`, { params: { id: id, appid: API_KEY, units } })
    console.log({ params: { id: id, appid: API_KEY, units } })
    console.log(res.data)
    return res.data
}

export async function fetch5dayForecastByCoords(lat, lon, units = DEFAULT_UNITS) {
    const res = await axios.get(`${BASE}/forecast`, { params: { lat, lon, appid: API_KEY, units } })
    return res.data
}