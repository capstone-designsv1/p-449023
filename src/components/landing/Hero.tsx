import React from "react";
import { Button } from "@/components/ui/button";

const Hero: React.FC = () => {
  return (
    <section className="mr-[34px] mt-[122px] max-md:max-w-full max-md:mr-2.5 max-md:mt-10">
      <div className="gap-5 flex max-md:flex-col max-md:items-stretch">
        {/* Left Column */}
        <div className="w-2/5 max-md:w-full max-md:ml-0">
          <div className="flex w-full flex-col self-stretch items-stretch font-normal my-auto max-md:max-w-full max-md:mt-10">
            <h1 className="text-[rgba(25,26,35,1)] text-5xl font-bold leading-[62px] max-md:max-w-full max-md:text-[40px] max-md:leading-[58px]">
              <span
                style={{
                  fontFamily:
                    "Space Grotesk, -apple-system, Roboto, Helvetica, sans-serif",
                }}
              >
                Ace Your Design{" "}
              </span>
              <span
                style={{
                  fontFamily:
                    "Space Grotesk, -apple-system, Roboto, Helvetica, sans-serif",
                  color: "rgba(25,26,35,1)",
                }}
              >
                Whiteboard Challenges
              </span>
            </h1>
            <img
              src="https://cdn.builder.io/api/v1/image/assets/TEMP/a8344a29d7b393c5d46598caff4642ea18db2a30?placeholderIfAbsent=true"
              alt="Decorative line"
              className="aspect-[8.77] object-contain w-[210px] max-w-full mr-[61px] mt-1 max-md:mr-2.5"
            />
            <p className="text-[rgba(28,14,13,1)] text-2xl leading-[30px] mt-[23px] max-md:max-w-full max-md:mr-[5px]">
              Practice design whiteboarding with an AI that listens, responds,
              and gives instant feedback—just like a real interviewer.
            </p>
            <Button className="bg-[rgba(97,228,197,1)] border gap-2.5 text-lg text-black mt-12 px-8 py-[18px] rounded-[15px] border-black border-solid hover:bg-[rgba(77,208,177,1)] transition-colors max-md:mt-10 max-md:px-5">
              Start Practicing for Free
            </Button>
          </div>
        </div>

        {/* Right Column */}
        <div className="w-3/5 ml-5 max-md:w-full max-md:ml-0">
          <div className="flex grow flex-col items-stretch text-lg text-[rgba(25,26,35,1)] font-normal text-center leading-[1.2] max-md:max-w-full max-md:mt-10">
            <img
              src="https://cdn.builder.io/api/v1/image/assets/TEMP/04a9f923-4964-403d-a480-503ecdda3856?placeholderIfAbsent=true"
              alt="Design whiteboard interface"
              className="aspect-[1.58] object-contain w-full max-md:max-w-full"
            />
            <div className="bg-[rgba(233,231,252,1)] border mr-[45px] mt-[33px] px-6 py-5 rounded-[20px] border-[rgba(25,71,229,1)] border-solid max-md:mr-2.5 max-md:px-5">
              Live Conversational Feedback
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
