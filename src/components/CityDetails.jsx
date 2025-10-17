import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { fetch5dayForecastByCoords, fetchCurrentByCityId as fetchCurrentByCityId } from '../api/openweather'
import { useSelector } from 'react-redux'
import { unitToOWMUnit, getWindDirection, getWeatherIconUrl } from '../utils/helpers'


export default function CityDetails() {
  const { id } = useParams()
  const unit = useSelector(s => s.weather.unit)
  const [current, setCurrent] = useState(null)
  const [forecast, setForecast] = useState(null)
  const [error, setError] = useState(null)


  useEffect(() => {
    let mounted = true
    async function load() {
      setError(null)
      try {
        const u = unitToOWMUnit(unit)
        const cur = await fetchCurrentByCityId(id, u)
        if (!mounted) return
        setCurrent(cur)
        const f = await fetch5dayForecastByCoords(cur.coord.lat, cur.coord.lon, u)
        const byDate = {}

        f.list.forEach(entry => {
          const date = new Date(entry.dt * 1000)
          const day = date.toISOString().split('T')[0]

          if (!byDate[day]) {
            byDate[day] = []
          }
          byDate[day].push(entry)
        })

        if (!mounted) return
        setForecast(byDate)
      } catch (err) {
        if (!mounted) return
        console.error(err)
        setError(err.message || 'Błąd podczas pobierania danych')
      }
    }
    load()
    return () => { mounted = false }
  }, [id, unit])


  if (error) return <div className="city-list"><div className="card font-bold text-red-800">Błąd: {error}</div></div>
  if (!current) return <div className="city-list"><div className="card">Nie znaleziono danych o mieście.</div></div>

  const iconUrl = getWeatherIconUrl(current.weather?.[0]?.icon)


  return (
    <div className="city-list">
      <div className="header">
        <h2 className="text-2xl font-bold flex gap-2">
          {iconUrl && <img src={iconUrl} alt={current.weather[0].description} className="w-20 h-20" />}
          {current.name}
          <small>{current.sys.country}</small>
        </h2>
        <div className="city-meta">
          <div className='text-3xl'>{Math.round(current.main.temp)}°{unit}</div>
          <div className="text-sm">{current.weather[0].description}</div>
        </div>
      </div>

      <div className="card">
        <div className="grid grid-cols-2 gap-2">
          <div>Odczuwalna: <strong>{Math.round(current.main.feels_like)}°{unit}</strong></div>
          <div>Wilgotność: <strong>{current.main.humidity}%</strong></div>
          <div>Ciśnienie: <strong>{current.main.pressure} hPa</strong></div>
          <div>Zachmurzenie: <strong>{current.clouds?.all}%</strong></div>
          <div>Opady (3h): <strong>{current.rain?.['3h'] ?? 0} mm</strong></div>
          <div>Wiatr: <strong>{current.wind.speed} {unitToOWMUnit(unit) == 'metric' ? 'm/s' : 'mph'}</strong> ({getWindDirection(current.wind.deg)})</div>
        </div>
      </div>

      <h3 className="mt-2 font-semibold">Prognoza (5-dniowa)</h3>
      {forecast && (
        <div className="space-y-4">
          {Object.entries(forecast).map(([date, entries]) => (
            <div key={date}>
              <h4 className="font-bold mb-2">{new Date(date).toLocaleDateString([], { weekday: 'long', day: '2-digit', month: '2-digit' }).replace(/^./u, c => c.toUpperCase())}</h4>
              <div className="grid grid-cols-2 gap-2">
                {entries.map(item => {
                  const iconUrl = getWeatherIconUrl(item.weather?.[0]?.icon)

                  return (
                    <div key={item.dt} className="card">
                      <div className="flex items-center gap-3">
                        {iconUrl && (
                          <img
                            src={iconUrl}
                            alt={item.weather?.[0]?.description}
                            className="w-10 h-10"
                          />
                        )}
                        <div>
                          <div className="text-sm font-semibold">
                            {new Date(item.dt * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                          <div className="text-lg">
                            {Math.round(item.main.temp)}°{unit} — {item.weather?.[0]?.main}
                          </div>
                          <div className="text-sm muted">
                            <div>Odczuwalna: <strong>{Math.round(item.main.feels_like)}°{unit}</strong></div>
                            <div>Wilgotność: <strong>{item.main.humidity}%</strong></div>
                            <div>Ciśnienie: <strong>{item.main.pressure} hPa</strong></div>
                            <div>Zachmurzenie: <strong>{item.clouds?.all}%</strong></div>
                            <div>Opady (3h): <strong>{item.rain?.['3h'] ?? 0} mm</strong></div>
                            <div>Wiatr: <strong>{item.wind.speed} {unitToOWMUnit(unit) == 'metric' ? 'm/s' : 'mph'}</strong> ({getWindDirection(current.wind.deg)})</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}