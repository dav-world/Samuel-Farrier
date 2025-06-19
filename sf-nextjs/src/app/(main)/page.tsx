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
  type: 'artwork';
}

interface ExhibitionImageWithExhibition {
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
  exhibitionSlug: string;
  exhibitionName: string;
  type: 'exhibition';
}

function getFixedWidthDimensions(asset: any, fixedWidth: number) {
  const origWidth = asset?.metadata?.dimensions?.width || 800;
  const origHeight = asset?.metadata?.dimensions?.height || 600;
  const aspectRatio = asset?.metadata?.dimensions?.aspectRatio || (origWidth / origHeight);
  const width = fixedWidth;
  const height = Math.round(width / aspectRatio);
  return { width, height };
}

async function getAllHomescreenImages(): Promise<(ArtworkImageWithArtwork | ExhibitionImageWithExhibition)[]> {
  // Query for artworks with homescreen == true
  const artworkQuery = `*[_type == "artwork" && homescreen == true && defined(images) && count(images) > 0]{
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

  // Query for exhibitions with homescreen == true
  const exhibitionQuery = `*[_type == "exhibition" && homescreen == true && defined(images) && count(images) > 0]{
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
    const [artworks, exhibitions] = await Promise.all([
      client.fetch<{ name: string; slug: string; images: any[] }[]>(artworkQuery),
      client.fetch<{ name: string; slug: string; images: any[] }[]>(exhibitionQuery),
    ]);

    const artworkImages: ArtworkImageWithArtwork[] = artworks.flatMap(artwork =>
      (artwork.images || [])
        .filter(img => img.asset && img.asset.metadata && img.asset.metadata.dimensions)
        .map(img => ({
          ...img,
          artworkSlug: artwork.slug,
          artworkName: artwork.name,
          type: 'artwork' as const,
        }))
    );

    const exhibitionImages: ExhibitionImageWithExhibition[] = exhibitions.flatMap(exhibition =>
      (exhibition.images || [])
        .filter(img => img.asset && img.asset.metadata && img.asset.metadata.dimensions)
        .map(img => ({
          ...img,
          exhibitionSlug: exhibition.slug,
          exhibitionName: exhibition.name,
          type: 'exhibition' as const,
        }))
    );

    // Combine and sort if needed (e.g., by name or random)
    return [...artworkImages, ...exhibitionImages];
  } catch (error) {
    console.error("Failed to fetch homescreen images:", error);
    return [];
  }
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

export default async function AllHomescreenImagesPage() {
  const images = await getAllHomescreenImages();
  const sanityImageWidthTarget = 600;

  return (
    <div>
      <div
        style={{
          width: '100%',
          maxWidth: `${sanityImageWidthTarget}px`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          boxSizing: 'border-box',
        }}
      >
        {images.length === 0 ? (
          <div style={{ width: '100%', textAlign: 'center', color: '#718096' }}>
            <p>No homescreen images found.</p>
          </div>
        ) : (
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2.5rem' }}>
            {images.map((img) => {
              const { width, height } = getFixedWidthDimensions(img.asset, sanityImageWidthTarget);

              // Determine link based on type
              let href = '';
              if (img.type === 'artwork') {
                href = `/artwork/${(img as ArtworkImageWithArtwork).artworkSlug}`;
              } else {
                href = `/exhibition/${(img as ExhibitionImageWithExhibition).exhibitionSlug}`;
              }

              return (
                <div
                  key={img._key}
                  style={{ ...imageContainerStyle, width }}
                >
                  <Link href={href} style={{ display: 'block', width: '100%' }}>
                    <Image
                      src={urlFor(img.asset)
                        .width(width)
                        .auto('format')
                        .url()}
                      alt={img.alt || ''}
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