import React from 'react';
import {
  PieChart, Pie, Cell, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';

const COLORS = ['#0088FE', '#FF8042', '#00C49F', '#FFBB28', '#8884D8', '#FF6666'];

export default function Stats({ animes }) {
  if (!animes || animes.length === 0) {
    return <div className="p-4">No anime to generate stats.</div>;
  }

  const watchedCount = animes.filter(a => a.watched).length;
  const unwatchedCount = animes.filter(a => !a.watched).length;
  const dataWatched = [
    { name: 'Watched', value: watchedCount },
    { name: 'To watch', value: unwatchedCount }
  ];

  const years = [...new Set(animes.map(a => a.year).filter(Boolean))].sort();
  const dataByYear = years.map(year => ({
    year,
    count: animes.filter(a => a.year === year).length
  }));

  const genreCount = {};
  animes.forEach(a => {
    a.tags?.forEach(tag => {
      genreCount[tag] = (genreCount[tag] || 0) + 1;
    });
  });
  const dataByGenre = Object.entries(genreCount).map(([genre, value]) => ({ genre, value }));

  const genreSum = {};
  const genreCountSum = {};
  animes.forEach(a => {
    a.tags?.forEach(tag => {
      genreSum[tag] = (genreSum[tag] || 0) + (a.rating || 0);
      genreCountSum[tag] = (genreCountSum[tag] || 0) + 1;
    });
  });
  const avgByGenre = Object.entries(genreSum).map(([genre, sum]) => ({
    genre,
    average: sum / genreCountSum[genre]
  }));

  return (
    <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-8">
      <div className="bg-white p-4 rounded shadow">
        <h2 className="mb-2 font-bold">Watched vs To watch</h2>
        <PieChart width={300} height={300}>
          <Pie data={dataWatched} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
            {dataWatched.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </div>

      <div className="bg-white p-4 rounded shadow">
        <h2 className="mb-2 font-bold">Breakdown by year</h2>
        <BarChart width={400} height={300} data={dataByYear} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="year" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="count" fill="#0088FE" />
        </BarChart>
      </div>

      <div className="bg-white p-4 rounded shadow">
        <h2 className="mb-2 font-bold">Breakdown by gender</h2>
        <BarChart width={400} height={300} data={dataByGenre} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="genre" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="value" fill="#FF8042" />
        </BarChart>
      </div>

      <div className="bg-white p-4 rounded shadow">
        <h2 className="mb-2 font-bold">Average scores by genre</h2>
        <BarChart width={400} height={300} data={avgByGenre} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="genre" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="average" fill="#00C49F" />
        </BarChart>
      </div>
    </div>
  );
}