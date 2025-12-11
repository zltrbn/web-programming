import { state } from "./state.js";

export function initUI() {
  bindEvents();

  if (state.currentLocation || state.otherCities.length) {
    renderAll();
  } else {
    requestGeolocation();
  }
}
export function renderAll() {

  clearLocations();

  if (state.currentLocation) {
    const { card } = createCardForLocation(state.currentLocation, true);
    selectors.locations.appendChild(card);
    loadWeatherIntoCard(state.currentLocation, card);
  }

  state.otherCities.forEach((loc, idx) => {
    const { card, removeBtn } = createCardForLocation(loc, false, idx);

    if (removeBtn) {
      removeBtn.addEventListener('click', () => {
        state.otherCities.splice(idx, 1);
        saveStateToStorage();
        renderAll();
      });
    }

    selectors.locations.appendChild(card);
    loadWeatherIntoCard(loc, card);
  });

}


export function requestGeolocation() {

  selectors.status.textContent = "Запрашиваем доступ к геопозиции...";
  if(!navigator.geolocation){
    selectors.status.textContent = "Геолокация не поддерживается. Введите город вручную.";
    showCityEntry();
    return;
  }

  navigator.geolocation.getCurrentPosition(
    pos => {
      const lat = pos.coords.latitude;
      const lon = pos.coords.longitude;
      state.currentLocation = { type: "coords", lat, lon };
      saveStateToStorage();
      selectors.status.textContent = "Получаем прогноз...";
      renderAll();
    },
    err => {
      console.info("Ошибка геолокации:", err);
      selectors.status.textContent = "Геолокация не получена. Введите город.";
      showCityEntry();
    }
  );
}

function showCityEntry(){
  selectors.cityInput.focus();
}

