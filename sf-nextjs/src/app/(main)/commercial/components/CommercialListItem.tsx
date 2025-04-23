/* eslint-disable */
// @ts-nocheck

import React from 'react';
import CommercialDetail from './CommercialDetail'; // Ensure this path is correct
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

interface CommercialListItemProps {
  commercial: Commercial;
  expanded: boolean;
  onClick: () => void;
}

const CommercialListItem: React.FC<CommercialListItemProps> = ({ commercial, expanded, onClick }) => {
  return (
    <li className="mb-4">
      {/* Display commercial basic info */}
      <div onClick={onClick} style={{ cursor: 'pointer' }}>
        <h2 className="text-lg font-bold text-blue-500 hover:underline">{commercial.name}</h2>
        {commercial.date && <p>Date: {new Date(commercial.date).toLocaleDateString()}</p>}
      </div>

      {/* Conditionally render the detailed commercial view when expanded */}
      {expanded && (
        <div className="mt-2 p-4 border border-gray-300 rounded-lg bg-gray-50">
          <CommercialDetail commercial={commercial} />
        </div>
      )}
    </li>
  );
};

export default CommercialListItem;
