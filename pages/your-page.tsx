import React from 'react';
import DotPattern from '@/components/magicui/dot-pattern';

const YourPage: React.FC = () => {
  return (
    <div className="relative min-h-screen">
      {/* Line 4: Add the DotPattern component */}
      <DotPattern className="absolute inset-0 z-0" />
      
      {/* Your page content goes here */}
      <div className="relative z-10">
        <h1>Your Page Content</h1>
        {/* Add more content as needed */}
      </div>
    </div>
  );
};

export default YourPage;