import { state } from "./state.js";

export const STORAGE_KEYS = {
  currentLocation: 'weather_current_location',
  otherCities: 'weather_other_cities'
};

export function loadStateFromStorage(){
  try {
    const cur = localStorage.getItem(STORAGE_KEYS.currentLocation);
    const others = localStorage.getItem(STORAGE_KEYS.otherCities);
    if(cur) state.currentLocation = JSON.parse(cur);
    if(others) state.otherCities = JSON.parse(others);
  } catch(e) {
    console.warn("Ошибка localStorage", e);
  }
}
