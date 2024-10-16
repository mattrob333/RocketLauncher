import React from 'react';
import { Button } from "@/components/ui/button";

interface RightPanelProps {
  title: string;
  items: string[];
}

export function RightPanel({ title, items }: RightPanelProps) {
  return (
    <div className="w-64 p-4 bg-secondary">
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-2 text-primary">User Profile</h2>
        <p className="text-secondary-foreground">Profile details will go here</p>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-bold mb-2 text-primary">{title}</h2>
        <ul className="space-y-2">
          {items.map((item, index) => (
            <li key={index} className="flex items-center">
              <span className="mr-2 text-green-500">✓</span>
              <span className="text-secondary-foreground">{item}</span>
            </li>
          ))}
        </ul>
      </div>

      <Button className="w-full" variant="outline">
        Open Notepad
      </Button>
    </div>
  );
}
