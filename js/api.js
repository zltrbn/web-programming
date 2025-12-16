export const OWM_API_KEY = "dab84c63df70daffa5540bd0775df641";
export const OWM_GEOCODE = "https://api.openweathermap.org/geo/1.0/direct";
export const OWM_FORECAST = "https://api.openweathermap.org/data/2.5/forecast";

export async function geocodeCity(name){
  const url = `${OWM_GEOCODE}?q=${encodeURIComponent(name)}&limit=5&appid=${OWM_API_KEY}`;
  const res = await fetch(url);
  if(!res.ok) throw new Error('Ошибка геокодинга');
  return res.json();
}

export async function fetchWeatherByCoords(lat, lon) {
  const url = `${OWM_FORECAST}?lat=${lat}&lon=${lon}&appid=${OWM_API_KEY}&units=metric&lang=ru`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Ошибка получения погоды");

  const data = await res.json();

  return [
    data.list[0],
    data.list[8] ?? data.list[data.list.length - 1],
    data.list[16] ?? data.list[data.list.length - 1]
  ];
}
