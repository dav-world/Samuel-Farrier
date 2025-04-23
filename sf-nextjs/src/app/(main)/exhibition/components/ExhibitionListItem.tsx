/* eslint-disable */
// @ts-nocheck

import React from 'react';
import ExhibitionDetail from './ExhibitionDetail'; // Ensure this path is correct

interface Exhibition {
  _id: string;
  name: string;
  year: number;
  startDate: string;
  endDate: string;
  venue_name: string;
  city: string;
  venue_type: string;
  url: string;
  address: string;
  show_type: string;
  curator: string;
  images: any[];
  press: any[];
  videos: string[];
  notes: any[];
  relatedArtworks?: Array<{ _id: string; name: string }>;
}

interface ExhibitionListItemProps {
  exhibition: Exhibition;
  expanded: boolean;
  onClick: () => void;
}

const ExhibitionListItem: React.FC<ExhibitionListItemProps> = ({ exhibition, expanded, onClick }) => {
  return (
    <li className="mb-4">
      {/* Display exhibition basic info */}
      <div onClick={onClick} style={{ cursor: 'pointer' }}>
        <h2 className="text-lg font-bold text-blue-500 hover:underline">{exhibition.name}</h2>
        {/* <p>{exhibition.venue_name} - {exhibition.city}</p> */}
      </div>

      {/* Conditionally render the detailed exhibition view when expanded */}
      {expanded && (
        <div className="mt-2 p-4 border border-gray-300 rounded-lg bg-gray-50">
          <ExhibitionDetail exhibition={exhibition} />
        </div>
      )}
    </li>
  );
};

export default ExhibitionListItem;
