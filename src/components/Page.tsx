import React from 'react';
import DotPattern from '@/components/magicui/dot-pattern';

const LandingPage: React.FC = () => {
  return (
    <div className="relative min-h-screen">
      {/* Line 6: Add the DotPattern component */}
      <DotPattern className="absolute inset-0 z-0" />
      
      {/* Existing content wrapped in a relative container */}
      <div className="relative z-10">
        <h1>Hello World</h1>
      </div>
    </div>
  );
};

export default LandingPage;