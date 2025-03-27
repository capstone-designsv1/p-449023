import React from "react";
import { Button } from "@/components/ui/button";

const Header: React.FC = () => {
  return (
    <header className="w-full max-w-[1482px]">
      <nav className="flex w-full items-stretch gap-5 text-xl flex-wrap justify-between max-md:max-w-full">
        <div className="flex items-stretch gap-[25px] text-black font-normal text-right leading-9 my-auto">
          <a href="#" className="grow hover:text-gray-700 transition-colors">
            Home
          </a>
          <a href="#" className="hover:text-gray-700 transition-colors">
            About us
          </a>
          <a
            href="#"
            className="basis-auto hover:text-gray-700 transition-colors"
          >
            Contact us
          </a>
        </div>
        <div className="flex items-stretch gap-[31px] font-bold">
          <a
            href="#"
            className="text-[rgba(25,26,35,1)] my-auto hover:underline"
          >
            Login
          </a>
          <Button className="bg-[rgba(97,228,197,1)] border gap-2.5 text-black px-8 py-4 rounded-[15px] border-[rgba(25,26,35,1)] border-solid hover:bg-[rgba(77,208,177,1)] transition-colors max-md:px-5">
            Sign up
          </Button>
        </div>
      </nav>
    </header>
  );
};

export default Header;
