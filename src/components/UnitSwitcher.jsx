import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { setUnit } from '../store/weatherSlice'


export default function UnitSwitcher() {
    const unit = useSelector(s => s.weather.unit)
    const dispatch = useDispatch()
    return (
        <div className="flex gap-2">
            {['C', 'F', 'K'].map(u => (
                <button key={u} onClick={() => dispatch(setUnit(u))} className={`px-2 py-1 rounded ${unit === u ? 'font-bold' : ''}`}>
                    {u}
                </button>
            ))}
        </div>
    )
}