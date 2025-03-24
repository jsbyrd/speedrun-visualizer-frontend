import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import { pageLayout } from "@/lib/common-styles";

const ErrorPage = () => {
  const [countdown, setCountdown] = useState(10);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => {
      if (countdown <= 0) {
        navigate("/");
        return;
      }
      setCountdown((prevCount) => {
        if (prevCount < 1) {
          clearInterval(timer);
          return 0;
        }
        return prevCount - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [countdown, navigate]);

  const handleSkipClick = () => {
    navigate("/");
  };

  return (
    <div className={`${pageLayout} justify-center items-center`}>
      <div className="p-8 bg-white/20 rounded-xl shadow-md max-w-md w-full text-center space-y-6">
        <div className="flex justify-center">
          <AlertCircle className="h-24 w-24 text-red-500 animate-pulse" />
        </div>

        <h1 className="text-4xl font-bold">Oops!</h1>

        <p className="text-xl">Page not found</p>

        <div className="text-lg">
          Redirecting you to home in{" "}
          <span className="inline-block w-8 h-8 leading-8 text-white rounded-full bg-blue-500">
            {countdown}
          </span>
        </div>

        <div className="relative pt-8">
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-white transition-all duration-1000 ease-linear"
              style={{ width: `${(countdown / 10) * 100}%` }}
            />
          </div>
        </div>

        <Button
          onClick={handleSkipClick}
          variant="default"
          className="bg-blue-500 hover:bg-blue-500/70"
        >
          Go to Home
        </Button>

        <p className="text-sm text-white/80 italic">
          "In chess, as in life, not every move goes as planned."
        </p>
      </div>
    </div>
  );
};

export default ErrorPage;
