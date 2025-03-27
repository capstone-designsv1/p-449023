import React, { ReactNode } from "react";
import Header from "./Header";

interface LandingLayoutProps {
  children: ReactNode;
}

const LandingLayout: React.FC<LandingLayoutProps> = ({ children }) => {
  return (
    <div className="bg-white overflow-hidden">
      <div className="bg-white w-full max-md:max-w-full">
        <div className="flex flex-col relative min-h-[1080px] w-full overflow-hidden items-center pt-[62px] pb-[219px] px-20 max-md:max-w-full max-md:pb-[100px] max-md:px-5">
          <img
            src="https://cdn.builder.io/api/v1/image/assets/TEMP/9a1ace220285d6956036c90db7aca37d551cb275?placeholderIfAbsent=true"
            alt="Background"
            className="absolute h-full w-full object-cover inset-0"
          />
          <div className="relative w-full max-w-[1482px] -mb-11 max-md:max-w-full max-md:mb-2.5">
            <Header />
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingLayout;
