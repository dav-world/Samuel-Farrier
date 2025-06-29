/* eslint-disable */
// @ts-nocheck

import React from 'react';
import ArtworkDetail from './ArtworkDetail'; // Ensure this path is correct
import { PortableTextBlock } from '@sanity/types';

interface Artwork {
  _id: string;
  name: string;
  year: number;
  date: string;
  dimensions: string;
  medium: string;
  description: PortableTextBlock[];
  images: any[];
  videos: string[] | null;
  press: PortableTextBlock[];
  visibility: string;
  exhibited: boolean;
  exhibitionLink: string;
  available: string;
  buyer: string | null;
  date_purchased: number | null;
  purchase_price: number | null;
  price: number;
  notes: PortableTextBlock[];
  relatedExhibitions?: Array<{ _id: string; name: string }>;
  categories: string[];
}

interface ArtworkListItemProps {
  artwork: Artwork;
  expanded: boolean;
  onClick: () => void;
}

const ArtworkListItem: React.FC<ArtworkListItemProps> = ({ artwork, expanded, onClick }) => {
  return (
    <li className="mb-4">
      {/* Display artwork basic info */}
      <div onClick={onClick} style={{ cursor: 'pointer' }}>
        <h2 className="text-lg font-bold text-blue-500 hover:underline">{artwork.name}</h2>
        {/* <p>Year: {artwork.year}</p>
        {artwork.date && <p>Date: {new Date(artwork.date).toLocaleDateString()}</p>}
        <p>Dimensions: {artwork.dimensions}</p>
        <p>Medium: {artwork.medium}</p> */}
      </div>

      {/* Conditionally render the detailed artwork view when expanded */}
      {expanded && (
        <div className="mt-2 p-4 border border-gray-300 rounded-lg bg-gray-50">
          <ArtworkDetail artwork={artwork} />
        </div>
      )}
    </li>
  );
};

export default ArtworkListItem;
