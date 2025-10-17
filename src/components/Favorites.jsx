import React, { useEffect, useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import useLocalStorage from '../utils/useLocalStorage'
import CityCard from './CityCard'
import { unitToOWMUnit } from '../utils/helpers'
import { fetchCurrentByCityName } from '../api/openweather'

export default function Favorites() {
    const unit = useSelector(s => s.weather.unit)
    const [saved] = useLocalStorage('weatherapp:settings', { favorites: [] })
    const [favorites, setFavorites] = useState(saved.favorites || [])
    const list = useMemo(() => favorites, [favorites])

    if (!favorites || favorites.length === 0) return <div className="city-list"><div className="card">Brak ulubionych miast.</div></div>

    useEffect(() => {
        if (!favorites || favorites.length === 0) return
        let mounted = true
        async function refresh() {
            const u = unitToOWMUnit(unit)
            const results = await Promise.all(favorites.map(c => fetchCurrentByCityName(c.name, u).catch(() => null)))
            const mapped = results.map(r => r ? ({ id: r.id, name: r.name, temp: Math.round(r.main.temp), weather: r.weather[0].main, icon: r.weather[0].icon, coords: r.coord }) : null).filter(Boolean)
            if (!mounted) return
            setFavorites(mapped)
        }
        refresh()
        return () => { mounted = false }
    }, [unit])

    return (
        <div className="city-list">
            <h2 className="text-2xl font-bold">Ulubione miasta</h2>
            <div className="grid gap-3 mt-4">
                {list.map(c => <CityCard key={c.id} city={c} />)}
            </div>
        </div>
    )
}
