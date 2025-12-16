export const selectors = {
  status: document.getElementById('status'),
  locations: document.getElementById('locations'),
  cityForm: document.getElementById('cityForm'),
  cityInput: document.getElementById('cityInput'),
  suggestions: document.getElementById('suggestions'),
  cityError: document.getElementById('cityError'),
  refreshBtn: document.getElementById('refreshBtn'),
  template: document.getElementById('locationCardTemplate')
};

export function clearLocations(){
  selectors.locations.innerHTML = '';
}

export function createCardForLocation(loc, isCurrent=false, idx){
  const tpl = selectors.template.content.cloneNode(true);
  const card = tpl.querySelector('.card');
  const title = card.querySelector('.card__title');
  const removeBtn = card.querySelector('.card__remove');
  const loading = card.querySelector('.loading');
  const errorEl = card.querySelector('.error');
  const forecastList = card.querySelector('.forecast-list');

  title.textContent = isCurrent ? "Текущее местоположение" : (loc.name || "Город");

  card._meta = { loc, isCurrent, idx, loading, errorEl, forecastList, title };
  return { card, removeBtn };
}
