import { useEffect, useMemo, useState } from "react";
import {
  Area,
  Bar,
  BarChart,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  RadialBar,
  RadialBarChart,
} from "recharts";
import {
  CloudSun,
  TrendingUp,
  Factory,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { useApi } from "./api";

const commodityTabs = [
  { id: "corn", label: "Corn" },
  { id: "wheat", label: "Wheat" },
  { id: "soybean", label: "Soybean" },
];

const metricIcons = {
  Weather: CloudSun,
  Macro: TrendingUp,
  "Supply/Demand": Factory,
  Cost: DollarSign,
};

const trendIcons = {
  up: ArrowUpRight,
  down: ArrowDownRight,
};

const formatCurrency = (value) => `$${Number(value).toFixed(0)}`;

const ConfidenceLegend = () => (
  <div className="flex items-center gap-3 text-xs text-slate-500">
    <div className="flex items-center gap-1">
      <span className="h-2 w-4 rounded-full bg-blue-200" />
      95% Interval
    </div>
    <div className="flex items-center gap-1">
      <span className="h-2 w-4 rounded-full bg-blue-100" />
      80% Interval
    </div>
  </div>
);

const FeatureImportance = ({ data }) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
    <div className="mb-4 flex items-center justify-between">
      <h3 className="text-sm font-semibold text-slate-900">Feature Importance</h3>
      <span className="text-xs text-slate-400">SHAP Impact</span>
    </div>
    <div className="h-48">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart layout="vertical" data={data} margin={{ left: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis type="number" hide />
          <YAxis type="category" dataKey="name" width={140} />
          <Bar dataKey="value" fill="#2563eb" radius={[6, 6, 6, 6]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  </div>
);

const TimeImportance = ({ values }) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
    <div className="mb-4 flex items-center justify-between">
      <h3 className="text-sm font-semibold text-slate-900">Time-level Importance</h3>
      <span className="text-xs text-slate-400">Lag Contribution</span>
    </div>
    <div className="flex flex-wrap gap-2">
      {values.map((value, index) => (
        <div
          key={`lag-${index}`}
          className="flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1 text-xs"
        >
          <span
            className="h-2 w-2 rounded-full"
            style={{ background: `rgba(37, 99, 235, ${0.2 + value})` }}
          />
          T-{values.length - index}
        </div>
      ))}
    </div>
    <p className="mt-3 text-xs text-slate-500">
      Recent timesteps contribute the strongest weight to the current forecast.
    </p>
  </div>
);

const MetricCard = ({ metric }) => {
  const Icon = metricIcons[metric.label];
  const TrendIcon = trendIcons[metric.trend];

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-slate-100 p-2">
            <Icon className="h-4 w-4 text-slate-600" />
          </span>
          <span className="text-sm font-semibold text-slate-900">{metric.label}</span>
        </div>
        <TrendIcon className="h-4 w-4 text-emerald-500" />
      </div>
      <p className="mt-3 text-lg font-semibold text-slate-900">{metric.delta}</p>
      <p className="text-xs text-slate-500">Updated 2h ago</p>
    </div>
  );
};

const SentimentGauge = ({ value }) => {
  const gaugeData = [{ name: "Sentiment", value, fill: "#22c55e" }];

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-900">Market Sentiment</h3>
        <span className="text-xs text-slate-400">Fear vs Greed</span>
      </div>
      <div className="h-40">
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart
            innerRadius="60%"
            outerRadius="90%"
            data={gaugeData}
            startAngle={180}
            endAngle={0}
          >
            <RadialBar dataKey="value" cornerRadius={10} />
            <Tooltip />
          </RadialBarChart>
        </ResponsiveContainer>
      </div>
      <div className="flex items-center justify-between text-xs text-slate-500">
        <span>Fear</span>
        <span className="text-sm font-semibold text-slate-900">{value}%</span>
        <span>Greed</span>
      </div>
    </div>
  );
};

