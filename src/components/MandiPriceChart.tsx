"use client";

import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { useLanguage } from "@/context/LanguageContext";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface PricePoint {
  dayLabel: string;
  mandiPrice: number;
  farmDirectPrice: number;
}

interface MandiPriceChartProps {
  cropName: string;
  unit: string;
  history: PricePoint[];
}

export function MandiPriceChart({
  cropName,
  unit,
  history,
}: MandiPriceChartProps) {
  const { lang } = useLanguage();

  const labels = history.map((h) => h.dayLabel);
  const mandiData = history.map((h) => h.mandiPrice);
  const farmData = history.map((h) => h.farmDirectPrice);

  const chartData = {
    labels,
    datasets: [
      {
        label: lang === "HI" ? "APMC मंडी औसत भाव (₹)" : "APMC Mandi Wholesale Price (₹)",
        data: mandiData,
        borderColor: "#C25E00",
        backgroundColor: "rgba(194, 94, 0, 0.08)",
        borderDash: [5, 5],
        borderWidth: 2,
        pointRadius: 4,
        pointBackgroundColor: "#C25E00",
        tension: 0.35,
        fill: false,
      },
      {
        label: lang === "HI" ? "FarmDirect सीधा किसान मूल्य (₹)" : "FarmDirect Direct Price (₹)",
        data: farmData,
        borderColor: "#16A34A",
        backgroundColor: "rgba(22, 163, 74, 0.14)",
        borderWidth: 3,
        pointRadius: 5,
        pointBackgroundColor: "#16A34A",
        tension: 0.35,
        fill: true,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
        labels: {
          font: {
            family: "Plus Jakarta Sans, sans-serif",
            size: 12,
            weight: 600,
          },
          usePointStyle: true,
          color: "#1E392A",
        },
      },
      tooltip: {
        backgroundColor: "#1E392A",
        titleFont: { family: "Fraunces, serif", size: 13 },
        bodyFont: { family: "Plus Jakarta Sans", size: 12 },
        padding: 10,
        callbacks: {
          label: (context: any) => {
            return ` ${context.dataset.label}: ₹${context.raw}/${unit}`;
          },
        },
      },
    },
    scales: {
      y: {
        title: {
          display: true,
          text: `Price in ₹ / ${unit}`,
          color: "#5D6B63",
        },
        grid: {
          color: "rgba(93, 107, 99, 0.12)",
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
  };

  return (
    <div className="bg-white rounded-2xl border border-[#DCE4DF] p-5 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
        <div>
          <h3 className="font-serif text-lg font-bold text-[#1E392A]">
            {lang === "HI"
              ? "३०-दिन मंडी बनाम FarmDirect मूल्य रुझान"
              : "30-Day Agmarknet APMC Mandi vs Direct Trend"}
          </h3>
          <p className="text-xs text-[#5D6B63]">
            {lang === "HI"
              ? `फसल: ${cropName} • बिचौलिया आढ़तिया कमीशन बचत क्षेत्र (हरा भाग)`
              : `Crop: ${cropName} • Green area shows Middleman Commission Savings`}
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-[#16A34A] text-xs font-semibold rounded-full border border-emerald-200">
          ● Verified APMC Benchmark
        </span>
      </div>
      <div className="h-64 w-full">
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
}
