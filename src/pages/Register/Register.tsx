import { pageLayout } from "@/lib/common-styles";
import { RegisterForm } from "./RegisterForm";

const Register = () => {
  return (
    <div
      className={`${pageLayout} flex h-full w-full items-center justify-center p-6 md:p-10`}
    >
      <div className="w-full max-w-sm">
        <RegisterForm />
      </div>
    </div>
  );
};

export default Register;