const KeywordCloud = ({ keywords }) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
    <div className="mb-4 flex items-center justify-between">
      <h3 className="text-sm font-semibold text-slate-900">News Keywords</h3>
      <span className="text-xs text-slate-400">Last 24h</span>
    </div>
    <div className="flex flex-wrap gap-2">
      {keywords.map((word) => (
        <span
          key={word}
          className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700"
        >
          {word}
        </span>
      ))}
    </div>
  </div>
);

const Dashboard = ({ activeCommodity, onCommodityChange, onGenerateReport }) => {
  const api = useApi();
  const [mode, setMode] = useState("Short-term (LSTM)");
  const [loading, setLoading] = useState(false);
  const [forecast, setForecast] = useState(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    api
      .getForecast(activeCommodity)
      .then((response) => {
        if (isMounted) {
          setForecast(response.data);
        }
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [activeCommodity]);

  const chartData = useMemo(() => forecast?.series ?? [], [forecast]);

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Time-Series Forecast
            </h2>
            <p className="text-xs text-slate-500">
              Historical + forecasted price with confidence intervals
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex rounded-full bg-slate-100 p-1 text-xs">
              {commodityTabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => onCommodityChange(tab.id)}
                  className={`rounded-full px-3 py-1 transition ${
                    activeCommodity === tab.id
                      ? "bg-white text-slate-900 shadow"
                      : "text-slate-500"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1 text-xs">
              <span className="text-slate-400">Model</span>
              <button
                type="button"
                className={`rounded-full px-2 py-1 ${
                  mode === "Short-term (LSTM)"
                    ? "bg-blue-600 text-white"
                    : "text-slate-500"
                }`}
                onClick={() => setMode("Short-term (LSTM)")}
              >
                Short-term (LSTM)
              </button>
              <button
                type="button"
                className={`rounded-full px-2 py-1 ${
                  mode === "Long-term (Trend)"
                    ? "bg-blue-600 text-white"
                    : "text-slate-500"
                }`}
                onClick={() => setMode("Long-term (Trend)")}
              >
                Long-term (Trend)
              </button>
            </div>
            <button
              type="button"
              onClick={() => onGenerateReport(mode)}
              className="rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white"
            >
              Generate Deep Dive
            </button>
          </div>
        </div>
        <div className="mt-5 h-72">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ left: 12, right: 12 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} />
              <YAxis
                tick={{ fontSize: 10 }}
                tickFormatter={formatCurrency}
                width={60}
              />
              <Tooltip formatter={(value) => formatCurrency(value)} />
              <Area
                dataKey="lower95"
                stackId="confidence95"
                stroke="none"
                fill="transparent"
              />
              <Area
                dataKey="band95"
                stackId="confidence95"
                stroke="none"
                fill="#bfdbfe"
                fillOpacity={0.7}
              />
              <Area
                dataKey="lower80"
                stackId="confidence80"
                stroke="none"
                fill="transparent"
              />
              <Area
                dataKey="band80"
                stackId="confidence80"
                stroke="none"
                fill="#dbeafe"
                fillOpacity={0.9}
              />
              <Line
                type="monotone"
                dataKey="actual"
                stroke="#0f172a"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="forecast"
                stroke="#2563eb"
                strokeWidth={2}
                dot={false}
                strokeDasharray="4 4"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <ConfidenceLegend />
          <span className="text-xs text-slate-400">
            {loading ? "Loading data..." : `Model: ${mode}`}
          </span>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <FeatureImportance data={forecast?.features ?? []} />
        <TimeImportance values={forecast?.timeImportance ?? []} />
      </div>

      <div className="grid gap-4 lg:grid-cols-4">
        {forecast?.metrics && (
          <>
            <MetricCard metric={forecast.metrics.weather} />
            <MetricCard metric={forecast.metrics.macro} />
            <MetricCard metric={forecast.metrics.supply} />
            <MetricCard metric={forecast.metrics.cost} />
          </>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {forecast?.metrics && (
          <>
            <SentimentGauge value={forecast.metrics.sentiment} />
            <KeywordCloud keywords={forecast.metrics.keywords} />
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
