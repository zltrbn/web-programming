import { geocodeCity, fetchWeatherByCoords } from "./api.js";

export async function loadWeatherIntoCard(loc, cardNode){
  const { loading, errorEl, forecastList, title } = cardNode._meta;
  loading.classList.remove('hidden');
  errorEl.classList.add('hidden');
  forecastList.innerHTML = '';

  try{
    let { lat, lon } = loc;

    if(lat == null || lon == null){
      const geo = await geocodeCity(loc.name);
      if(!geo || !geo[0]) throw new Error("Не удалось найти координаты");
      lat = geo[0].lat;
      lon = geo[0].lon;
    }

    const days = await fetchWeatherByCoords(lat, lon);

    loading.classList.add('hidden');

    days.forEach(d => {
      const li = document.createElement('li');
      const date = new Date(d.dt * 1000);

      const dayLabel = date.toLocaleDateString('ru-RU', {
        weekday: 'short',
        day: 'numeric',
        month: 'short'
      });

    const icon = d.weather[0].icon;

    const dayDiv = document.createElement('div');
    dayDiv.className = 'day';
    dayDiv.textContent = dayLabel;

    const img = document.createElement('img');
    img.src = `https://openweathermap.org/img/wn/${icon}@2x.png`;
    img.alt = d.weather[0].description;

    const tempDiv = document.createElement('div');
    tempDiv.className = 'temp';
    tempDiv.textContent = `${Math.round(d.main.temp)}°C`;

    li.appendChild(dayDiv);
    li.appendChild(img);
    li.appendChild(tempDiv);

    forecastList.appendChild(li);
    });

    if(loc.name) title.textContent = loc.name;

  } catch(err){
    console.error(err);
    loading.classList.add('hidden');
    errorEl.textContent = err.message || 'Ошибка загрузки';
    errorEl.classList.remove('hidden');
  }
}
