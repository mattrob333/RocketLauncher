import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Star } from "lucide-react";

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen w-full bg-black text-gray-300 overflow-y-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="py-6 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-100">NoCode Marketplace</h1>
          <Button variant="outline" className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-gray-100">Sign In</Button>
        </header>

        {/* Hero Section */}
        <section className="py-16 text-center">
          <h2 className="text-5xl font-bold mb-6 text-gray-100">Connect with No-Code Freelancers</h2>
          <p className="text-xl mb-8 text-gray-300">Find experts or sell your custom workflows</p>
          <Button className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-gray-100 text-lg px-8 py-4">Get Started</Button>
        </section>

        {/* Featured Workflows */}
        <section className="py-16">
          <h3 className="text-3xl font-bold mb-8 text-gray-100">Featured Workflows</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-card-foreground">Workflow {i}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Description of featured workflow {i}</p>
                  <Button variant="link" className="text-primary mt-4">
                    Learn More <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* All-in-One No-Code Dashboard */}
        <section className="py-16 text-center bg-gray-900">
          <h3 className="text-3xl font-bold mb-6 text-gray-100">Gain Access to Our All-in-One No-Code Dashboard</h3>
          <p className="text-xl mb-8 text-gray-300">Integrates with Flowise, n8n, Langflow, Make.com, Zapier, and more!</p>
          <Button className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-gray-100 text-lg px-8 py-4">Join the Waitlist</Button>
        </section>

        {/* Top Freelancers */}
        <section className="py-16">
          <h3 className="text-3xl font-bold mb-8 text-gray-100">Top Freelancers</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="bg-card border-border">
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 rounded-full bg-secondary"></div>
                    <div>
                      <h4 className="font-bold text-card-foreground">Freelancer {i}</h4>
                      <p className="text-sm text-muted-foreground">Specialty</p>
                    </div>
                  </div>
                  <div className="flex items-center mt-4">
                    <Star className="text-primary h-5 w-5" />
                    <span className="ml-2 text-muted-foreground">4.9 (120 reviews)</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Business Departments */}
        <section className="py-16">
          <h3 className="text-3xl font-bold mb-8 text-gray-100">Explore by Department</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {['Marketing', 'Copywriting', 'Social Media'].map((dept) => (
              <Card key={dept} className="bg-card hover:bg-secondary transition-colors cursor-pointer border-border">
                <CardContent className="flex items-center justify-between p-6">
                  <h4 className="text-xl font-semibold text-card-foreground">{dept}</h4>
                  <ArrowRight className="h-6 w-6 text-primary" />
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Workflow Deals */}
        <section className="py-16">
          <h3 className="text-3xl font-bold mb-8 text-gray-100">Workflow Deals</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-card-foreground">Deal {i}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="mb-4 text-muted-foreground">Amazing workflow at a discounted price!</p>
                  <Button className="w-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-primary-foreground">Get Deal</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-900 py-8 mt-16">
          <div className="text-center">
            <p className="text-gray-400">&copy; 2024 NoCode Marketplace. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default LandingPage;