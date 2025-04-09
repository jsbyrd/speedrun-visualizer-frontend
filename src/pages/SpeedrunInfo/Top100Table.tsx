import React from "react";
import { Leaderboard, Run } from "./types";
import { formatTime } from "@/lib/format-time";
import { Link } from "react-router";
import { Video } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";

type Top100TableProps = {
  leaderboard: Leaderboard | null;
};

const Top100Table: React.FC<Top100TableProps> = ({ leaderboard }) => {
  if (!leaderboard || !leaderboard.runs || leaderboard.runs.length === 0) {
    return null;
  }

  return (
    <div className="w-full mt-12">
      <ScrollArea className="h-[400px] w-full rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-white">Place</TableHead>
              <TableHead className="text-white">User</TableHead>
              <TableHead className="text-white">Time</TableHead>
              <TableHead className="text-white">Run Link</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leaderboard.runs.map((run: Run, index: number) => (
              <TableRow
                key={run.run.id}
                className={index % 2 === 0 ? "bg-transparent" : "bg-white/10"}
              >
                <TableCell>{index + 1}.</TableCell>
                <TableCell>
                  {leaderboard.players.data.find(
                    (player) => player.id === run.run.players[0]?.id
                  )?.names?.international ?? "Anonymous"}
                </TableCell>
                <TableCell>{formatTime(run.run.times.primary_t)}</TableCell>
                <TableCell>
                  {run.run.videos?.links && run.run.videos.links[0]?.uri && (
                    <Link to={run.run.videos.links[0].uri} target="_blank">
                      <Video className="md:hidden" size={20} />
                      <p className="hidden md:inline-block">
                        {run.run.videos.links[0].uri}
                      </p>
                    </Link>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>
    </div>
  );
};

export default Top100Table;
