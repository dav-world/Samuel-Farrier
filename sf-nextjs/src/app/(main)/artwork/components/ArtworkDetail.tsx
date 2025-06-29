import React from 'react';
import { urlFor } from '../../../lib/sanityImage';
import { PortableTextBlock } from '@sanity/types';
import Link from 'next/link';
import Image from 'next/image';

// Type for Sanity image block
interface SanityImageBlock {
  _type: 'image';
  asset: any;
  alt?: string;
  caption?: string;
  [key: string]: any;
}

interface Category {
  name: string;
  slug: string;
}

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
  price: number | null;
  notes: PortableTextBlock[];
  relatedExhibitions?: Array<{ _id: string; name: string; slug: string }>;
  categories: Category[]; // Now an array of objects with name and slug
}

interface ArtworkDetailProps {
  artwork: Artwork;
}

const imageContainerStyle: React.CSSProperties = {
  maxWidth: '100%',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  margin: '1rem 0',
  overflow: 'hidden',
};

const imageStyle: React.CSSProperties = {
  width: '100%',
  height: 'auto',
  objectFit: 'contain',
  display: 'block',
};

const blockImageStyle: React.CSSProperties = {
  width: '100%',
  height: 'auto',
  objectFit: 'contain',
  display: 'block',
  margin: '1rem 0',
};

const FIXED_IMAGE_WIDTH = 600;

// Helper to get fixed width and aspect-ratio-correct height
function getFixedWidthDimensions(asset: any, fixedWidth: number) {
  const origWidth = asset?.metadata?.dimensions?.width || 800;
  const origHeight = asset?.metadata?.dimensions?.height || 600;
  const width = fixedWidth;
  const height = Math.round(origHeight * (width / origWidth));
  return { width, height };
}

// Type guard for Sanity image block
function isSanityImageBlock(block: any): block is SanityImageBlock {
  return block && block._type === 'image' && !!block.asset;
}

const ArtworkDetail: React.FC<ArtworkDetailProps> = ({ artwork }) => {
  if (!artwork) {
    return <div>Artwork not found</div>;
  }

  return (
    <div>
      <h1>{artwork.name}</h1>
      <p>{artwork.year}</p>
      {artwork.date && <p>{new Date(artwork.date).toLocaleDateString()}</p>}
      <p>{artwork.dimensions}</p>
      <p>{artwork.medium}</p>

      {/* Description */}
      {artwork.description?.length > 0 && (
        <div>
          {artwork.description.map((block, index) => {
            if (block._type === 'block' && Array.isArray(block.children)) {
              return (
                <p key={index}>
                  {block.children.map((child: any, childIndex: number) => {
                    const linkMark = child.marks?.find((mark: string) => {
                      return Array.isArray(block.markDefs) && block.markDefs.some((def) => def._key === mark && def._type === 'link');
                    });

                    if (linkMark) {
                      const link = Array.isArray(block.markDefs) ? block.markDefs.find((def) => def._key === linkMark) : undefined;
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
              );
            }
            return null;
          })}
        </div>
      )}

      {/* Images */}
      <div>
        {artwork.images && artwork.images.length > 0 && (
          <div>
            {artwork.images.map(image => {
              if (isSanityImageBlock(image)) {
                const { width, height } = getFixedWidthDimensions(image.asset, FIXED_IMAGE_WIDTH);
                return (
                  <div key={image._key} style={{ ...imageContainerStyle, width }}>
                    <Image
                      src={urlFor(image.asset).url()}
                      alt={image.alt || ''}
                      width={width}
                      height={height}
                      style={imageStyle}
                    />
                    {image.caption && <p style={{ textAlign: 'center', marginTop: '0.5rem' }}>{image.caption}</p>}
                  </div>
                );
              }
              return null;
            })}
          </div>
        )}
      </div>

      {/* Videos */}
      {artwork.videos && Array.isArray(artwork.videos) && artwork.videos.length > 0 && (
        <div>
          <h2>Videos</h2>
          {artwork.videos.map((videoUrl, index) => {
            const isYouTube = videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be');
            const isVimeo = videoUrl.includes('vimeo.com');

            return (
              <div key={`video-${index}`} style={{ margin: '1rem 0' }}>
                {isYouTube ? (
                  <iframe
                    width="560"
                    height="315"
                    src={videoUrl.replace('watch?v=', 'embed/')}
                    title="YouTube video player"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    style={imageContainerStyle}
                  ></iframe>
                ) : isVimeo ? (
                  <iframe
                    src={videoUrl.replace('vimeo.com', 'player.vimeo.com/video')}
                    width="640"
                    height="360"
                    frameBorder="0"
                    allow="autoplay; fullscreen; picture-in-picture"
                    allowFullScreen
                    style={imageContainerStyle}
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

      {/* Press */}
      {artwork.press?.length > 0 && (
        <div>
          <h2>Press</h2>
          {artwork.press.map((block, index) => {
            if (block._type === 'block' && Array.isArray(block.children)) {
              return (
                <p key={index}>
                  {block.children.map((child: any, childIndex: number) => {
                    const linkMark = child.marks?.find((mark: string) => {
                      return Array.isArray(block.markDefs) && block.markDefs.some((def) => def._key === mark && def._type === 'link');
                    });

                    if (linkMark) {
                      const link = Array.isArray(block.markDefs) ? block.markDefs.find((def) => def._key === linkMark) : undefined;
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
              );
            } else if (isSanityImageBlock(block)) {
              const { width, height } = getFixedWidthDimensions(block.asset, FIXED_IMAGE_WIDTH);
              return (
                <div key={index} style={{ ...imageContainerStyle, width }}>
                  <Image
                    src={urlFor(block.asset).url()}
                    alt="Press image"
                    width={width}
                    height={height}
                    style={blockImageStyle}
                  />
                </div>
              );
            } else {
              return null;
            }
          })}
        </div>
      )}

      {/* Exhibited */}
      {artwork.exhibited && (
        <div>
          {artwork.exhibitionLink && (
            <p>
              Exhibition Link: <a href={artwork.exhibitionLink} target="_blank" rel="noopener noreferrer">{artwork.exhibitionLink}</a>
            </p>
          )}
        </div>
      )}

      {/* Related Exhibitions */}
      {artwork?.relatedExhibitions && artwork?.relatedExhibitions.length > 0 && (
        <div>
          <h2>Related Exhibitions</h2>
          {artwork?.relatedExhibitions.map((exhibition, idx) => (
            <p key={exhibition._id || idx}>
              <Link href={`/exhibition/${exhibition.slug}`} className="text-blue-500 hover:underline">{exhibition.name}</Link>
            </p>
          ))}
        </div>
      )}

      {/* Categories with slugs */}
      {artwork.categories && artwork.categories.length > 0 && (
        <p>
          Categories:{' '}
          {artwork.categories.map((category, idx) => (
            <React.Fragment key={category.slug}>
              <Link
                href={`/category/${category.slug}`}
                className="text-blue-500 hover:underline"
                aria-label={`View all artwork in category ${category.name}`}
              >
                {category.name}
              </Link>
              {idx < artwork.categories.length - 1 && ', '}
            </React.Fragment>
          ))}
        </p>
      )}
    </div>
  );
};

export default ArtworkDetail;