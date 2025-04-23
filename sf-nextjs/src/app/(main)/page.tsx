import Link from 'next/link';
import Image from 'next/image';
import client from '../lib/sanity';
import { urlFor } from '../lib/sanityImage';

interface ArtworkColumnItem {
  _id: string;
  name: string;
  slug: string;
  mainImage: {
    asset: {
      _ref: string;
      _type: 'reference';
    };
    alt?: string;
  } | null;
}

async function getArtworksForColumn(): Promise<ArtworkColumnItem[]> {
  const query = `*[_type == "artwork" && defined(images) && count(images) > 0] | order(year desc, name asc) {
    _id,
    name,
    "slug": slug.current,
    "mainImage": images[0] {
      asset,
      alt
    }
  }`;
  try {
    const artworks = await client.fetch<ArtworkColumnItem[]>(query);
    return artworks.filter(art => art.mainImage?.asset);
  } catch (error) {
    console.error("Failed to fetch artworks for column:", error);
    return [];
  }
}

// --- Component ---
export default async function HomePage() {
  const artworks = await getArtworksForColumn();
  const sanityImageWidthTarget = 900; // e.g., 1920 * 0.5 = 860, round up slightly

  return (
    <div className="w-full flex justify-center p-4 md:p-6">

      {artworks.length === 0 ? (
        <div className="w-full max-w-4xl text-center text-gray-600"> {/* Added container for message */}
          <p>No artworks with images found.</p>
        </div>
      ) : (
        <div className="w-[50%] max-w-4xl space-y-8 md:space-y-10">
          {artworks.map((artwork, index) => (
            <Link
              key={artwork._id}
              href={`/artwork/${artwork.slug}`}
              className="group block w-full overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 bg-gray-100"
            >
              <div className="w-full relative">
                <Image
                  src={urlFor(artwork.mainImage!.asset) // Non-null assertion ok due to filter
                    .width(sanityImageWidthTarget) // Optimize image size from Sanity
                    .auto('format')
                    .url()}
                  alt={artwork.mainImage?.alt || artwork.name || 'Artwork image'}
                  width={sanityImageWidthTarget}  // Required prop: Hint for intrinsic width
                  height={sanityImageWidthTarget} // Required prop: HINT for height (aspect ratio handled by CSS)
                  className="w-full h-auto object-contain block"
                  sizes="(max-width: 768px) calc(100vw - 2rem), 50vw" // Account for padding on smaller screens
                  priority={index < 3}
                />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
