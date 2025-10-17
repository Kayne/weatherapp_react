import React, { useState } from 'react'


export default function SearchForm({ onSearch }) {
    const [q, setQ] = useState('')
    return (
        <form onSubmit={e => { e.preventDefault(); onSearch(q); setQ('') }} className="flex gap-2">
            <input value={q} onChange={e => setQ(e.target.value)} placeholder="Szukaj miasta..." className="border rounded px-2" />
            <button className="px-3 py-1 bg-slate-200 rounded">Szukaj</button>
        </form>
    )
}