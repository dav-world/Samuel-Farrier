/* eslint-disable */
// @ts-nocheck

import React from 'react';
import { PortableTextBlock } from '@sanity/types';

interface Exhibition {
  _id: string;
  name: string;
  year: number;
  startDate: string;
  endDate: string;
  city: string;
  venue_name: string;
  venue_type: string;
  url: string;
  address: string;
  show_type: string;
  curator: string;
  images: any[];
  press: PortableTextBlock[];
  notes: PortableTextBlock[];
  relatedArtworks?: Array<{ slug: string; name: string }>;
  videos?: string[];
}

interface ExhibitionDetailProps {
  exhibition: Exhibition;
}

const ExhibitionDetail: React.FC<ExhibitionDetailProps> = ({ exhibition }) => {
  if (!exhibition) {
    return <div>Exhibition not found</div>;
  }

  return (
    <div>
      <h1>{exhibition.name}</h1>
      <p>{exhibition.venue_name}, {exhibition.city}</p>
      <p>{new Date(exhibition.startDate).toLocaleDateString()} - {new Date(exhibition.endDate).toLocaleDateString()}</p>
      <p>{exhibition.curator}</p>
      {exhibition.url && <p><a className="blue-link" href={exhibition.url} target="_blank" rel="noopener noreferrer">{exhibition.url}</a></p>}

      {/* Images */}
      {exhibition.images?.length > 0 && (
        <div>
          {exhibition.images.map((image, imageIndex) => (
            <div key={image._key || `image-${imageIndex}`}>
              {image.asset && image.asset.url ? (
                <img
                  src={image.asset.url}  // Directly use the URL from the asset object
                  alt={image.alt || 'Artwork image'}
                  style={{ maxWidth: '500px', width: '100%' }}
                />
              ) : (
                <p>No image available</p>  // Optional fallback if no image is available
              )}
              {image.caption && <p>{image.caption}</p>}
            </div>
          ))}
        </div>
      )}

      {/* Display Press */}
      {exhibition.press?.length > 0 && (
        <div>
          {exhibition.press.map((block, index) => (
            <p key={index}>
              {block.children?.map((child: any, childIndex: number) => (
                <span key={child._key || childIndex}>{child.text}</span>
              ))}
            </p>
          ))}
        </div>
      )}

      {/* Display Notes */}
      {exhibition.notes?.length > 0 && (
        <div>
          {exhibition.notes.map((block, index) => (
            <p key={index}>
              {block.children?.map((child: any, childIndex: number) => (
                <span key={child._key || childIndex}>{child.text}</span>
              ))}
            </p>
          ))}
        </div>
      )}

      {/* Related Artworks */}
      {exhibition.relatedArtworks && exhibition.relatedArtworks.length > 0 && (
        <div>
          <h2>Related Artworks</h2>
          {exhibition.relatedArtworks.map((artwork) => (
            <p key={artwork.slug}>
              <a
                href={`/artwork/${artwork.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="blue-link"
              >
                {artwork.name}
              </a>
            </p>
          ))}
        </div>
      )}

      {/* Videos */}
      {exhibition.videos?.length > 0 && (
        <div>
          {exhibition.videos.map((videoUrl, index) => {
            const isYouTube = videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be');
            const isVimeo = videoUrl.includes('vimeo.com');

            return (
              <div key={index}>
                {isYouTube ? (
                  <iframe
                    width="560"
                    height="315"
                    src={videoUrl.replace('watch?v=', 'embed/')}
                    title="YouTube video player"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                ) : isVimeo ? (
                  <iframe
                    src={videoUrl.replace('vimeo.com', 'player.vimeo.com/video')}
                    width="640"
                    height="360"
                    frameBorder="0"
                    allow="autoplay; fullscreen; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                ) : (
                  <a href={videoUrl} target="_blank" rel="noopener noreferrer">
                    {videoUrl}
                  </a>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ExhibitionDetail;
