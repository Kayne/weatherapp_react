import React, { useEffect, useState, useCallback, useMemo } from 'react'
import CityCard from './CityCard'
import SearchForm from './SearchForm'
import { fetchCurrentByCityName } from '../api/openweather'
import { unitToOWMUnit } from '../utils/helpers'
import { useSelector } from 'react-redux'
import useLocalStorage from '../utils/useLocalStorage'


const INITIAL_CITIES = ['Warsaw', 'Krakow', 'Gdansk', 'Wroclaw', 'Poznan']


export default function CityList() {
    const unit = useSelector(s => s.weather.unit)
    const [storedCities, setStoredCities] = useLocalStorage('weatherapp:cities', [])
    const [cities, setCities] = useState(storedCities || [])
    const list = useMemo(() => cities, [cities])


    const loadInitial = useCallback(async () => {
        const u = unitToOWMUnit(unit)
        const results = await Promise.all(INITIAL_CITIES.map(n => fetchCurrentByCityName(n, u).catch(() => null)))
        const mapped = results.map(r => r ? ({ id: r.id, name: r.name, temp: Math.round(r.main.temp), weather: r.weather[0].main, icon: r.weather[0].icon, coords: r.coord }) : null).filter(Boolean)
        setCities(mapped)
        setStoredCities(mapped)
    }, [unit, setStoredCities])


    useEffect(() => {
        if (!storedCities || storedCities.length === 0) {
            loadInitial()
        } else {
            setCities(storedCities)
        }
    }, [])

    useEffect(() => {
        if (!cities || cities.length === 0) return
        let mounted = true
        async function refresh() {
            const u = unitToOWMUnit(unit)
            const results = await Promise.all(cities.map(c => fetchCurrentByCityName(c.name, u).catch(() => null)))
            const mapped = results.map(r => r ? ({ id: r.id, name: r.name, temp: Math.round(r.main.temp), weather: r.weather[0].main, icon: r.weather[0].icon, coords: r.coord }) : null).filter(Boolean)
            if (!mounted) return
            setCities(mapped)
            setStoredCities(mapped)
        }
        refresh()
        return () => { mounted = false }
    }, [unit])


    const onSearch = useCallback(async (q) => {
        const u = unitToOWMUnit(unit)
        const r = await fetchCurrentByCityName(q, u)
        const newCity = { id: r.id, name: r.name, temp: Math.round(r.main.temp), weather: r.weather[0].main, icon: r.weather[0].icon, coords: r.coord }
        setCities(prev => {
            const exists = prev.some(c => c.id === newCity.id || c.name.toLowerCase() === newCity.name.toLowerCase())
            if (exists) return prev
            const next = [newCity, ...prev]
            setStoredCities(next)
            return next
        })
    }, [unit, setStoredCities])

    const removeCity = useCallback((id) => {
        setCities(prev => {
            const next = prev.filter(c => c.id !== id)
            setStoredCities(next)
            return next
        })
    }, [setStoredCities])


    return (
        <div className="city-list">
            <SearchForm onSearch={onSearch} />
            <div className="grid gap-3 mt-4">
                {list.map(c => <CityCard key={c.id} city={c} onRemove={() => removeCity(c.id)} />)}
            </div>
        </div>
    )
}