/* eslint-disable */
// @ts-nocheck

import React, { useState } from 'react';
import ExhibitionListItem from './ExhibitionListItem';

interface Exhibition {
  _id: string;
  name: string;
  year: number;
  startDate: string;
  endDate: string;
  city: string;
  venue_name: string;
  venue_type: string;
}

interface ExhibitionsListProps {
  exhibitions: Exhibition[];
}

const ExhibitionsList: React.FC<ExhibitionsListProps> = ({ exhibitions }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <ul>
      {exhibitions.map((exhibition) => (
        <ExhibitionListItem
          key={exhibition._id}
          exhibition={exhibition}
          expanded={expandedId === exhibition._id}
          onClick={() => toggleExpand(exhibition._id)}
        />
      ))}
    </ul>
  );
};

export default ExhibitionsList;
