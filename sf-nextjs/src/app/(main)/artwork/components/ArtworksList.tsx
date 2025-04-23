/* eslint-disable */
// @ts-nocheck

import { useState } from 'react';
import ArtworkListItem from './ArtworkListItem'; 
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
  videos: string[];
  press: PortableTextBlock[];
  visibility: string;
  exhibited: boolean;
  exhibitionLink: string;
  available: string;
  buyer: string;
  date_purchased: number;
  purchase_price: number;
  price: number;
  notes: PortableTextBlock[];
  relatedExhibitions?: Array<{ _id: string; name: string }>;
  category: string;
}

interface ArtworksListProps {
  artworks: Artwork[];
}

const ArtworksList: React.FC<ArtworksListProps> = ({ artworks }) => {
  const [expandedArtworkId, setExpandedArtworkId] = useState<string | null>(null);

  // Toggle expanded/collapsed state for each artwork
  const toggleArtwork = (id: string) => {
    setExpandedArtworkId((prevId) => (prevId === id ? null : id));
  };

  return (
    <ul>
      {artworks.map((artwork) => (
        <ArtworkListItem
          key={artwork._id}
          artwork={artwork}
          expanded={artwork._id === expandedArtworkId}
          onClick={() => toggleArtwork(artwork._id)}
        />
      ))}
    </ul>
  );
};

export default ArtworksList;
