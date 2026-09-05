import React from 'react';

const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FCFBF7] text-[#151515]">
      <div className="text-center">
        <div className="text-6xl font-bold text-[#1F5742] mb-4">404</div>
        <h1 className="text-2xl font-medium mb-2">Page Not Found</h1>
        <p className="text-[#6D6D6D] mb-8">The page you are looking for does not exist.</p>
        <div className="flex gap-4">
          <a href="/" className="bg-[#1F5742] text-white px-6 py-3 rounded-lg hover:bg-[#164030] transition-colors">
            Go to Home
          </a>
          <a href="/shop" className="bg-white text-[#1F5742] px-6 py-3 rounded-lg border border-[#E7E3DA] hover:bg-[#FCFBF7] transition-colors">
            Visit Shop
          </a>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;