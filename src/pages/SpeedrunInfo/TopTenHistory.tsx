import { RunData } from "./types";
import { CircularProgress } from "@mui/material";

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
        <button
          onClick={onFetchRuns}
          className="px-4 py-2 rounded-md bg-transparent border border-white hover:bg-white/10 hover:cursor-pointer text-white"
        >
          Create Top 10 History
        </button>
      </div>
    );
  }

  return (
    <div className="mt-10">
      <h2 className="text-2xl font-bold mb-4">Top 10 History</h2>
      <ul>
        {runs.map((run, index) => (
          <li key={index} className="mb-2">
            {run.players?.data[0].names?.international} - {run.times.primary_t}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TopTenHistory;
