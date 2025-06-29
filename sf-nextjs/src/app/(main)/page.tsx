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
    _createdAt?: string;
  };
  alt?: string;
  artworkSlug: string;
  artworkName: string;
  type: 'artwork';
  createdAt: string;
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
    _createdAt?: string;
  };
  alt?: string;
  exhibitionSlug: string;
  exhibitionName: string;
  type: 'exhibition';
  createdAt: string;
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
  const artworkQuery = `*[_type == "artwork" && homescreen == true && defined(images) && count(images) > 0]{
    name,
    "slug": slug.current,
    _createdAt,
    images[]{
      _key,
      asset->{
        _id,
        _type,
        metadata,
        _createdAt
      },
      alt
    }
  }`;

  const exhibitionQuery = `*[_type == "exhibition" && homescreen == true && defined(images) && count(images) > 0]{
    name,
    "slug": slug.current,
    _createdAt,
    images[]{
      _key,
      asset->{
        _id,
        _type,
        metadata,
        _createdAt
      },
      alt
    }
  }`;

  try {
    const [artworks, exhibitions] = await Promise.all([
      client.fetch<{ name: string; slug: string; images: any[]; _createdAt: string }[]>(artworkQuery),
      client.fetch<{ name: string; slug: string; images: any[]; _createdAt: string }[]>(exhibitionQuery),
    ]);

    const artworkImages: ArtworkImageWithArtwork[] = artworks.flatMap(artwork =>
      (artwork.images || [])
        .filter(img => img.asset && img.asset.metadata && img.asset.metadata.dimensions)
        .map(img => ({
          ...img,
          artworkSlug: artwork.slug,
          artworkName: artwork.name,
          type: 'artwork' as const,
          createdAt: artwork._createdAt,
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
          createdAt: exhibition._createdAt,
        }))
    );

    return [...artworkImages, ...exhibitionImages].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
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

  // Target display width for the image container (in px)
  const sanityImageDisplayWidth = 600;
  // Request up to 2x for retina screens (1200px)
  const sanityImageMaxWidth = sanityImageDisplayWidth * 2;

  return (
    <div>
      <div
        style={{
          width: '100%',
          maxWidth: `${sanityImageDisplayWidth}px`,
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
              // Always use the max width for sharpness, but constrain display size via CSS/props
              const { width: displayWidth, height: displayHeight } = getFixedWidthDimensions(img.asset, sanityImageDisplayWidth);
              const { width: maxWidth, height: maxHeight } = getFixedWidthDimensions(img.asset, sanityImageMaxWidth);

              let href = '';
              if (img.type === 'artwork') {
                href = `/artwork/${(img as ArtworkImageWithArtwork).artworkSlug}`;
              } else {
                href = `/exhibition/${(img as ExhibitionImageWithExhibition).exhibitionSlug}`;
              }

              return (
                <div
                  key={img._key}
                  style={{ ...imageContainerStyle, width: displayWidth }}
                >
                  <Link href={href} style={{ display: 'block', width: '100%' }}>
                    <Image
                      src={urlFor(img.asset)
                        .width(maxWidth)
                        .auto('format')
                        .quality(80)
                        .url()}
                      alt={img.alt || ''}
                      width={maxWidth}
                      height={maxHeight}
                      style={imageStyle}
                      loading="lazy"
                      sizes={`(max-width: ${sanityImageDisplayWidth}px) 100vw, ${sanityImageDisplayWidth}px`}
                      // This ensures the browser uses the right size for the device
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