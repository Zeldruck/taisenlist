export const saveData = (key, data) => {
  localStorage.setItem(key, JSON.stringify(data));
};

export const loadData = (key, fallback=[]) => {
  const raw = localStorage.getItem(key);
  return raw ? JSON.parse(raw) : fallback;
};
