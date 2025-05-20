
import React from 'react';
import { Site } from '@/types';

interface SiteHeaderProps {
  site: Site;
}

const SiteHeader: React.FC<SiteHeaderProps> = ({ site }) => {
  return (
    <div className="text-center mb-4">
      <h1 className="text-2xl font-bold mb-1 text-mybin-primary">MyBin.App</h1>
      <div className="bg-mybin-light bg-opacity-20 p-2 rounded-lg">
        <h2 className="font-medium">{site.name}</h2>
        <p className="text-sm text-mybin-gray">{site.area}</p>
      </div>
    </div>
  );
};

export default SiteHeader;
