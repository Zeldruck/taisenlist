import React, { useState, useMemo, useEffect } from 'react';
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';

const COLORS = ['#0088FE', '#FF8042', '#00C49F', '#FFBB28', '#8884D8', '#FF6666'];

export default function Stats({ animes }) {
  const [selectedYear, setSelectedYear] = useState('all');
  const [selectedGenre, setSelectedGenre] = useState('all');
  const [minRating, setMinRating] = useState(0);
  const [isDark, setIsDark] = useState(null); 

  useEffect(() => {
    document.body.style.overflow = "auto";
    document.documentElement.style.overflow = "auto";
  }, []);

  const filteredAnimes = useMemo(() => {
    if (!animes || animes.length === 0) return [];
    return animes.filter(a =>
      (selectedYear === 'all' || a.year === Number(selectedYear)) &&
      (selectedGenre === 'all' || a.tags?.includes(selectedGenre)) &&
      (a.rating >= minRating)
    );
  }, [animes, selectedYear, selectedGenre, minRating]);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'));

    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  if (isDark === null) return null;

  const textColor = isDark ? '#eee' : '#333';
  const gridColor = isDark ? '#444' : '#ccc';
  const tooltipBg = isDark ? '#222' : '#fff';
  const tooltipColor = isDark ? '#eee' : '#000';

  if (!animes || animes.length === 0) {
    return <div className="p-4 text-gray-500 dark:text-gray-300">No anime to generate stats.</div>;
  }

  const watchedCount = filteredAnimes.filter(a => a.watched == 2).length;
  const unwatchedCount = filteredAnimes.filter(a => a.watched == 0).length;
  const inprogressCount = filteredAnimes.filter(a => a.watched == 1).length;
  const totalCount = watchedCount + unwatchedCount + inprogressCount;

  const dataWatched = [
    { name: 'Watched', value: watchedCount },
    { name: 'In progress', value: inprogressCount },
    { name: 'To watch', value: unwatchedCount }
  ];

  const years = [...new Set(animes.map(a => a.year).filter(Boolean))].sort();
  const dataByYear = years.map(year => ({
    year,
    count: filteredAnimes.filter(a => a.year === year).length
  }));

  const genres = [...new Set(animes.flatMap(a => a.tags || []))].sort();
  const genreCount = {};
  filteredAnimes.forEach(a => {
    a.tags?.forEach(tag => genreCount[tag] = (genreCount[tag] || 0) + 1);
  });
  const dataByGenre = Object.entries(genreCount).filter(([genre, value]) => value > 1).map(([genre, value]) => ({ genre, value }));

  const genreSum = {};
  const genreCountSum = {};
  filteredAnimes.forEach(a => {
    if (!a.rating || a.rating === 0) return;
    a.tags?.forEach(tag => {
      genreSum[tag] = (genreSum[tag] || 0) + a.rating;
      genreCountSum[tag] = (genreCountSum[tag] || 0) + 1;
    });
  });
  const avgByGenre = Object.entries(genreSum)
    .filter(([genre, sum]) => genreCountSum[genre] > 1)
    .map(([genre, sum]) => ({
      genre,
      average: Number((sum / genreCountSum[genre]).toFixed(1))
    }));

  return (
    <div className="p-4 transition-colors duration-500">
      <div className="flex flex-wrap gap-2 mb-4">
        <select
          value={selectedYear}
          onChange={e => setSelectedYear(e.target.value)}
          className="border p-2 rounded bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-colors duration-500"
        >
          <option value="all">All Years</option>
          {years.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
        <select
          value={selectedGenre}
          onChange={e => setSelectedGenre(e.target.value)}
          className="border p-2 rounded bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-colors duration-500"
        >
          <option value="all">All Genres</option>
          {genres.map(g => <option key={g} value={g}>{g}</option>)}
        </select>
        <select
          value={minRating}
          onChange={e => setMinRating(Number(e.target.value))}
          className="border p-2 rounded bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-colors duration-500"
        >
          <option value={0}>All Ratings</option>
          {[1,2,3,4,5].map(r => <option key={r} value={r}>{r}⭐+</option>)}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {[dataWatched, dataByYear, dataByGenre, avgByGenre].map((dataBlock, idx) => {
          const isPie = idx === 0;
          const titleMap = ['Watched vs In progress vs To watch', 'Breakdown by Year', 'Breakdown by Genre', 'Average Scores by Genre'];
          return (
            <div
              key={idx}
              className="bg-gray-100 dark:bg-gray-800 p-4 rounded shadow overflow-x-auto transition-colors duration-500 flex justify-center"
            >
              <div style={{ width: '100%', maxWidth: isPie ? 350 : '100%', height: isPie ? 300 : Math.max(300, dataBlock.length * 40), minWidth: 300 }}>
                <h2 className="mb-2 font-bold text-center transition-colors duration-500" style={{ color: textColor }}>
                  {titleMap[idx]}
                </h2>
                <ResponsiveContainer width="100%" height="100%">
                  {isPie ? (
                    <PieChart>
                      <Pie data={dataWatched} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                        {dataWatched.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value) => [`${value} (${((value/totalCount)*100).toFixed(1)}%)`]}
                        contentStyle={{ backgroundColor: tooltipBg, color: tooltipColor }}
                      />
                      <Legend wrapperStyle={{ color: textColor }} />
                    </PieChart>
                  ) : idx === 1 ? (
                    <BarChart data={dataByYear} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                      <XAxis dataKey="year" stroke={textColor} />
                      <YAxis stroke={textColor} />
                      <Tooltip contentStyle={{ backgroundColor: tooltipBg, color: tooltipColor }} />
                      <Legend wrapperStyle={{ color: textColor }} />
                      <Bar dataKey="count" fill="#0088FE" />
                    </BarChart>
                  ) : idx === 2 ? (
                    <BarChart layout="vertical" data={dataByGenre} margin={{ top: 5, right: 30, left: 100, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                      <XAxis type="number" stroke={textColor} />
                      <YAxis dataKey="genre" type="category" stroke={textColor} />
                      <Tooltip contentStyle={{ backgroundColor: tooltipBg, color: tooltipColor }} />
                      <Legend wrapperStyle={{ color: textColor }} />
                      <Bar dataKey="value" fill="#FF8042" />
                    </BarChart>
                  ) : (
                    <BarChart layout="vertical" data={avgByGenre} margin={{ top: 5, right: 30, left: 100, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                      <XAxis type="number" stroke={textColor} domain={[0, 5]} />
                      <YAxis dataKey="genre" type="category" stroke={textColor} />
                      <Tooltip contentStyle={{ backgroundColor: tooltipBg, color: tooltipColor }} />
                      <Legend wrapperStyle={{ color: textColor }} />
                      <Bar dataKey="average" fill="#00C49F" />
                    </BarChart>
                  )}
                </ResponsiveContainer>
              </div>
            </div>
          )
        })}
      </div>
    </div>

  );
}
