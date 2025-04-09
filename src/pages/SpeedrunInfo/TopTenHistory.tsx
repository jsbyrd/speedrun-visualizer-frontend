import React, { useState, useRef, useEffect, useMemo } from "react";
import * as d3 from "d3";
import { RunData } from "./types";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  PlayArrow,
  Pause,
  SkipPrevious,
  SkipNext,
  FastRewind,
  FastForward,
} from "@mui/icons-material";
import { processRunsForAnimation } from "./utils";
import { format, parseISO, addDays, isValid } from "date-fns";
import { CircularProgress } from "@mui/material";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface TopTenHistoryProps {
  runs: RunData[];
  isLoading: boolean;
  onFetchRuns: () => void;
}

const TopTenHistory: React.FC<TopTenHistoryProps> = ({
  runs,
  isLoading,
  onFetchRuns,
}) => {
  const [currentFrameIndex, setCurrentFrameIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const animationRef = useRef<HTMLDivElement>(null);
  const animationData = useMemo(() => processRunsForAnimation(runs), [runs]);
  const intervalRef = useRef<d3.Timer | null>(null);
  const [animationDate, setAnimationDate] = useState("");
  const [animationSpeed, setAnimationSpeed] = useState(100);
  const today = format(new Date(), "yyyy-MM-dd");
  const [updateTrigger, setUpdateTrigger] = useState(0);

  // Calculate world record time
  const worldRecordTime = useMemo(() => {
    if (!runs || runs.length === 0) return 0;
    const times = runs
      .map((run) => run.times.primary_t)
      .filter((time) => time > 0);
    return times.length > 0 ? Math.min(...times) : 0;
  }, [runs]);

  useEffect(() => {
    if (animationData.length > 0) {
      setAnimationDate(animationData[0].date);
    }
  }, [animationData]);

  useEffect(() => {
    if (animationRef.current && animationData.length > 0 && isPlaying) {
      intervalRef.current = d3.interval(() => {
        setAnimationDate((prevAnimationDate) => {
          if (!isValid(parseISO(prevAnimationDate))) {
            console.error("Invalid date:", prevAnimationDate);
            setIsPlaying(false);
            return prevAnimationDate;
          }
          const nextDate = format(
            addDays(parseISO(prevAnimationDate), 1),
            "yyyy-MM-dd"
          );
          const nextFrameIndex = animationData.findIndex(
            (frame) => frame.date === nextDate
          );
          if (nextFrameIndex !== -1) {
            setCurrentFrameIndex(nextFrameIndex);
            if (nextDate === today) {
              setIsPlaying(false);
            }
            return nextDate;
          } else if (nextDate > today) {
            setIsPlaying(false);
            return prevAnimationDate;
          } else {
            return nextDate;
          }
        });
      }, animationSpeed);
    } else if (intervalRef.current) {
      intervalRef.current.stop();
      intervalRef.current = null;
    }
    return () => {
      if (intervalRef.current) {
        intervalRef.current.stop();
      }
    };
  }, [animationData, isPlaying, animationSpeed]);

  const handlePlayPause = () => {
    setIsPlaying((prevIsPlaying) => !prevIsPlaying);
  };

  const handleGoToStart = () => {
    setCurrentFrameIndex(0);
    setAnimationDate(animationData[0].date);
    setIsPlaying(false);
    setUpdateTrigger((prev) => prev + 1);
  };

  const handleGoReverse = () => {
    if (currentFrameIndex > 0) {
      setCurrentFrameIndex(currentFrameIndex - 1);
      setAnimationDate(animationData[currentFrameIndex - 1].date);
      setUpdateTrigger((prev) => prev + 1);
    }
  };

  const handleGoForward = () => {
    if (currentFrameIndex < animationData.length - 1) {
      setCurrentFrameIndex(currentFrameIndex + 1);
      setAnimationDate(animationData[currentFrameIndex + 1].date);
      setUpdateTrigger((prev) => prev + 1);
    }
  };

  const handleGoToToday = () => {
    setAnimationDate(today);
    setCurrentFrameIndex(animationData.length - 1);
    setIsPlaying(false);
    setUpdateTrigger((prev) => prev + 1);
  };

  const handleSpeedChange = (value: string) => {
    const speedMultiplier = 1 / parseFloat(value);
    setAnimationSpeed(100 * speedMultiplier);
  };

  const getPositionText = (position: number) => {
    if (position === 0) return "1st";
    if (position === 1) return "2nd";
    if (position === 2) return "3rd";
    return `${position + 1}th`;
  };

  const formatTime = (timeInSeconds: number | undefined): string => {
    if (timeInSeconds === undefined || timeInSeconds === null) {
      return "N/A";
    }
    const hours = Math.floor(timeInSeconds / 3600);
    const minutes = Math.floor((timeInSeconds % 3600) / 60);
    const seconds = Math.floor(timeInSeconds) % 60;
    let formattedTime = "";
    if (hours > 0) {
      formattedTime += `${hours}h`;
    }
    if (hours > 0 || minutes > 0) {
      formattedTime += `${minutes < 10 ? "0" : ""}${minutes}m`;
    }
    formattedTime += `${seconds < 10 ? "0" : ""}${seconds}s`;
    return formattedTime.trim();
  };

  const listItems = useMemo(() => {
    if (!animationData || animationData.length === 0) return [];
    const currentFrame = animationData[currentFrameIndex];
    const items = [];
    if (!currentFrame) return [];
    const timesInSeconds = currentFrame.top10
      .map((item) => (item ? item?.times?.primary_t : 0))
      .filter((time) => time > 0);
    const slowestTime =
      timesInSeconds.length > 0 ? timesInSeconds[timesInSeconds.length - 1] : 0;
    for (let index = 0; index < 10; index++) {
      const item = currentFrame.top10[index];
      if (!item) {
        items.push(
          <li key={index} className="flex items-center">
            ---
          </li>
        );
      } else {
        const barColor =
          index === 0
            ? "bg-yellow-500"
            : index === 1
            ? "bg-gray-400"
            : index === 2
            ? "bg-orange-700"
            : "bg-black/40";
        let barWidth;
        if (worldRecordTime === slowestTime) {
          barWidth = "30%";
        } else {
          const timeInSeconds = item?.times?.primary_t || 0;
          const normalizedTime =
            (timeInSeconds - worldRecordTime) / (slowestTime - worldRecordTime);
          barWidth = `${Math.ceil(30 + normalizedTime * (100 - 30))}%`;
        }
        items.push(
          <li key={index} className="flex items-center">
            <span
              className="mr-2"
              style={{ minWidth: "30px", display: "inline-block" }}
            >
              {getPositionText(index)}
            </span>
            <div className="flex flex-grow items-center">
              <div
                className={`px-2 py-1 rounded overflow-hidden whitespace-nowrap text-ellipsis ${barColor}`}
                style={{ width: barWidth }}
              >
                {item?.players?.data?.[0]?.rel === "guest"
                  ? item?.players?.data?.[0]?.name
                  : item?.players?.data?.[0]?.names?.international ||
                    item?.players?.data?.[0]?.name ||
                    "Guest"}
              </div>
              <span className="ml-2">{formatTime(item?.times?.primary_t)}</span>
            </div>
          </li>
        );
      }
    }
    return items;
  }, [currentFrameIndex, animationData, updateTrigger, worldRecordTime]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center mt-10">
        <CircularProgress size={100} />
      </div>
    );
  }

  if (runs.length === 0) {
    return (
      <div className="flex justify-center items-center mt-10">
        <Button
          onClick={onFetchRuns}
          className="border border-white bg-transparent text-white hover:bg-white/10"
        >
          Generate Top 10 History
        </Button>
      </div>
    );
  }

  return (
    <div className="mt-10">
      {animationData.length > 0 && (
        <div ref={animationRef}>
          <p>Date: {animationDate}</p>
          <ul className="flex flex-col gap-1">{listItems}</ul>
        </div>
      )}
      <TooltipProvider>
        <div className="flex gap-2 mt-4">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={handleGoToStart}
                className="border border-white bg-transparent text-white hover:bg-white/10"
              >
                <FastRewind />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Go to the start of the animation.</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={handleGoReverse}
                className="border border-white bg-transparent text-white hover:bg-white/10"
              >
                <SkipPrevious />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Go to the previous frame.</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={handlePlayPause}
                className="border border-white bg-transparent text-white hover:bg-white/10"
              >
                {isPlaying ? <Pause /> : <PlayArrow />}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>
                {isPlaying ? "Pause the animation." : "Play the animation."}
              </p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={handleGoForward}
                className="border border-white bg-transparent text-white hover:bg-white/10"
              >
                <SkipNext />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Go to the next frame.</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={handleGoToToday}
                className="border border-white bg-transparent text-white hover:bg-white/10"
              >
                <FastForward />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Go to the current date.</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>
      <div className="mt-2">
        <label className="block mb-1 text-white">Animation Speed</label>
        <Select
          value={(1 / (animationSpeed / 100)).toString()}
          onValueChange={handleSpeedChange}
        >
          <SelectTrigger className="w-[180px] border border-white bg-transparent text-white">
            <SelectValue placeholder="Select Speed" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="0.25">0.25x</SelectItem>
            <SelectItem value="0.5">0.5x</SelectItem>
            <SelectItem value="1">1x</SelectItem>
            <SelectItem value="2">2x</SelectItem>
            <SelectItem value="4">4x</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default TopTenHistory;
