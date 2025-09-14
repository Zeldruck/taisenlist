# 🌸 Zelanime Watch  

[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://zelanime-watch.vercel.app)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](./LICENSE)




A small and lightweight **React anime tracker**.
Track what you want to watch, what you’ve seen, and keep notes — all stored locally in your browser.
Export / Import your anime list in JSON anytime.

---

🌐 **Live Demo**: [zelanime-watch.vercel.app](https://zelanime-watch.vercel.app)  
*(Everything is saved locally, no account required!)*  

---

## ✨ Features  

- 📌 **Add an anime** via [Jikan API](https://docs.api.jikan.moe/)  
- 🔍 **Search & filter** your list (watched, to watch, top rated, etc.)  
- ⭐ **Rate & comment** on each anime  
- 🏷️ Display genres, themes, year, and description  
- 🖼️ **Gallery & List view** modes  
- 📤 Export your list as JSON  
- 📥 Import a JSON list  
- 📊 **Stats page** with charts (Recharts):  
  - Seen vs To watch  
  - Distribution by year & genre  
  - Average rating per genre  

Everything is **saved in LocalStorage** — no account required.  

---

## 🚀 Getting Started  

### 🔧 Local development  

```bash
# Install dependencies
npm install

# Start dev server
npm run dev
```
Open http://localhost:5173 in your browser.

### 📦 Build for production 

```bash
npm run build
```

The production-ready files will be available in the `dist/` folder.
You can then deploy them on **Vercel**, **Netlify**, or any static hosting.

---

## 🛠️ Tech Stack
- ⚛️ [React](https://react.dev/) + [Vite](https://vitejs.dev/)
- 🎨 [Tailwind CSS](https://vitejs.dev/)
- 🎭 [Framer Motion](https://www.framer.com/motion/) (animations)
- 📊 [Recharts](https://recharts.org/) (stats & charts)
- 🌐 [Jikan API](https://docs.api.jikan.moe/) (anime data)

---

## 📸 Screenshots
### 🏠 Home Page
👉 Add anime, search, filter, mark as watched, rate
![](https://github.com/zeldruck/zelanime-watch/blob/main/git-images/home-gallery.png)
![](https://github.com/zeldruck/zelanime-watch/blob/main/git-images/home-list.png)


### 📊 Stats Page
👉 Charts about your collection
![](https://github.com/zeldruck/zelanime-watch/blob/main/git-images/stats.png)

---

## 💡 Roadmap

✅ ~~🔎 Local anime & tag search bar~~ \
✅ ~~📊 Basic stats~~ \
⬜ 🔔 Notifications for airing anime \
⬜ 🎨 Dark / Light mode toggle \
⬜ 📱 Improved mobile responsive design \
⬜ 🌐 Optional sync cloud backup 

---

## 📝 License

MIT License. \
Feel free to fork, modify and use!

---
\
[@Zeldruck](https://github.com/Zeldruck)