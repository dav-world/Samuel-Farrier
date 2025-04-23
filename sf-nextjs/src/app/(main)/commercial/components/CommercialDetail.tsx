/* eslint-disable */
// @ts-nocheck

import React from 'react';
import { urlFor } from '../../../lib/sanityImage';
import { PortableTextBlock } from '@sanity/types';
import Link from 'next/link';

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

interface CommercialDetailProps {
  commercial: Commercial;
}

const CommercialDetail: React.FC<CommercialDetailProps> = ({ commercial }) => {
  if (!commercial) {
    return <div>Commercial not found</div>;
  }

  return (
    <div>
      <h1>{commercial.name}</h1>
      {commercial.date && <p>Date: {new Date(commercial.date).toLocaleDateString()}</p>}
      <p>Photographer: {commercial.photographer}</p>
      <p>Stylist: {commercial.stylist}</p>
      <p>Category: {commercial.category}</p>

      {/* Description */}
      {commercial.description?.length > 0 && (
        <div>
          <h2>Description</h2>
          {commercial.description.map((block, index) => (
            <p key={index}>
              {block.children?.map((child: any, childIndex: number) => {
                const linkMark = child.marks?.find((mark: string) => {
                  return block.markDefs?.some((def) => def._key === mark && def._type === 'link');
                });

                if (linkMark) {
                  const link = block.markDefs?.find((def) => def._key === linkMark);
                  return (
                    <a
                      key={childIndex}
                      href={link?.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: 'blue', textDecoration: 'underline' }}
                    >
                      {child.text}
                    </a>
                  );
                }
                return <span key={childIndex}>{child.text}</span>;
              })}
            </p>
          ))}
        </div>
      )}

      {/* Images */}
      <div>
        {commercial.images && (
          <div>
            <strong>Images:</strong>
            {commercial.images.map(image => (
              <div key={image._key}>
                <img
                  src={image && image.asset ? urlFor(image.asset).url() : "/path/to/default/image.jpg"}
                  alt={image ? image.alt : "Default Image"}
                  style={{ maxWidth: '500px', width: '100%', height: 'auto' }}
                />
                <p>{image.caption}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CommercialDetail;
