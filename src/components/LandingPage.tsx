import React from 'react';
import { Button } from "@/components/ui/button";
import DotPattern from "@/components/magicui/dot-pattern";
import ShinyButton from "@/components/magicui/shiny-button"; // Line 4: Import ShinyButton
import FeaturedWorkflows from "@/components/FeaturedWorkflows";
import Marquee from "@/components/magicui/marquee"; // Line 5: Import Marquee

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen w-full bg-black text-gray-300 overflow-y-auto relative">
      <DotPattern className="absolute inset-0 opacity-20" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <header className="py-6 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-100">NoCode Marketplace</h1>
          <Button variant="outline" className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-gray-100">Sign In</Button>
        </header>

        {/* Hero Section */}
        <section className="flex flex-col justify-center items-center mt-20">
          <div className="text-center">
            <h2 className="text-5xl font-bold text-gray-100 mb-16">
              Unleash Your Business Potential with the Ultimate AI Workflow Hub!
            </h2>
            <p className="text-xl text-gray-300 mb-12">
              Seamlessly Integrate, Automate, and Monetize Your Workflows—Power Your Success with RocketLauncher.ai!
            </p>
            <ShinyButton text="Get Started" className="text-lg" />
          </div>
        </section>

        {/* Marquee Section */}
        <section className="mt-20">
          <Marquee className="py-4 bg-gray-800 bg-opacity-50">
            <span className="text-xl font-semibold mx-4">Automate Your Workflows</span>
            <span className="text-xl font-semibold mx-4">Boost Productivity</span>
            <span className="text-xl font-semibold mx-4">Integrate AI Solutions</span>
            <span className="text-xl font-semibold mx-4">Scale Your Business</span>
          </Marquee>
        </section>
      </div>
    </div>
  );
};

export default LandingPage;