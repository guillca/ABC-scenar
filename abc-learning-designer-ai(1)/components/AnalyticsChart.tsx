import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import type { StoryboardActivity } from '../types';
import { LEARNING_TYPES, LEARNING_TYPES_LIST } from '../constants';

interface AnalyticsChartProps {
  activities: StoryboardActivity[];
}

const AnalyticsChart: React.FC<AnalyticsChartProps> = ({ activities }) => {
  const data = useMemo(() => {
    if (!activities) return [];
    const counts = activities.reduce((acc, activity) => {
      acc[activity.type] = (acc[activity.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return LEARNING_TYPES_LIST.map(typeInfo => ({
      name: typeInfo.name,
      value: counts[typeInfo.id] || 0,
      color: typeInfo.color.replace('bg-', '').replace('-500', ''), // a bit hacky, recharts needs hex/rgb
    })).filter(d => d.value > 0);
  }, [activities]);

  const colorMap: Record<string, string> = {
    'blue': '#3b82f6',
    'green': '#22c55e',
    'orange': '#f97316',
    'purple': '#8b5cf6',
    'yellow': '#eab308',
    'red': '#ef4444',
  }

  if (activities.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        Aucune activité à analyser.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
          nameKey="name"
          label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
            const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
            const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
            const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));
            return (
              <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize="12">
                {`${(percent * 100).toFixed(0)}%`}
              </text>
            );
          }}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={colorMap[entry.color]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default AnalyticsChart;
