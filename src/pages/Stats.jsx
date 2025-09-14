import React, { useState, useMemo } from 'react';
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';

const COLORS = ['#0088FE', '#FF8042', '#00C49F', '#FFBB28', '#8884D8', '#FF6666'];

export default function Stats({ animes }) {
  const [selectedYear, setSelectedYear] = useState('all');
  const [selectedGenre, setSelectedGenre] = useState('all');
  const [minRating, setMinRating] = useState(0);

  const filteredAnimes = useMemo(() => {
    if (!animes || animes.length === 0) return [];
    return animes.filter(a => 
      (selectedYear === 'all' || a.year === Number(selectedYear)) &&
      (selectedGenre === 'all' || a.tags?.includes(selectedGenre)) &&
      (a.rating >= minRating)
    );
  }, [animes, selectedYear, selectedGenre, minRating]);

  if (!animes || animes.length === 0) {
    return <div className="p-4">No anime to generate stats.</div>;
  }

  const watchedCount = filteredAnimes.filter(a => a.watched).length;
  const unwatchedCount = filteredAnimes.filter(a => !a.watched).length;
  const totalCount = watchedCount + unwatchedCount;

  const dataWatched = [
    { name: 'Watched', value: watchedCount },
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
  const dataByGenre = Object.entries(genreCount).map(([genre, value]) => ({ genre, value }));

  const genreSum = {};
  const genreCountSum = {};
  filteredAnimes.forEach(a => {
    a.tags?.forEach(tag => {
      genreSum[tag] = (genreSum[tag] || 0) + (a.rating || 0);
      genreCountSum[tag] = (genreCountSum[tag] || 0) + 1;
    });
  });
  const avgByGenre = Object.entries(genreSum).map(([genre, sum]) => ({
    genre,
    average: Number((sum / genreCountSum[genre]).toFixed(1))
  }));

  return (
    <div className="p-4">
      <div className="flex flex-wrap gap-2 mb-4">
        <select value={selectedYear} onChange={e => setSelectedYear(e.target.value)} className="border p-2 rounded">
          <option value="all">All Years</option>
          {years.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
        <select value={selectedGenre} onChange={e => setSelectedGenre(e.target.value)} className="border p-2 rounded">
          <option value="all">All Genres</option>
          {genres.map(g => <option key={g} value={g}>{g}</option>)}
        </select>
        <select value={minRating} onChange={e => setMinRating(Number(e.target.value))} className="border p-2 rounded">
          <option value={0}>All Ratings</option>
          {[1,2,3,4,5].map(r => <option key={r} value={r}>{r}⭐+</option>)}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-4 rounded shadow flex justify-center">
          <div style={{ width: '100%', maxWidth: 350, height: 300 }}>
            <h2 className="mb-2 font-bold text-center">Watched vs To watch</h2>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={dataWatched} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                  {dataWatched.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value} (${((value/totalCount)*100).toFixed(1)}%)`]} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-4 rounded shadow overflow-x-auto">
          <h2 className="mb-2 font-bold text-center">Breakdown by Year</h2>
          <div style={{ width: '100%', height: 300, minWidth: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dataByYear} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#0088FE" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-4 rounded shadow overflow-x-auto">
          <h2 className="mb-2 font-bold text-center">Breakdown by Genre</h2>
          <div style={{ width: '100%', height: Math.max(300, dataByGenre.length*40), minWidth: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={dataByGenre} margin={{ top: 5, right: 30, left: 100, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="genre" type="category" />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#FF8042" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-4 rounded shadow overflow-x-auto">
          <h2 className="mb-2 font-bold text-center">Average Scores by Genre</h2>
          <div style={{ width: '100%', height: Math.max(300, avgByGenre.length*40), minWidth: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={avgByGenre} margin={{ top: 5, right: 30, left: 100, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="genre" type="category" />
                <Tooltip />
                <Legend />
                <Bar dataKey="average" fill="#00C49F" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
