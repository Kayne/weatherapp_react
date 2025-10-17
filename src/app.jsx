import React, { useEffect } from 'react'
import { Routes, Route, Link } from 'react-router-dom'
import CityList from './components/CityList'
import CityDetails from './components/CityDetails'
import Favorites from './components/Favorites'
import UnitSwitcher from './components/UnitSwitcher'
import { useDispatch, useSelector } from 'react-redux'
import useLocalStorage from './utils/useLocalStorage'
import { setFavorites, setUnit } from './store/weatherSlice'

export default function App() {
  const dispatch = useDispatch()
  const [saved, setSaved] = useLocalStorage('weatherapp:settings', { favorites: [], unit: 'C' })
  const favs = useSelector(s => s.weather.favorites)
  const unit = useSelector(s => s.weather.unit)

  useEffect(() => {
    if (saved?.favorites) dispatch(setFavorites(saved.favorites))
    if (saved?.unit) dispatch(setUnit(saved.unit))
  }, [])

  useEffect(() => { setSaved(prev => ({ ...prev, favorites: favs })) }, [favs])

  useEffect(() => { setSaved(prev => ({ ...prev, unit })) }, [unit])

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-3xl font-bold"><Link to="">WeatherApp</Link></h1>
      <header className="flex justify-between items-center">
        <div className="flex gap-4 items-center">
          <Link to="favorites">Ulubione</Link>
        </div>
        <div className="flex items-center">
          <UnitSwitcher />
        </div>
      </header>

      <main className="mt-6">
        <Routes>
          <Route path="/" element={<CityList />} />
          <Route path="/city/:id" element={<CityDetails />} />
          <Route path="/favorites" element={<Favorites />} />
        </Routes>
      </main>
    </div>
  )
}