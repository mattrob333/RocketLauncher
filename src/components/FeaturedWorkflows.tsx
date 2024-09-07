import React from 'react';
import Image from 'next/image';

interface Workflow {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
}

const workflows: Workflow[] = [
  {
    id: 1,
    title: "Data Analysis",
    description: "Automate your data analysis pipeline",
    imageUrl: "/images/data-analysis.jpg",
  },
  {
    id: 2,
    title: "Machine Learning",
    description: "Train and deploy ML models with ease",
    imageUrl: "/images/machine-learning.jpg",
  },
  // Add more workflows as needed
];

const FeaturedWorkflows: React.FC = () => {
  return (
    <section className="py-12 bg-gray-100">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold mb-8 text-center">Featured Workflows</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {workflows.map((workflow) => (
            <div key={workflow.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <Image src={workflow.imageUrl} alt={workflow.title} width={400} height={200} className="w-full h-48 object-cover" />
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">{workflow.title}</h3>
                <p className="text-gray-600">{workflow.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedWorkflows;
