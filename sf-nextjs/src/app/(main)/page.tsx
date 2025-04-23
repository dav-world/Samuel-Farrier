
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
  maxHeight: '80vh',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  margin: '1rem 0',
  overflow: 'hidden',
};

const imageStyle: React.CSSProperties = {
  width: '100%',
  height: 'auto',
  maxHeight: '80vh',
  objectFit: 'contain',
  display: 'block',
};

export default async function AllArtworkImagesPage() {
  const images = await getAllArtworkImages();
  const sanityImageWidthTarget = 896;

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '1rem', boxSizing: 'border-box' }}>
      {images.length === 0 ? (
        <div style={{ width: '100%', maxWidth: '896px', textAlign: 'center', color: '#718096' }}>
          <p>No artwork images found.</p>
        </div>
      ) : (
        <div style={{ width: '100%', maxWidth: '896px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2.5rem' }}>
          {images.map((img) => {
            const imgWidth = sanityImageWidthTarget;
            const aspectRatio = img.asset.metadata.dimensions.aspectRatio;
            const imgHeight = Math.round(imgWidth / aspectRatio);

            return (
              <div
                key={img._key}
                style={imageContainerStyle}
              >
                <Link href={`/artwork/${img.artworkSlug}`} style={{ display: 'block', width: '100%' }}>
                  {/* Use <img> for full style control, or <Image> with style prop */}
                  <img
                    src={urlFor(img.asset)
                      .width(imgWidth)
                      .auto('format')
                      .url()}
                    alt={img.alt || `Artwork image from "${img.artworkName}"`}
                    width={imgWidth}
                    height={imgHeight}
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
  );
}
