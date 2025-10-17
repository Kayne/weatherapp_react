import React from 'react'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { toggleFavorite } from '../store/weatherSlice'
import { TrashIcon, StarIcon } from '@heroicons/react/24/outline'
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid'
import { getWeatherIconUrl } from '../utils/helpers'

export default function CityCard({ city, onRemove }) {
    const dispatch = useDispatch()
    const unit = useSelector(s => s.weather.unit)
    const favs = useSelector(s => s.weather.favorites)
    const isFav = favs.find(f => f.id === city.id)
    const iconUrl = getWeatherIconUrl( city.icon )

    return (
        <div className="card rounded p-3 flex justify-between items-center">
            <div className="flex items-center gap-3">
                {iconUrl && <img src={iconUrl} alt={city.weather} className="w-10 h-10" />}
                <div className="city-name">
                    <Link to={`/city/${city.id}`} className="font-bold text-lg">{city.name}</Link>
                    <div>{city.temp}°{unit} — {city.weather}</div>
                </div>
            </div>
            <div className="city-meta flex flex-col items-end font-bold text-lg">
                <div className="flex items-center gap-2">
                    <button onClick={() => dispatch(toggleFavorite(city))} aria-label="toggle-fav">{isFav ? <StarSolidIcon className='size-5'></StarSolidIcon> : <StarIcon className='size-5'></StarIcon>}</button>
                    {onRemove && (
                        <button onClick={onRemove} aria-label="remove-city" className="text-sm text-red-600"><TrashIcon className='size-5'></TrashIcon></button>
                    )}
                </div>
            </div>
        </div>
    )
}