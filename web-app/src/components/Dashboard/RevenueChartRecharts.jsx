// src/pages/User/Dashboard/components/RevenueChartRecharts.jsx
// Install: npm install recharts
import React, { useState } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
  ComposedChart,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  BarChart3,
  LineChartIcon,
} from "lucide-react";

const RevenueChartRecharts = ({ data, loading }) => {
  const [timeRange, setTimeRange] = useState("6months");
  const [chartType, setChartType] = useState("bar"); // bar, line, area, composed

  // Generate data
  const generateMonthlyData = () => {
    if (data && data.length > 0) return data;

    const months = [
      "T1",
      "T2",
      "T3",
      "T4",
      "T5",
      "T6",
      "T7",
      "T8",
      "T9",
      "T10",
      "T11",
      "T12",
    ];
    const currentMonth = new Date().getMonth();
    const rangeMonths = timeRange === "6months" ? 6 : 12;

    return months
      .slice(Math.max(0, currentMonth - rangeMonths + 1), currentMonth + 1)
      .map((month, index) => {
        const revenue = Math.floor(Math.random() * 50000000) + 10000000;
        const expenses = Math.floor(Math.random() * 15000000) + 5000000;
        return {
          month,
          revenue: revenue / 1000000, // Convert to millions
          expenses: expenses / 1000000,
          profit: (revenue - expenses) / 1000000,
        };
      });
  };

  const chartData = generateMonthlyData();

  // Calculate statistics
  const totalRevenue = chartData.reduce((sum, item) => sum + item.revenue, 0);
  const totalExpenses = chartData.reduce((sum, item) => sum + item.expenses, 0);
  const totalProfit = totalRevenue - totalExpenses;

  const latestRevenue = chartData[chartData.length - 1]?.revenue || 0;
  const previousRevenue = chartData[chartData.length - 2]?.revenue || 0;
  const growthRate =
    previousRevenue > 0
      ? (((latestRevenue - previousRevenue) / previousRevenue) * 100).toFixed(1)
      : 0;

  // Custom tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 border border-slate-700 rounded-lg p-3 shadow-xl">
          <p className="text-sm font-semibold text-white mb-2">
            {payload[0].payload.month}
          </p>
          {payload.map((entry, index) => (
            <div
              key={index}
              className="flex items-center justify-between gap-4 mb-1"
            >
              <span className="text-xs" style={{ color: entry.color }}>
                {entry.name}:
              </span>
              <span
                className="text-sm font-bold"
                style={{ color: entry.color }}
              >
                {entry.value.toFixed(1)}M
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  // Render chart based on type
  const renderChart = () => {
    const commonProps = {
      data: chartData,
      margin: { top: 5, right: 30, left: 20, bottom: 5 },
    };

    switch (chartType) {
      case "line":
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="month" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line
              type="monotone"
              dataKey="revenue"
              name="Doanh thu"
              stroke="#10b981"
              strokeWidth={3}
              dot={{ fill: "#10b981", r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="expenses"
              name="Chi phí"
              stroke="#ef4444"
              strokeWidth={3}
              dot={{ fill: "#ef4444", r: 4 }}
            />
            <Line
              type="monotone"
              dataKey="profit"
              name="Lợi nhuận"
              stroke="#a855f7"
              strokeWidth={3}
              dot={{ fill: "#a855f7", r: 4 }}
            />
          </LineChart>
        );

      case "area":
        return (
          <AreaChart {...commonProps}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#a855f7" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#a855f7" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="month" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Area
              type="monotone"
              dataKey="revenue"
              name="Doanh thu"
              stroke="#10b981"
              fillOpacity={1}
              fill="url(#colorRevenue)"
            />
            <Area
              type="monotone"
              dataKey="expenses"
              name="Chi phí"
              stroke="#ef4444"
              fillOpacity={1}
              fill="url(#colorExpenses)"
            />
          </AreaChart>
        );

      case "composed":
        return (
          <ComposedChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="month" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar
              dataKey="revenue"
              name="Doanh thu"
              fill="#10b981"
              radius={[8, 8, 0, 0]}
            />
            <Bar
              dataKey="expenses"
              name="Chi phí"
              fill="#ef4444"
              radius={[8, 8, 0, 0]}
            />
            <Line
              type="monotone"
              dataKey="profit"
              name="Lợi nhuận"
              stroke="#a855f7"
              strokeWidth={3}
              dot={{ fill: "#a855f7", r: 5 }}
            />
          </ComposedChart>
        );

      default: // bar
        return (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="month" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar
              dataKey="revenue"
              name="Doanh thu"
              fill="#10b981"
              radius={[8, 8, 0, 0]}
            />
            <Bar
              dataKey="expenses"
              name="Chi phí"
              fill="#ef4444"
              radius={[8, 8, 0, 0]}
            />
            <Bar
              dataKey="profit"
              name="Lợi nhuận"
              fill="#a855f7"
              radius={[8, 8, 0, 0]}
            />
          </BarChart>
        );
    }
  };

  if (loading) {
    return (
      <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-slate-700 rounded w-48 mb-4" />
          <div className="h-80 bg-slate-700 rounded mb-4" />
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-20 bg-slate-700 rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Biểu đồ doanh thu</h2>
            <p className="text-sm text-slate-400">
              Theo dõi thu nhập hàng tháng
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Chart Type Selector */}
          <div className="flex items-center gap-1 bg-slate-700/50 rounded-lg p-1">
            <button
              onClick={() => setChartType("bar")}
              className={`p-2 rounded-md transition ${
                chartType === "bar"
                  ? "bg-purple-600 text-white"
                  : "text-slate-400 hover:text-white"
              }`}
              title="Bar Chart"
            >
              <BarChart3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setChartType("line")}
              className={`p-2 rounded-md transition ${
                chartType === "line"
                  ? "bg-purple-600 text-white"
                  : "text-slate-400 hover:text-white"
              }`}
              title="Line Chart"
            >
              <LineChartIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => setChartType("area")}
              className={`p-2 rounded-md transition ${
                chartType === "area"
                  ? "bg-purple-600 text-white"
                  : "text-slate-400 hover:text-white"
              }`}
              title="Area Chart"
            >
              <TrendingUp className="w-4 h-4" />
            </button>
            <button
              onClick={() => setChartType("composed")}
              className={`p-2 rounded-md transition ${
                chartType === "composed"
                  ? "bg-purple-600 text-white"
                  : "text-slate-400 hover:text-white"
              }`}
              title="Mixed Chart"
            >
              <DollarSign className="w-4 h-4" />
            </button>
          </div>

          {/* Time Range Selector */}
          <div className="flex items-center gap-2 bg-slate-700/50 rounded-lg p-1">
            <button
              onClick={() => setTimeRange("6months")}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition ${
                timeRange === "6months"
                  ? "bg-purple-600 text-white"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              6 tháng
            </button>
            <button
              onClick={() => setTimeRange("12months")}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition ${
                timeRange === "12months"
                  ? "bg-purple-600 text-white"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              12 tháng
            </button>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="mb-6" style={{ height: "320px" }}>
        <ResponsiveContainer width="100%" height="100%">
          {renderChart()}
        </ResponsiveContainer>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-green-900/20 to-green-800/20 border border-green-700/30 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-4 h-4 text-green-400" />
            <span className="text-xs text-slate-400">Tổng doanh thu</span>
          </div>
          <p className="text-2xl font-bold text-green-400">
            {totalRevenue.toFixed(1)}M
          </p>
          <p className="text-xs text-slate-500 mt-1">
            TB: {(totalRevenue / chartData.length).toFixed(1)}M/tháng
          </p>
        </div>

        <div className="bg-gradient-to-br from-red-900/20 to-red-800/20 border border-red-700/30 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingDown className="w-4 h-4 text-red-400" />
            <span className="text-xs text-slate-400">Tổng chi phí</span>
          </div>
          <p className="text-2xl font-bold text-red-400">
            {totalExpenses.toFixed(1)}M
          </p>
          <p className="text-xs text-slate-500 mt-1">
            TB: {(totalExpenses / chartData.length).toFixed(1)}M/tháng
          </p>
        </div>

        <div className="bg-gradient-to-br from-purple-900/20 to-purple-800/20 border border-purple-700/30 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-purple-400" />
            <span className="text-xs text-slate-400">Lợi nhuận ròng</span>
          </div>
          <p className="text-2xl font-bold text-purple-400">
            {totalProfit.toFixed(1)}M
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Margin: {((totalProfit / totalRevenue) * 100).toFixed(1)}%
          </p>
        </div>

        <div className="bg-gradient-to-br from-blue-900/20 to-blue-800/20 border border-blue-700/30 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-4 h-4 text-blue-400" />
            <span className="text-xs text-slate-400">Tăng trưởng</span>
          </div>
          <div className="flex items-baseline gap-1">
            <p className="text-2xl font-bold text-blue-400">
              {growthRate > 0 ? "+" : ""}
              {growthRate}%
            </p>
            {growthRate > 0 ? (
              <TrendingUp className="w-4 h-4 text-green-400" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-400" />
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1">So với tháng trước</p>
        </div>
      </div>
    </div>
  );
};

export default RevenueChartRecharts;
