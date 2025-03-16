import { pageLayout } from "@/lib/common-styles";
import { LoginForm } from "./LoginForm";

const Login = () => {
  return (
    <div
      className={`${pageLayout} flex h-full w-full items-center justify-center p-6 md:p-10`}
    >
      <div className="w-full max-w-sm">
        <LoginForm />
      </div>
    </div>
  );
};

export default Login;
