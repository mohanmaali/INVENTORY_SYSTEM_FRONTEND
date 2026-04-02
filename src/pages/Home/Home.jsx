import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaRocket, FaPaintBrush, FaCode, FaEnvelope, FaLock, FaTimes } from 'react-icons/fa';
import { Card, Button, Input, Modal } from '../../components/ui';

function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const features = [
    {
      title: 'Vite Fast Build',
      description: 'Lightning-fast build times with Vite instant hot module replacement.',
      icon: FaRocket,
    },
    {
      title: 'Tailwind CSS',
      description: 'Utility-first CSS framework for rapid UI development.',
      icon: FaPaintBrush,
    },
    {
      title: 'React + Axios',
      description: 'Modern React with API calls using Axios.',
      icon: FaCode,
    },
  ];

  return (
    <div className="">
      <main>
        {/* Hero Section */}
        <section className="bg-white py-12">
          <div className="container-main text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-6">
              Welcome to <span className="text-primary">Vite + Tailwind</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              A production-ready frontend architecture built with Vite, React, 
              Tailwind CSS, and Axios. Start building your app in minutes.
            </p>
            <div className="flex gap-4 justify-center">
              <Button variant="primary" onClick={() => setIsModalOpen(true)}>
                Get Started
              </Button>
              <Link to="/docs">
                <Button variant="secondary">Learn More</Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16">
          <div className="container-main">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
              Key Features
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                  <div className="flex justify-center mb-4">
                    <feature.icon className="text-3xl text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Demo Section */}
        <section className="bg-white py-16">
          <div className="container-main">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
              Try It Out
            </h2>
            <div className="max-w-md mx-auto">
              <Card>
                <h3 className="text-lg font-semibold mb-4">Quick Demo Form</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address
                    </label>
                    <Input type="email" placeholder="you@example.com" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Password
                    </label>
                    <Input type="password" placeholder="Enter password" />
                  </div>
                  <Button variant="primary" className="w-full">
                    Sign In
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </section>
      </main>

      {/* Demo Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold">Get Started</h3>
            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
              <FaTimes />
            </button>
          </div>
          <p className="text-gray-600 mb-6">
            To get started with this project, run the following commands:
          </p>
          <div className="bg-gray-100 p-4 rounded-md mb-6">
            <code className="text-sm text-gray-800">
              npm install<br />
              npm run dev
            </code>
          </div>
          <div className="flex justify-end">
            <Button variant="primary" onClick={() => setIsModalOpen(false)}>
              Got it!
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default Home;
