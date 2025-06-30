import React from 'react';
import { PortableTextBlock } from '@sanity/types';
import Link from 'next/link';
import Image from 'next/image';
import { urlFor } from '../../../lib/sanityImage';

// Uniform width for images and content containers
const UNIFORM_WIDTH = 600;

const outerContainerStyle: React.CSSProperties = {
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
};

const contentContainerStyle: React.CSSProperties = {
  width: '100%',
  maxWidth: `${UNIFORM_WIDTH}px`,
  margin: '0 auto',
  textAlign: 'left',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
};

const imageContainerStyle: React.CSSProperties = {
  width: '100%',
  maxWidth: `${UNIFORM_WIDTH}px`,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  margin: '1.5rem 0',
  overflow: 'hidden',
};

const imageStyle: React.CSSProperties = {
  width: '100%',
  maxWidth: `${UNIFORM_WIDTH}px`,
  height: 'auto',
  objectFit: 'contain',
  display: 'block',
};

interface RelatedArtwork {
  slug: { current: string } | string;
  name: string;
  available?: string;
  visibility?: string;
}

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
  relatedArtworks?: RelatedArtwork[];
  videos?: string[];
}

interface ExhibitionDetailProps {
  exhibition: Exhibition;
}

// Helper to get fixed width and aspect-ratio-correct height
function getFixedWidthDimensions(asset: any, fixedWidth: number) {
  const origWidth = asset?.metadata?.dimensions?.width || 800;
  const origHeight = asset?.metadata?.dimensions?.height || 600;
  const width = fixedWidth;
  const height = Math.round(origHeight * (width / origWidth));
  return { width, height };
}

const ExhibitionDetail: React.FC<ExhibitionDetailProps> = ({ exhibition }) => {
  if (!exhibition) {
    return (
      <div style={outerContainerStyle}>
        <div style={contentContainerStyle}>Exhibition not found</div>
      </div>
    );
  }

  return (
    <div style={outerContainerStyle}>
      <div style={contentContainerStyle}>
        {/* Images */}
        {Array.isArray(exhibition.images) && exhibition.images.length > 0 && (
          <div>
            {exhibition.images.map((image, imageIndex) => {
              if (image.asset && image.asset._type && image.asset._type.startsWith('sanity.imageAsset')) {
                const { width, height } = getFixedWidthDimensions(image.asset, UNIFORM_WIDTH);
                return (
                  <div key={image._key || `image-${imageIndex}`} style={imageContainerStyle}>
                    <Image
                      src={urlFor(image.asset).width(UNIFORM_WIDTH * 2).auto('format').quality(80).url()}
                      alt={image.alt || 'Exhibition image'}
                      width={width * 2}
                      height={height * 2}
                      style={imageStyle}
                      sizes={`(max-width: ${UNIFORM_WIDTH}px) 100vw, ${UNIFORM_WIDTH}px`}
                    />
                    {image.caption && (
                      <p style={{ textAlign: 'center', marginTop: '0.5rem' }}>{image.caption}</p>
                    )}
                  </div>
                );
              } else if (image.asset && image.asset.url) {
                // Fallback for plain url
                return (
                  <div key={image._key || `image-${imageIndex}`} style={imageContainerStyle}>
                    <img
                      src={image.asset.url}
                      alt={image.alt || 'Exhibition image'}
                      style={imageStyle}
                    />
                    {image.caption && (
                      <p style={{ textAlign: 'center', marginTop: '0.5rem' }}>{image.caption}</p>
                    )}
                  </div>
                );
              } else {
                return (
                  <div key={image._key || `image-${imageIndex}`} style={imageContainerStyle}>
                    <p>No image available</p>
                  </div>
                );
              }
            })}
          </div>
        )}

        <h1>{exhibition.name}</h1>
        <p>
          {exhibition.venue_name}
          {exhibition.city ? `, ${exhibition.city}` : ''}
        </p>
        <p>{exhibition.curator}</p>
        {exhibition.url && (
          <p>
            <a
              className="blue-link"
              href={exhibition.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              {exhibition.url}
            </a>
          </p>
        )}

        {/* Display Press */}
        {/* {Array.isArray(exhibition.press) && exhibition.press.length > 0 && (
          <div>
            <h2>Press</h2>
            {exhibition.press.map((block, index) => (
              <p key={index}>
                {Array.isArray(block.children) &&
                  block.children.map((child: any, childIndex: number) => (
                    <span key={child._key || childIndex}>{child.text}</span>
                  ))}
              </p>
            ))}
          </div>
        )} */}

        {/* Display Notes */}
        {/* {Array.isArray(exhibition.notes) && exhibition.notes.length > 0 && (
          <div>
            <h2>Notes</h2>
            {exhibition.notes.map((block, index) => (
              <p key={index}>
                {Array.isArray(block.children) &&
                  block.children.map((child: any, childIndex: number) => (
                    <span key={child._key || childIndex}>{child.text}</span>
                  ))}
              </p>
            ))}
          </div>
        )} */}

        {/* Related Artworks */}
        {Array.isArray(exhibition.relatedArtworks) && exhibition.relatedArtworks.length > 0 && (
          <div>
            <h2>Related Artworks</h2>
            {exhibition.relatedArtworks
              .filter(
                (artwork) =>
                  (artwork.available || '').toLowerCase() === 'yes' &&
                  (artwork.visibility || '').toLowerCase() === 'public'
              )
              .map((artwork) => (
                <p key={typeof artwork.slug === 'string' ? artwork.slug : artwork.slug?.current}>
                  <Link
                    href={`/artwork/${typeof artwork.slug === 'string' ? artwork.slug : artwork.slug?.current}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="blue-link"
                  >
                    {artwork.name}
                  </Link>
                </p>
              ))}
          </div>
        )}

        {/* Videos */}
        {Array.isArray(exhibition.videos) && exhibition.videos.length > 0 && (
          <div>
            <h2>Videos</h2>
            {exhibition.videos.map((videoUrl, index) => {
              const isYouTube =
                videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be');
              const isVimeo = videoUrl.includes('vimeo.com');

              return (
                <div key={index} style={imageContainerStyle}>
                  {isYouTube ? (
                    <iframe
                      width={UNIFORM_WIDTH}
                      height={Math.round(UNIFORM_WIDTH * 9 / 16)}
                      src={videoUrl.replace('watch?v=', 'embed/')}
                      title="YouTube video player"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      style={imageStyle}
                    ></iframe>
                  ) : isVimeo ? (
                    <iframe
                      src={videoUrl.replace('vimeo.com', 'player.vimeo.com/video')}
                      width={UNIFORM_WIDTH}
                      height={Math.round(UNIFORM_WIDTH * 9 / 16)}
                      frameBorder="0"
                      allow="autoplay; fullscreen; picture-in-picture"
                      allowFullScreen
                      style={imageStyle}
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
    </div>
  );
};

export default ExhibitionDetail;