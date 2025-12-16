import { state } from "./state.js";
import { selectors, clearLocations, createCardForLocation } from "./ui.js";
import { saveStateToStorage } from "./storage.js";
import { geocodeCity } from "./api.js";
import { loadWeatherIntoCard } from "./weather.js";

export function initUI() {
  bindEvents();

  if (state.currentLocation || state.otherCities.length) {
    renderAll();
  } else {
    requestGeolocation();
  }
}

const SUGGESTED_CITIES = [
  "Moscow","Saint Petersburg","Helsinki","Paris","London","Berlin","Rome",
  "New York","Tokyo","Beijing","Novosibirsk","Kazan"
];

function bindEvents(){
  selectors.cityForm.addEventListener('submit', onAddCity);
  selectors.cityInput.addEventListener('input', onCityInput);
  selectors.suggestions.addEventListener('click', onSuggestionClick);
  selectors.refreshBtn.addEventListener('click', onRefreshClicked);
}

async function onAddCity(ev){
  ev.preventDefault();
  selectors.cityError.textContent = "";
  const name = selectors.cityInput.value.trim();
  if(!name){ selectors.cityError.textContent = "Введите город"; return; }

  try{
    const geo = await geocodeCity(name);
    if(!geo || geo.length === 0){
      selectors.cityError.textContent = "Город не найден";
      return;
    }

    const { lat, lon, name: foundName, country } = geo[0];
    const cityLabel = `${foundName}${country ? ", " + country : ""}`;

    if(!state.currentLocation){
      state.currentLocation = { type: "city", name: cityLabel, lat, lon };
    } else {
      if(state.otherCities.some(c => c.name.toLowerCase() === cityLabel.toLowerCase())){
        selectors.cityError.textContent = "Город уже добавлен";
        return;
      }
      state.otherCities.push({ name: cityLabel, lat, lon });
    }

    saveStateToStorage();
    selectors.cityInput.value = "";
    selectors.suggestions.classList.add('hidden');

    renderAll();

  } catch(err){
    console.error(err);
    selectors.cityError.textContent = "Ошибка при добавлении";
  }
}

function onCityInput(e){
  const q = e.target.value.trim().toLowerCase();
  if(!q){ selectors.suggestions.classList.add('hidden'); return; }

  const matches = SUGGESTED_CITIES
    .filter(c => c.toLowerCase().includes(q))
    .slice(0,6);

  renderSuggestions(matches);
}

function renderSuggestions(list){
  selectors.suggestions.innerHTML = "";
  if(list.length === 0){
    selectors.suggestions.classList.add('hidden'); return;
  }
  list.forEach(item => {
    const li = document.createElement('li');
    li.textContent = item;
    selectors.suggestions.appendChild(li);
  });
  selectors.suggestions.classList.remove('hidden');
}

function onSuggestionClick(e){
  if(e.target.tagName !== 'LI') return;
  selectors.cityInput.value = e.target.textContent;
  selectors.suggestions.classList.add('hidden');
}

function onRefreshClicked(){
  renderAll();
}

export function renderAll() {

  clearLocations();

  if (state.currentLocation) {
    const { card, removeBtn } = createCardForLocation(state.currentLocation, true);
    if (removeBtn) {
      removeBtn.addEventListener('click', () => {
        state.currentLocation = null;
        saveStateToStorage();
        renderAll();
      });
    }
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
      console.log(lat, lon);
    },
    err => {
      console.info("Ошибка геолокации:", err);
      selectors.status.textContent = "Геолокация не получена. Введите город.";
      showCityEntry();
    },
  );
}

function showCityEntry(){
  selectors.cityInput.focus();
}

