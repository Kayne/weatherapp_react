import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react'
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

    const [error, setError] = useState(null)
    const errorTimer = useRef(null)

    useEffect(() => {
        return () => { if (errorTimer.current) clearTimeout(errorTimer.current) }
    }, [])

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
        if (errorTimer.current) {
            clearTimeout(errorTimer.current)
            errorTimer.current = null
        }
        setError(null)

        const name = q.trim()
        const isDuplicated = cities.some(c => c.name.toLowerCase() === name.toLowerCase())
        if (isDuplicated) {
            setError('Miasto już jest na liście')
            errorTimer.current = setTimeout(() => setError(null), 3000)
            return
        }

        try {
            const u = unitToOWMUnit(unit)
            const r = await fetchCurrentByCityName(q, u)
            if (!r || !r.id) {
                setError('Nie znaleziono miasta')
                errorTimer.current = setTimeout(() => setError(null), 3000)
                return
            }

            const newCity = { id: r.id, name: r.name, temp: Math.round(r.main.temp), weather: r.weather[0].main, icon: r.weather[0].icon, coords: r.coord }
            setCities(prev => {
                // Warsaw i Warszawa zwraca to samo miasto a isDuplicated check wyżej tego nie wyłapuje
                const exists = prev.some(c => c.id === newCity.id || c.name.toLowerCase() === newCity.name.toLowerCase())
                if (exists) return prev
                const next = [newCity, ...prev]
                setStoredCities(next)
                return next
            })
            setError(null)
        } catch (err) {
            console.error(err)
            setError(err.message || 'Błąd podczas dodawania miasta')
            errorTimer.current = setTimeout(() => setError(null), 3000)
        }
    }, [unit, setStoredCities, cities])

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
            {error && (
                <div className="mt-3 p-2 rounded bg-red-900 bg-opacity-40 text-red-100 text-sm">
                    {error}
                </div>
            )}
            <div className="grid gap-3 mt-4">
                {list.map(c => <CityCard key={c.id} city={c} onRemove={() => removeCity(c.id)} />)}
            </div>
        </div>
    )
}