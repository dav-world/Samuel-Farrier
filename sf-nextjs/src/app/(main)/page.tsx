import Image from 'next/image';
import Link from 'next/link';
import client from '../lib/sanity';
import { urlFor } from '../lib/sanityImage';

const UNIFORM_WIDTH = 600;

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
  year?: number | string;
  dimensions?: string;
  medium?: string;
  date?: string;
  importance?: number;
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
  year?: number | string;
  importance?: number;
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
  const artworkQuery = `*[_type == "artwork" && homescreen == true && defined(images) && count(images) > 0 && lower(available) == "yes" && lower(visibility) == "public"]{
    name,
    "slug": slug.current,
    _createdAt,
    year,
    dimensions,
    medium,
    date,
    importance,
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
    year,
    importance,
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
      client.fetch<{ name: string; slug: string; images: any[]; _createdAt: string; year?: number | string; dimensions?: string; medium?: string; date?: string; importance?: number }[]>(artworkQuery),
      client.fetch<{ name: string; slug: string; images: any[]; _createdAt: string; year?: number | string; importance?: number }[]>(exhibitionQuery),
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
          year: artwork.year,
          dimensions: artwork.dimensions,
          medium: artwork.medium,
          date: artwork.date,
          importance: artwork.importance,
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
          year: exhibition.year,
          importance: exhibition.importance,
        }))
    );

    // Sort: first by defined importance (ascending, 1 is most important), then by createdAt (oldest first)
    const withImportance = [...artworkImages, ...exhibitionImages].filter(img => typeof img.importance === 'number');
    const withoutImportance = [...artworkImages, ...exhibitionImages].filter(img => typeof img.importance !== 'number');

    withImportance.sort((a, b) => (a.importance! - b.importance!));
    withoutImportance.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

    return [...withImportance, ...withoutImportance];
  } catch (error) {
    console.error("Failed to fetch homescreen images:", error);
    return [];
  }
}

export default async function AllHomescreenImagesPage() {
  const images = await getAllHomescreenImages();

  // Target display width for the image container (in px)
  const sanityImageDisplayWidth = UNIFORM_WIDTH;
  // Request up to 2x for retina screens (1200px)
  const sanityImageMaxWidth = sanityImageDisplayWidth * 2;

  return (
    <div className="centered-outer">
      <div className="centered-content">
        {images.length === 0 ? (
          <div style={{ width: '100%', textAlign: 'center', color: '#718096' }}>
            <p>No homescreen images found.</p>
          </div>
        ) : (
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2.5rem' }}>
            {images.map((img) => {
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
                  className="centered-image-container"
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
                      className="centered-image"
                      loading="lazy"
                      sizes={`(max-width: ${sanityImageDisplayWidth}px) 100vw, ${sanityImageDisplayWidth}px`}
                    />
                  </Link>
                  {img.type === 'artwork' ? (
                    <div style={{
                      textAlign: 'center',
                      marginTop: '0.5rem',
                      fontSize: '0.75em',
                      color: '#444',
                      whiteSpace: 'pre-line',
                      fontStyle: 'italic',
                    }}>
                      {[img.artworkName, img.dimensions, img.medium, img.year]
                        .filter(Boolean)
                        .join(', ')}
                    </div>
                  ) : (
                    <div style={{
                      textAlign: 'center',
                      marginTop: '0.5rem',
                      fontSize: '0.75em',
                      color: '#444',
                      whiteSpace: 'pre-line',
                      fontStyle: 'italic',
                    }}>
                      {[img.exhibitionName, img.year].filter(Boolean).join(', ')}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}