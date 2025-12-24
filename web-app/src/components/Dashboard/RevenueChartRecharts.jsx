// src/pages/User/Dashboard/components/RevenueChartRecharts.jsx
import React, { useState, useMemo } from "react";
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
  Zap,
} from "lucide-react";

const RevenueChartRecharts = ({ bills = [], loading }) => {
  const [timeRange, setTimeRange] = useState("6months");
  const [chartType, setChartType] = useState("bar");

  // Process real bills data into monthly aggregated data
  const chartData = useMemo(() => {
    if (!bills || bills.length === 0) {
      return [];
    }

    // Group bills by month
    const monthlyData = {};

    bills.forEach((bill) => {
      // Skip cancelled bills
      if (!bill.billingMonth || bill.status === "CANCELLED") return;

      // Extract YYYY-MM format
      const monthKey = bill.billingMonth.substring(0, 7);

      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = {
          rent: 0,
          utilities: 0,
          services: 0,
          totalRevenue: 0,
          billCount: 0,
        };
      }

      // Rent amount
      const rentAmount = bill.monthlyRent || 0;
      monthlyData[monthKey].rent += rentAmount;

      // Utilities (electricity + water)
      const electricityAmount =
        ((bill.electricityNew || 0) - (bill.electricityOld || 0)) *
        (bill.electricityUnitPrice || 0);

      const waterAmount =
        ((bill.waterNew || 0) - (bill.waterOld || 0)) *
        (bill.waterUnitPrice || 0);

      const utilitiesAmount = electricityAmount + waterAmount;
      monthlyData[monthKey].utilities += utilitiesAmount;

      // Other services
      const servicesAmount =
        (bill.internetPrice || 0) +
        (bill.parkingPrice || 0) +
        (bill.cleaningPrice || 0) +
        (bill.maintenancePrice || 0) +
        (bill.otherPrice || 0);

      monthlyData[monthKey].services += servicesAmount;

      // Total revenue
      const totalAmount = bill.totalAmount || 0;
      monthlyData[monthKey].totalRevenue += totalAmount;
      monthlyData[monthKey].billCount += 1;
    });

    // Convert to array and sort by date
    let dataArray = Object.keys(monthlyData)
      .sort()
      .map((monthKey) => {
        const [year, month] = monthKey.split("-");
        const monthNames = [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Dec",
        ];

        return {
          month: monthNames[parseInt(month) - 1],
          fullMonth: monthKey,
          rent: monthlyData[monthKey].rent / 1000000, // Convert to millions
          utilities: monthlyData[monthKey].utilities / 1000000,
          services: monthlyData[monthKey].services / 1000000,
          totalRevenue: monthlyData[monthKey].totalRevenue / 1000000,
          billCount: monthlyData[monthKey].billCount,
        };
      });

    // Filter based on time range
    const rangeMonths = timeRange === "6months" ? 6 : 12;
    if (dataArray.length > rangeMonths) {
      dataArray = dataArray.slice(-rangeMonths);
    }

    return dataArray;
  }, [bills, timeRange]);

  // Calculate statistics
  const stats = useMemo(() => {
    if (chartData.length === 0) {
      return {
        totalRevenue: 0,
        totalRent: 0,
        totalUtilities: 0,
        totalServices: 0,
        latestRevenue: 0,
        previousRevenue: 0,
        growthRate: 0,
      };
    }

    const totalRevenue = chartData.reduce(
      (sum, item) => sum + item.totalRevenue,
      0
    );
    const totalRent = chartData.reduce((sum, item) => sum + item.rent, 0);
    const totalUtilities = chartData.reduce(
      (sum, item) => sum + item.utilities,
      0
    );
    const totalServices = chartData.reduce(
      (sum, item) => sum + item.services,
      0
    );

    const latestRevenue = chartData[chartData.length - 1]?.totalRevenue || 0;
    const previousRevenue = chartData[chartData.length - 2]?.totalRevenue || 0;
    const growthRate =
      previousRevenue > 0
        ? (((latestRevenue - previousRevenue) / previousRevenue) * 100).toFixed(
            1
          )
        : 0;

    return {
      totalRevenue,
      totalRent,
      totalUtilities,
      totalServices,
      latestRevenue,
      previousRevenue,
      growthRate,
    };
  }, [chartData]);

  // Custom tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-xl">
          <p className="text-sm font-semibold text-gray-900 mb-2">
            {payload[0].payload.month} ({payload[0].payload.fullMonth})
          </p>
          <p className="text-xs text-gray-600 mb-2">
            Bills: {payload[0].payload.billCount}
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
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="month" stroke="#6b7280" />
            <YAxis stroke="#6b7280" />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line
              type="monotone"
              dataKey="totalRevenue"
              name="Total Revenue"
              stroke="#10b981"
              strokeWidth={3}
              dot={{ fill: "#10b981", r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="rent"
              name="Rent"
              stroke="#3b82f6"
              strokeWidth={3}
              dot={{ fill: "#3b82f6", r: 4 }}
            />
            <Line
              type="monotone"
              dataKey="utilities"
              name="Utilities"
              stroke="#f59e0b"
              strokeWidth={3}
              dot={{ fill: "#f59e0b", r: 4 }}
            />
            <Line
              type="monotone"
              dataKey="services"
              name="Services"
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
              <linearGradient id="colorRent" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="colorUtilities" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="month" stroke="#6b7280" />
            <YAxis stroke="#6b7280" />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Area
              type="monotone"
              dataKey="rent"
              name="Rent"
              stroke="#3b82f6"
              fillOpacity={1}
              fill="url(#colorRent)"
              stackId="1"
            />
            <Area
              type="monotone"
              dataKey="utilities"
              name="Utilities"
              stroke="#f59e0b"
              fillOpacity={1}
              fill="url(#colorUtilities)"
              stackId="1"
            />
            <Area
              type="monotone"
              dataKey="services"
              name="Services"
              stroke="#a855f7"
              fillOpacity={1}
              fill="url(#colorRevenue)"
              stackId="1"
            />
          </AreaChart>
        );

      case "composed":
        return (
          <ComposedChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="month" stroke="#6b7280" />
            <YAxis stroke="#6b7280" />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar
              dataKey="rent"
              name="Rent"
              fill="#3b82f6"
              radius={[8, 8, 0, 0]}
              stackId="a"
            />
            <Bar
              dataKey="utilities"
              name="Utilities"
              fill="#f59e0b"
              radius={[8, 8, 0, 0]}
              stackId="a"
            />
            <Bar
              dataKey="services"
              name="Services"
              fill="#a855f7"
              radius={[8, 8, 0, 0]}
              stackId="a"
            />
            <Line
              type="monotone"
              dataKey="totalRevenue"
              name="Total Revenue"
              stroke="#10b981"
              strokeWidth={3}
              dot={{ fill: "#10b981", r: 5 }}
            />
          </ComposedChart>
        );

      default: // bar
        return (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="month" stroke="#6b7280" />
            <YAxis stroke="#6b7280" />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar
              dataKey="rent"
              name="Rent"
              fill="#3b82f6"
              radius={[8, 8, 0, 0]}
            />
            <Bar
              dataKey="utilities"
              name="Utilities"
              fill="#f59e0b"
              radius={[8, 8, 0, 0]}
            />
            <Bar
              dataKey="services"
              name="Services"
              fill="#a855f7"
              radius={[8, 8, 0, 0]}
            />
          </BarChart>
        );
    }
  };

  if (loading) {
    return (
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-48 mb-4" />
          <div className="h-80 bg-gray-200 rounded mb-4" />
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-20 bg-gray-200 rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Show message if no data
  if (chartData.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Revenue Chart</h2>
            <p className="text-sm text-gray-600">Track your monthly income</p>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-4">
            <BarChart3 className="w-10 h-10 text-gray-400" />
          </div>
          <p className="text-gray-600 text-lg mb-2">No bill data available</p>
          <p className="text-gray-500 text-sm">
            Create your first bill to see the revenue chart
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Revenue Chart</h2>
            <p className="text-sm text-gray-600">
              Track your monthly income ({chartData.length} months)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Chart Type Selector */}
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setChartType("bar")}
              className={`p-2 rounded-md transition ${
                chartType === "bar"
                  ? "bg-purple-600 text-white shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
              title="Bar Chart"
            >
              <BarChart3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setChartType("line")}
              className={`p-2 rounded-md transition ${
                chartType === "line"
                  ? "bg-purple-600 text-white shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
              title="Line Chart"
            >
              <LineChartIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => setChartType("area")}
              className={`p-2 rounded-md transition ${
                chartType === "area"
                  ? "bg-purple-600 text-white shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
              title="Area Chart"
            >
              <TrendingUp className="w-4 h-4" />
            </button>
            <button
              onClick={() => setChartType("composed")}
              className={`p-2 rounded-md transition ${
                chartType === "composed"
                  ? "bg-purple-600 text-white shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
              title="Mixed Chart"
            >
              <DollarSign className="w-4 h-4" />
            </button>
          </div>

          {/* Time Range Selector */}
          <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setTimeRange("6months")}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition ${
                timeRange === "6months"
                  ? "bg-purple-600 text-white shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              6 months
            </button>
            <button
              onClick={() => setTimeRange("12months")}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition ${
                timeRange === "12months"
                  ? "bg-purple-600 text-white shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              12 months
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
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-4 h-4 text-green-600" />
            <span className="text-xs text-gray-700">Total Revenue</span>
          </div>
          <p className="text-2xl font-bold text-green-600">
            {stats.totalRevenue.toFixed(1)}M
          </p>
          <p className="text-xs text-gray-600 mt-1">
            Avg:{" "}
            {chartData.length > 0
              ? (stats.totalRevenue / chartData.length).toFixed(1)
              : 0}
            M/month
          </p>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-blue-600" />
            <span className="text-xs text-gray-700">Rent</span>
          </div>
          <p className="text-2xl font-bold text-blue-600">
            {stats.totalRent.toFixed(1)}M
          </p>
          <p className="text-xs text-gray-600 mt-1">
            {stats.totalRevenue > 0
              ? ((stats.totalRent / stats.totalRevenue) * 100).toFixed(0)
              : 0}
            % of total
          </p>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-4 h-4 text-orange-600" />
            <span className="text-xs text-gray-700">Utilities</span>
          </div>
          <p className="text-2xl font-bold text-orange-600">
            {stats.totalUtilities.toFixed(1)}M
          </p>
          <p className="text-xs text-gray-600 mt-1">
            {stats.totalRevenue > 0
              ? ((stats.totalUtilities / stats.totalRevenue) * 100).toFixed(0)
              : 0}
            % of total
          </p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-violet-50 border border-purple-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-4 h-4 text-purple-600" />
            <span className="text-xs text-gray-700">Growth</span>
          </div>
          <div className="flex items-baseline gap-1">
            <p className="text-2xl font-bold text-purple-600">
              {stats.growthRate > 0 ? "+" : ""}
              {stats.growthRate}%
            </p>
            {stats.growthRate > 0 ? (
              <TrendingUp className="w-4 h-4 text-green-600" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-600" />
            )}
          </div>
          <p className="text-xs text-gray-600 mt-1">vs. previous month</p>
        </div>
      </div>
    </div>
  );
};

export default RevenueChartRecharts;
