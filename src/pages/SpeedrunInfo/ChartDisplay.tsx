import React, { useRef, useState } from "react";
import { getElementAtEvent, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
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
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

type ChartDisplayProps = {
  leaderboard: Leaderboard | null;
};

const ChartDisplay: React.FC<ChartDisplayProps> = ({ leaderboard }) => {
  if (!leaderboard)
    return (
      <div className="flex justify-center items-center">
        <CircularProgress size={100} />
      </div>
    );
  const [activePlayerIndex, setActivePlayerIndex] = useState<number | null>(
    null
  );

  const chartData = leaderboard.runs.map((run: Run, index: number) => ({
    place: index + 1,
    time: run.run.times.primary_t,
    playerName:
      leaderboard.players.data.find(
        (player) => player.id === run.run.players[0]?.id
      )?.names?.international ?? "Anonymous",
    videoLink: run.run.videos?.links
      ? run.run.videos?.links[0]?.uri
      : undefined,
  }));

  const averageTime =
    chartData.reduce(
      (acc: number, run: { time: number }) => acc + run.time,
      0
    ) / chartData.length;

  let timeUnit = "seconds";
  if (averageTime >= 120 && averageTime < 7200) {
    timeUnit = "minutes";
  } else if (averageTime >= 7200) {
    timeUnit = "hours";
  }

  const transformedData = chartData.map((data: any) => {
    let displayTime = data.time;
    if (timeUnit === "minutes") {
      displayTime = data.time / 60;
    } else if (timeUnit === "hours") {
      displayTime = data.time / 3600;
    }
    return { ...data, displayTime };
  });

  const data = {
    labels: transformedData.map((data: any) => data.place.toString()),
    datasets: [
      {
        label: "Top 100",
        data: transformedData.map((data: any) => data.displayTime),
        fill: false,
        borderColor: "rgba(0, 0, 0, 0.2)",
        tension: 0.4,
        backgroundColor: "white",
      },
    ],
  };

  let yAxisLabel = "Time (Seconds)";
  if (timeUnit === "minutes") {
    yAxisLabel = "Time (Minutes)";
  } else if (timeUnit === "hours") {
    yAxisLabel = "Time (Hours)";
  }

  const options = {
    scales: {
      x: {
        title: {
          display: true,
          text: "Leaderboard Placement",
          color: "rgba(255, 255, 255, 0.9)",
          font: { size: 20 },
        },
        grid: { color: "rgba(255, 255, 255, 0.5)" },
        ticks: { color: "rgba(255, 255, 255, 0.8)", font: { size: 14 } },
      },
      y: {
        title: {
          display: true,
          text: yAxisLabel,
          color: "rgba(255, 255, 255, 0.9)",
          font: { size: 20 },
        },
        grid: { color: "rgba(255, 255, 255, 0.5)" },
        ticks: { color: "rgba(255, 255, 255, 0.8)", font: { size: 14 } },
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
        labels: { color: "rgba(255, 255, 255, 0.8)" },
      },
    },
    elements: { line: { borderColor: "white" } },
    layout: { padding: { left: 20, right: 20, top: 20, bottom: 20 } },
  };

  const chartRef = useRef<ChartJS | null>(null);
  const onDataPointClick = (
    event: React.MouseEvent<HTMLCanvasElement, MouseEvent>
  ) => {
    if (!chartRef.current) return;
    const interactedElement = getElementAtEvent(chartRef.current, event);
    if (
      interactedElement.length === 0 ||
      interactedElement[0].index == undefined
    ) {
      console.log(interactedElement);
      setActivePlayerIndex(null);
    } else {
      setActivePlayerIndex(interactedElement[0].index);
    }
  };

  return (
    <div className="mt-4">
      {activePlayerIndex !== null && (
        <div className="flex justify-center items-center gap-2">
          <p className="text-xl">{`#${chartData[activePlayerIndex].place}: ${chartData[activePlayerIndex].playerName}`}</p>
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
        <Line
          ref={chartRef as any}
          onClick={onDataPointClick}
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

export default ChartDisplay;
