/* eslint-disable */
// @ts-nocheck

import { useState } from 'react';
import CommercialListItem from './CommercialListItem'; // Make sure this import path is correct
import { PortableTextBlock } from '@sanity/types';

interface Commercial {
  _id: string;
  name: string;
  date: number;
  images: any[];
  description: PortableTextBlock[];
  photographer: string;
  stylist: string;
  category: string;
}

interface CommercialsListProps {
  commercials: Commercial[];
}

const CommercialsList: React.FC<CommercialsListProps> = ({ commercials }) => {
  const [expandedCommercialId, setExpandedCommercialId] = useState<string | null>(null);

  // Toggle expanded/collapsed state for each commercial
  const toggleCommercial = (id: string) => {
    setExpandedCommercialId((prevId) => (prevId === id ? null : id));
  };

  return (
    <ul>
      {commercials.map((commercial) => (
        <CommercialListItem
          key={commercial._id}
          commercial={commercial}
          expanded={commercial._id === expandedCommercialId}
          onClick={() => toggleCommercial(commercial._id)}
        />
      ))}
    </ul>
  );
};

export default CommercialsList;
