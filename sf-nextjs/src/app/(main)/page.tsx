import Image from 'next/image';
import Link from 'next/link';
import client from '../lib/sanity';
import { urlFor } from '../lib/sanityImage';

interface ArtworkImageWithArtwork {
  _key: string;
  asset: {
    _ref: string;
    _type: 'reference';
    metadata: {
      dimensions: {
        width: number;
        height: number;
        aspectRatio: number;
      };
    };
  };
  alt?: string;
  artworkSlug: string;
  artworkName: string;
}

// Helper to get fixed width and aspect-ratio-correct height
function getFixedWidthDimensions(asset: any, fixedWidth: number) {
  const origWidth = asset?.metadata?.dimensions?.width || 800;
  const origHeight = asset?.metadata?.dimensions?.height || 600;
  const aspectRatio = asset?.metadata?.dimensions?.aspectRatio || (origWidth / origHeight);
  const width = fixedWidth;
  const height = Math.round(width / aspectRatio);
  return { width, height };
}

async function getAllArtworkImages(): Promise<ArtworkImageWithArtwork[]> {
  // Flatten images and attach parent artwork's slug and name to each image
  const query = `*[_type == "artwork" && defined(images) && count(images) > 0]{
    name,
    "slug": slug.current,
    images[]{
      _key,
      asset->{
        _id,
        _type,
        metadata
      },
      alt
    }
  }`;

  try {
    const artworks = await client.fetch<{ name: string; slug: string; images: any[] }[]>(query);
    // Flatten images and attach artwork info
    return artworks.flatMap(artwork =>
      (artwork.images || [])
        .filter(img => img.asset && img.asset.metadata && img.asset.metadata.dimensions)
        .map(img => ({
          ...img,
          artworkSlug: artwork.slug,
          artworkName: artwork.name,
        }))
    );
  } catch (error) {
    console.error("Failed to fetch all artwork images:", error);
    return [];
  }
}

// Inline styles matching ArtworkDetail component
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

export default async function AllArtworkImagesPage() {
  const images = await getAllArtworkImages();
  const sanityImageWidthTarget = 600; // Set to 600 if you want to match detail pages

  return (
    <div>
      <div
        style={{
          width: '100%',
          maxWidth: `${sanityImageWidthTarget}px`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          // padding: '1rem',
          boxSizing: 'border-box',
        }}
      >
        {images.length === 0 ? (
          <div style={{ width: '100%', textAlign: 'center', color: '#718096' }}>
            <p>No artwork images found.</p>
          </div>
        ) : (
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2.5rem' }}>
            {images.map((img) => {
              const { width, height } = getFixedWidthDimensions(img.asset, sanityImageWidthTarget);

              return (
                <div
                  key={img._key}
                  style={{ ...imageContainerStyle, width }}
                >
                  <Link href={`/artwork/${img.artworkSlug}`} style={{ display: 'block', width: '100%' }}>
                    <Image
                      src={urlFor(img.asset)
                        .width(width)
                        .auto('format')
                        .url()}
                      alt={img.alt || `Artwork image from "${img.artworkName}"`}
                      width={width}
                      height={height}
                      style={imageStyle}
                      loading="lazy"
                    />
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
