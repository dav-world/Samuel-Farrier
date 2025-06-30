import React from 'react';
import { urlFor } from '../../../lib/sanityImage';
import { PortableTextBlock } from '@sanity/types';
import Link from 'next/link';
import Image from 'next/image';

const UNIFORM_WIDTH = 600;

interface SanityImageBlock {
  _type: 'image';
  asset: any;
  alt?: string;
  caption?: string;
  [key: string]: any;
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
  categories: string[];
}

interface ArtworkDetailProps {
  artwork: Artwork;
}

function getFixedWidthDimensions(asset: any, fixedWidth: number) {
  const origWidth = asset?.metadata?.dimensions?.width || 800;
  const origHeight = asset?.metadata?.dimensions?.height || 600;
  const width = fixedWidth;
  const height = Math.round(origHeight * (width / origWidth));
  return { width, height };
}

function isSanityImageBlock(block: any): block is SanityImageBlock {
  return block && block._type === 'image' && !!block.asset;
}

const ArtworkDetail: React.FC<ArtworkDetailProps> = ({ artwork }) => {
  if (!artwork) {
    return (
      <div className="centered-outer">
        <div className="centered-content">Artwork not found</div>
      </div>
    );
  }

  return (
    <div className="centered-outer">
      <div className="centered-content">
        {/* Images */}
        {artwork.images && artwork.images.length > 0 && (
          <div>
            {artwork.images.map(image => {
              if (isSanityImageBlock(image)) {
                const { width, height } = getFixedWidthDimensions(image.asset, UNIFORM_WIDTH);
                return (
                  <div key={image._key} className="centered-image-container">
                    <Image
                      src={urlFor(image.asset).width(UNIFORM_WIDTH * 2).auto('format').quality(80).url()}
                      alt={image.alt || ''}
                      width={width * 2}
                      height={height * 2}
                      className="centered-image"
                      sizes={`(max-width: ${UNIFORM_WIDTH}px) 100vw, ${UNIFORM_WIDTH}px`}
                    />
                    {image.caption && <p style={{ textAlign: 'center', marginTop: '0.5rem' }}>{image.caption}</p>}
                  </div>
                );
              }
              return null;
            })}
          </div>
        )}

        {/* Videos */}
        {artwork.videos && Array.isArray(artwork.videos) && artwork.videos.length > 0 && (
          <div>
            <h2>Videos</h2>
            {artwork.videos.map((videoUrl, index) => {
              const isYouTube = videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be');
              const isVimeo = videoUrl.includes('vimeo.com');

              return (
                <div key={`video-${index}`} className="centered-image-container">
                  {isYouTube ? (
                    <iframe
                      width={UNIFORM_WIDTH}
                      height={Math.round(UNIFORM_WIDTH * 9 / 16)}
                      src={videoUrl.replace('watch?v=', 'embed/')}
                      title="YouTube video player"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="centered-video"
                    ></iframe>
                  ) : isVimeo ? (
                    <iframe
                      src={videoUrl.replace('vimeo.com', 'player.vimeo.com/video')}
                      width={UNIFORM_WIDTH}
                      height={Math.round(UNIFORM_WIDTH * 9 / 16)}
                      frameBorder="0"
                      allow="autoplay; fullscreen; picture-in-picture"
                      allowFullScreen
                      className="centered-video"
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

        {/* Press */}
        {artwork.press?.length > 0 && (
          <div>
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
                const { width, height } = getFixedWidthDimensions(block.asset, UNIFORM_WIDTH);
                return (
                  <div key={index} className="centered-image-container">
                    <Image
                      src={urlFor(block.asset).width(UNIFORM_WIDTH * 2).auto('format').quality(80).url()}
                      alt="Press image"
                      width={width * 2}
                      height={height * 2}
                      className="centered-block-image"
                      sizes={`(max-width: ${UNIFORM_WIDTH}px) 100vw, ${UNIFORM_WIDTH}px`}
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

        {/* Categories as strings */}
        {artwork.categories && artwork.categories.length > 0 && (
          <p>
            {artwork.categories.map((category, idx) => (
              <React.Fragment key={category || idx}>
                <Link
                  href={`/category/${encodeURIComponent(category)}`}
                  className="text-blue-500 hover:underline"
                  aria-label={`View all artwork in category ${category}`}
                >
                  {category}
                </Link>
                {idx < artwork.categories.length - 1 && ', '}
              </React.Fragment>
            ))}
          </p>
        )}
      </div>
    </div>
  );
};

export default ArtworkDetail;