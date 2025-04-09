import React, { useRef, useState, useMemo } from "react";
import { getElementAtEvent, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  BarController,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Leaderboard, Run } from "./types";
import { Link } from "react-router";
import { Video } from "lucide-react";
import { formatTime } from "@/lib/format-time";
import { CircularProgress } from "@mui/material";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  BarController,
  Title,
  Tooltip,
  Legend
);

type TopTenChartProps = {
  leaderboard: Leaderboard | null;
};

const TopTenChart = ({ leaderboard }: TopTenChartProps) => {
  if (!leaderboard)
    return (
      <div className="flex justify-center items-center">
        <CircularProgress size={100} />
      </div>
    );

  const top10Data = useMemo(() => {
    if (!leaderboard || !leaderboard.runs) {
      return [];
    }
    return leaderboard.runs.slice(0, 10);
  }, [leaderboard]);

  const [activePlayerIndex, setActivePlayerIndex] = useState<number | null>(
    null
  );

  const chartData = useMemo(
    () =>
      top10Data.map((run: Run, index: number) => ({
        place: index + 1,
        time: run.run.times.primary_t,
        playerName:
          leaderboard.players.data.find(
            (player) => player.id === run.run.players[0]?.id
          )?.names?.international ?? "Anonymous",
        videoLink: run.run.videos?.links?.[0]?.uri,
      })),
    [top10Data, leaderboard]
  );

  const averageTime = useMemo(
    () =>
      chartData.reduce(
        (acc: number, run: { time: number }) => acc + run.time,
        0
      ) / chartData.length,
    [chartData]
  );

  let timeUnit = useMemo(() => {
    if (averageTime >= 120 && averageTime < 7200) {
      return "minutes";
    } else if (averageTime >= 7200) {
      return "hours";
    }
    return "seconds";
  }, [averageTime]);

  const transformedData = useMemo(
    () =>
      chartData.map((data: any) => {
        let displayTime = data.time;
        if (timeUnit === "minutes") {
          displayTime = data.time / 60;
        } else if (timeUnit === "hours") {
          displayTime = data.time / 3600;
        }
        return { ...data, displayTime };
      }),
    [chartData, timeUnit]
  );

  const data = useMemo(
    () => ({
      labels: transformedData.map((data: any) => data.place.toString()),
      datasets: [
        {
          label: "Top 10",
          data: transformedData.map((data: any) => data.displayTime),
          backgroundColor: transformedData.map(
            (_, index) =>
              index === 0
                ? "rgb(253, 224, 71, 0.5)" // Gold (yellow-500 equivalent)
                : index === 1
                ? "rgb(156, 163, 175, 0.5)" // Silver (gray-400 equivalent)
                : index === 2
                ? "rgb(194, 65, 12, 0.5)" // Bronze (orange-700 equivalent)
                : "rgba(54, 162, 235, 0.5)" // Default color
          ),
          borderColor: transformedData.map((_, index) =>
            index === 0
              ? "rgb(253, 224, 71, 1)"
              : index === 1
              ? "rgb(156, 163, 175, 1)"
              : index === 2
              ? "rgb(194, 65, 12, 1)"
              : "rgba(54, 162, 235, 1)"
          ),
          borderWidth: 1,
          type: "bar" as "bar",
        },
      ],
    }),
    [transformedData]
  );

  let yAxisLabel = useMemo(() => {
    if (timeUnit === "minutes") {
      return "Time (Minutes)";
    } else if (timeUnit === "hours") {
      return "Time (Hours)";
    }
    return "Time (Seconds)";
  }, [timeUnit]);

  const options = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          title: {
            display: true,
            text: "Leaderboard Placement",
            color: "rgba(255,255,255,1)",
            font: { size: 20, family: "Space Grotesk" },
          },
          grid: { color: "rgba(255,255,255,0.5)" },
          ticks: {
            color: "rgba(255,255,255,0.8)",
            font: { size: 14, family: "Space Grotesk" },
          },
        },
        y: {
          title: {
            display: true,
            text: yAxisLabel,
            color: "rgba(255,255,255,1.0)",
            font: { size: 20, family: "Space Grotesk" },
          },
          grid: { color: "rgba(255,255,255,0.5)" },
          ticks: {
            color: "rgba(255,255,255,0.8)",
            font: { size: 14, family: "Space Grotesk" },
          },
        },
      },
      plugins: {
        tooltip: {
          callbacks: {
            label: (context: any) => {
              const index = context.dataIndex;
              const originalTime = chartData[index].time;
              return `Time: ${formatTime(originalTime)}`;
            },
            title: (context: any) => {
              const index = context[0].dataIndex;
              const playerName = chartData[index].playerName;
              return `#${chartData[index].place}: ${playerName}`;
            },
          },
        },
        legend: {
          labels: {
            color: "rgba(255,255,255,0.8)",
            font: { family: "Space Grotesk" },
          },
        },
      },
      layout: { padding: { left: 20, right: 20, top: 20, bottom: 20 } },
    }),
    [chartData, yAxisLabel]
  );

  const chartRef = useRef<ChartJS | null>(null);

  // Idk why, but it breaks the graph when a bar is clicked
  // const onDataPointClick = (
  //   event: React.MouseEvent<HTMLCanvasElement, MouseEvent>
  // ) => {
  //   if (!chartRef.current) return;
  //   const interactedElement = getElementAtEvent(chartRef.current, event);
  //   if (
  //     interactedElement.length === 0 ||
  //     interactedElement[0].index === undefined
  //   ) {
  //     setActivePlayerIndex(null);
  //   } else {
  //     setActivePlayerIndex(interactedElement[0].index);
  //   }
  // };

  return (
    <div className="mt-4">
      {activePlayerIndex !== null && (
        <div className="flex justify-center items-center gap-2">
          <p className="text-xl">
            {`#${chartData[activePlayerIndex].place}: ${chartData[activePlayerIndex].playerName}`}
          </p>
          {chartData[activePlayerIndex].videoLink && (
            <span>
              <Link target="_blank" to={chartData[activePlayerIndex].videoLink}>
                <Video size={24} />
              </Link>
            </span>
          )}
        </div>
      )}
      {chartData && chartData.length > 0 ? (
        <Bar
          ref={chartRef as any}
          data={data}
          options={options}
          width={800}
          height={400}
        />
      ) : (
        <div className="text-center">No leaderboard data available.</div>
      )}
    </div>
  );
};

export default TopTenChart;
