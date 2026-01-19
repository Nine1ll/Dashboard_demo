import axios from "axios";

const apiClient = axios.create({
  baseURL: "/",
  timeout: 800,
});

const commodities = {
  corn: {
    name: "Corn",
    base: 380,
    volatility: 14,
  },
  wheat: {
    name: "Wheat",
    base: 420,
    volatility: 18,
  },
  soybean: {
    name: "Soybean",
    base: 510,
    volatility: 22,
  },
};

const buildForecastSeries = (commodityKey) => {
  const { base, volatility } = commodities[commodityKey];
  const points = [];
  const today = new Date();
  let last = base;

  for (let i = 30; i >= 1; i -= 1) {
    last += (Math.sin(i / 3) + Math.cos(i / 5)) * volatility * 0.4;
    points.push({
      date: new Date(today.getTime() - i * 24 * 60 * 60 * 1000)
        .toISOString()
        .slice(0, 10),
      actual: Number(last.toFixed(2)),
    });
  }

  for (let i = 1; i <= 20; i += 1) {
    const trend = (Math.sin(i / 4) + 1.5) * volatility * 0.2;
    const forecast = last + trend + i * 1.2;
    const spread95 = 45 + i * 2.5;
    const spread80 = 25 + i * 1.5;

    points.push({
      date: new Date(today.getTime() + i * 24 * 60 * 60 * 1000)
        .toISOString()
        .slice(0, 10),
      forecast: Number(forecast.toFixed(2)),
      upper95: Number((forecast + spread95).toFixed(2)),
      lower95: Number((forecast - spread95).toFixed(2)),
      upper80: Number((forecast + spread80).toFixed(2)),
      lower80: Number((forecast - spread80).toFixed(2)),
      band95: Number((spread95 * 2).toFixed(2)),
      band80: Number((spread80 * 2).toFixed(2)),
    });
  }

  return points;
};

const mockDelay = (payload, delay = 450) =>
  new Promise((resolve) => {
    setTimeout(() => resolve({ data: payload }), delay);
  });

export const useApi = () => {
  const getForecast = async (commodityId) => {
    await apiClient.get(`/forecast/${commodityId}`);
    const series = buildForecastSeries(commodityId);
    return mockDelay({
      commodity: commodities[commodityId].name,
      series,
      features: [
        { name: "Mato Grosso Temperature", value: 0.76 },
        { name: "Dollar Index", value: 0.48 },
        { name: "News Sentiment", value: 0.41 },
        { name: "Freight Rates", value: 0.32 },
      ],
      timeImportance: [0.15, 0.32, 0.5, 0.22, 0.41, 0.63, 0.28],
      metrics: {
        weather: { label: "Weather", delta: "+2°C", trend: "up" },
        macro: { label: "Macro", delta: "+0.4%", trend: "up" },
        supply: { label: "Supply/Demand", delta: "Tight", trend: "down" },
        cost: { label: "Cost", delta: "+1.2%", trend: "up" },
        sentiment: 64,
        keywords: [
          "Export Ban",
          "Ethanol",
          "Drought",
          "Logistics",
          "Planting Pace",
        ],
      },
    });
  };

  const sendChat = async ({ message, commodity }) => {
    await apiClient.post("/chat", { message, commodity });
    return mockDelay({
      reply: `Based on ${commodity} futures signals, momentum remains resilient while volatility stays moderate.`,
      reference: "Reference: 2021.03.12 Case",
    });
  };

  const generateReport = async ({ commodity, mode }) => {
    await apiClient.post("/generate_report", { commodity, mode });
    return mockDelay({
      report: `## ${commodity} Forecast Deep Dive\n\n**Model Mode:** ${mode}\n\n### Executive Summary\n- Price momentum is steady with upside skew over the next 30 days.\n- Weather risk in South America remains the dominant driver.\n\n### Drivers\n1. **Climate:** Above-normal temperatures tighten yield estimates.\n2. **Macro:** USD softness supports export demand.\n3. **Flows:** Managed money net-long positions increased.\n\n### Risks\n- Sudden policy shifts on export quotas.\n- Rapid reversal in energy complex.\n\n### Action\nMaintain hedged long exposure with a 80% confidence guardrail.`,
    });
  };

  return {
    getForecast,
    sendChat,
    generateReport,
  };
};
