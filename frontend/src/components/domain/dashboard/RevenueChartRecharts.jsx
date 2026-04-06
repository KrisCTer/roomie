// src/components/Dashboard/RevenueChartRecharts.jsx
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
import StatCard from "./StatCard";

const RevenueChartRecharts = ({ bills = [], loading }) => {
  const [timeRange, setTimeRange] = useState("6months");
  const [chartType, setChartType] = useState("bar");

  const chartData = useMemo(() => {
    if (!bills || bills.length === 0) return [];

    const monthlyData = {};

    bills.forEach((bill) => {
      if (!bill.billingMonth || bill.status === "CANCELLED") return;

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

      const rentAmount = bill.monthlyRent || 0;
      monthlyData[monthKey].rent += rentAmount;

      const electricityAmount =
        ((bill.electricityNew || 0) - (bill.electricityOld || 0)) *
        (bill.electricityUnitPrice || 0);

      const waterAmount =
        ((bill.waterNew || 0) - (bill.waterOld || 0)) *
        (bill.waterUnitPrice || 0);

      monthlyData[monthKey].utilities += electricityAmount + waterAmount;

      const servicesAmount =
        (bill.internetPrice || 0) +
        (bill.parkingPrice || 0) +
        (bill.cleaningPrice || 0) +
        (bill.maintenancePrice || 0) +
        (bill.otherPrice || 0);

      monthlyData[monthKey].services += servicesAmount;
      monthlyData[monthKey].totalRevenue += bill.totalAmount || 0;
      monthlyData[monthKey].billCount += 1;
    });

    const monthNames = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
    ];

    let dataArray = Object.keys(monthlyData)
      .sort()
      .map((monthKey) => {
        const month = parseInt(monthKey.split("-")[1]);
        return {
          month: monthNames[month - 1],
          fullMonth: monthKey,
          rent: monthlyData[monthKey].rent / 1_000_000,
          utilities: monthlyData[monthKey].utilities / 1_000_000,
          services: monthlyData[monthKey].services / 1_000_000,
          totalRevenue: monthlyData[monthKey].totalRevenue / 1_000_000,
          billCount: monthlyData[monthKey].billCount,
        };
      });

    const rangeMonths = timeRange === "6months" ? 6 : 12;
    if (dataArray.length > rangeMonths) {
      dataArray = dataArray.slice(-rangeMonths);
    }

    return dataArray;
  }, [bills, timeRange]);

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

    const totalRevenue = chartData.reduce((s, i) => s + i.totalRevenue, 0);
    const totalRent = chartData.reduce((s, i) => s + i.rent, 0);
    const totalUtilities = chartData.reduce((s, i) => s + i.utilities, 0);
    const totalServices = chartData.reduce((s, i) => s + i.services, 0);

    const latestRevenue = chartData[chartData.length - 1]?.totalRevenue || 0;
    const previousRevenue = chartData[chartData.length - 2]?.totalRevenue || 0;
    const growthRate =
      previousRevenue > 0
        ? (((latestRevenue - previousRevenue) / previousRevenue) * 100).toFixed(1)
        : 0;

    return { totalRevenue, totalRent, totalUtilities, totalServices, latestRevenue, previousRevenue, growthRate };
  }, [chartData]);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="apple-glass-panel rounded-xl p-3">
          <p className="text-sm font-semibold home-text-primary mb-2">
            {payload[0].payload.month} ({payload[0].payload.fullMonth})
          </p>
          <p className="text-xs home-text-muted mb-2">
            Bills: {payload[0].payload.billCount}
          </p>
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center justify-between gap-4 mb-1">
              <span className="text-xs" style={{ color: entry.color }}>
                {entry.name}:
              </span>
              <span className="text-sm font-bold" style={{ color: entry.color }}>
                {entry.value.toFixed(1)}M
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  const renderChart = () => {
    const commonProps = {
      data: chartData,
      margin: { top: 5, right: 30, left: 20, bottom: 5 },
    };

    switch (chartType) {
      case "line":
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(109, 101, 93, 0.15)" />
            <XAxis dataKey="month" stroke="#6d655d" />
            <YAxis stroke="#6d655d" />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line type="monotone" dataKey="totalRevenue" name="Total Revenue" stroke="#10b981" strokeWidth={3} dot={{ fill: "#10b981", r: 4 }} activeDot={{ r: 6 }} />
            <Line type="monotone" dataKey="rent" name="Rent" stroke="#3b82f6" strokeWidth={3} dot={{ fill: "#3b82f6", r: 4 }} />
            <Line type="monotone" dataKey="utilities" name="Utilities" stroke="#f59e0b" strokeWidth={3} dot={{ fill: "#f59e0b", r: 4 }} />
            <Line type="monotone" dataKey="services" name="Services" stroke="#14b8a6" strokeWidth={3} dot={{ fill: "#14b8a6", r: 4 }} />
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
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(109, 101, 93, 0.15)" />
            <XAxis dataKey="month" stroke="#6d655d" />
            <YAxis stroke="#6d655d" />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Area type="monotone" dataKey="rent" name="Rent" stroke="#3b82f6" fillOpacity={1} fill="url(#colorRent)" stackId="1" />
            <Area type="monotone" dataKey="utilities" name="Utilities" stroke="#f59e0b" fillOpacity={1} fill="url(#colorUtilities)" stackId="1" />
            <Area type="monotone" dataKey="services" name="Services" stroke="#14b8a6" fillOpacity={1} fill="url(#colorRevenue)" stackId="1" />
          </AreaChart>
        );

      case "composed":
        return (
          <ComposedChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(109, 101, 93, 0.15)" />
            <XAxis dataKey="month" stroke="#6d655d" />
            <YAxis stroke="#6d655d" />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar dataKey="rent" name="Rent" fill="#3b82f6" radius={[8, 8, 0, 0]} stackId="a" />
            <Bar dataKey="utilities" name="Utilities" fill="#f59e0b" radius={[8, 8, 0, 0]} stackId="a" />
            <Bar dataKey="services" name="Services" fill="#14b8a6" radius={[8, 8, 0, 0]} stackId="a" />
            <Line type="monotone" dataKey="totalRevenue" name="Total Revenue" stroke="#10b981" strokeWidth={3} dot={{ fill: "#10b981", r: 5 }} />
          </ComposedChart>
        );

      default:
        return (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(109, 101, 93, 0.15)" />
            <XAxis dataKey="month" stroke="#6d655d" />
            <YAxis stroke="#6d655d" />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar dataKey="rent" name="Rent" fill="#3b82f6" radius={[8, 8, 0, 0]} />
            <Bar dataKey="utilities" name="Utilities" fill="#f59e0b" radius={[8, 8, 0, 0]} />
            <Bar dataKey="services" name="Services" fill="#14b8a6" radius={[8, 8, 0, 0]} />
          </BarChart>
        );
    }
  };

  /* ==================== Loading state ==================== */
  if (loading) {
    return (
      <div className="apple-glass-panel no-hover rounded-2xl p-6">
        <div className="animate-pulse">
          <div className="h-6 rounded w-48 mb-4" style={{ background: "var(--home-surface-soft)" }} />
          <div className="h-80 rounded mb-4" style={{ background: "var(--home-surface-soft)" }} />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-20 rounded-xl" style={{ background: "var(--home-surface-soft)" }} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  /* ==================== Empty state ==================== */
  if (chartData.length === 0) {
    return (
      <div className="apple-glass-panel no-hover rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl apple-glass-tinted-teal flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-teal-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold home-text-primary">Biểu đồ doanh thu</h2>
            <p className="text-sm home-text-muted">Theo dõi thu nhập hàng tháng của bạn</p>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-20 h-20 rounded-full apple-glass-soft flex items-center justify-center mb-4">
            <BarChart3 className="w-10 h-10 home-text-muted" />
          </div>
          <p className="home-text-primary text-lg mb-2">Không có dữ liệu hóa đơn</p>
          <p className="home-text-muted text-sm">
            Tạo hóa đơn đầu tiên của bạn để xem biểu đồ doanh thu
          </p>
        </div>
      </div>
    );
  }

  /* ==================== Main render ==================== */

  const chartTypeButtons = [
    { key: "bar", icon: BarChart3, title: "Bar Chart" },
    { key: "line", icon: LineChartIcon, title: "Line Chart" },
    { key: "area", icon: TrendingUp, title: "Area Chart" },
    { key: "composed", icon: DollarSign, title: "Mixed Chart" },
  ];


  return (
    <div className="apple-glass-panel no-hover rounded-2xl p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl apple-glass-tinted-teal flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-teal-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold home-text-primary">Biểu đồ doanh thu</h2>
            <p className="text-sm home-text-muted">
              Theo dõi thu nhập hàng tháng của bạn ({chartData.length} tháng)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Chart Type Selector */}
          <div className="flex items-center gap-1 apple-glass-soft rounded-xl p-1">
            {chartTypeButtons.map(({ key, icon: Icon, title }) => (
              <button
                key={key}
                onClick={() => setChartType(key)}
                className={`p-2 rounded-lg transition-all duration-200 ${
                  chartType === key
                    ? "home-btn-accent text-white shadow-sm"
                    : "home-text-muted hover:home-text-primary hover:bg-white/60"
                }`}
                title={title}
              >
                <Icon className="w-4 h-4" />
              </button>
            ))}
          </div>

          {/* Time Range Selector */}
          <div className="flex items-center gap-1 apple-glass-soft rounded-xl p-1">
            {["6months", "12months"].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  timeRange === range
                    ? "home-btn-accent text-white shadow-sm"
                    : "home-text-muted hover:home-text-primary hover:bg-white/60"
                }`}
              >
                {range === "6months" ? "6 tháng" : "12 tháng"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="mb-6 apple-glass-soft rounded-xl p-4" style={{ height: "320px" }}>
        <ResponsiveContainer width="100%" height="100%">
          {renderChart()}
        </ResponsiveContainer>
      </div>

      {/* Statistics — Unified StatCards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={DollarSign}
          label="Tổng doanh thu"
          value={`${stats.totalRevenue.toFixed(1)}M`}
          color="green"
          subtitle={`Trung bình: ${chartData.length > 0 ? (stats.totalRevenue / chartData.length).toFixed(1) : 0}M/tháng`}
        />
        <StatCard
          icon={TrendingUp}
          label="Thuê"
          value={`${stats.totalRent.toFixed(1)}M`}
          color="blue"
          subtitle={`${stats.totalRevenue > 0 ? ((stats.totalRent / stats.totalRevenue) * 100).toFixed(0) : 0}% tổng`}
        />
        <StatCard
          icon={Zap}
          label="Tiện ích"
          value={`${stats.totalUtilities.toFixed(1)}M`}
          color="orange"
          subtitle={`${stats.totalRevenue > 0 ? ((stats.totalUtilities / stats.totalRevenue) * 100).toFixed(0) : 0}% tổng`}
        />
        <StatCard
          icon={Calendar}
          label="Tăng trưởng"
          value={`${stats.growthRate > 0 ? "+" : ""}${stats.growthRate}%`}
          color="teal"
          trend={stats.growthRate !== 0 ? { type: stats.growthRate > 0 ? "up" : "down", value: "" } : undefined}
          subtitle="so với tháng trước"
        />
      </div>
    </div>
  );
};

export default RevenueChartRecharts;
