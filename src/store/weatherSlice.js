import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    unit: 'C',
    favorites: [],
}

const slice = createSlice({
    name: 'weather',
    initialState,
    reducers: {
        setUnit(state, action) { state.unit = action.payload },
        toggleFavorite(state, action) {
            const city = action.payload
            const exists = state.favorites.find(c => c.id === city.id)
            if (exists) state.favorites = state.favorites.filter(c => c.id !== city.id)
            else state.favorites.push(city)
        },
        setFavorites(state, action) { state.favorites = action.payload }
    }
})


export const { setUnit, toggleFavorite, setFavorites } = slice.actions
export default slice.reducer