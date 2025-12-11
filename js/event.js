import { state } from "./state.js";

export function initUI() {
  bindEvents();

  if (state.currentLocation || state.otherCities.length) {
    renderAll();
  } else {
    requestGeolocation();
  }
}


