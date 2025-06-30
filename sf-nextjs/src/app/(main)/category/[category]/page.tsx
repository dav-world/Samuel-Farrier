import client from '../../../lib/sanity';
import { urlFor } from '../../../lib/sanityImage';
import Link from 'next/link';
import Image from 'next/image';

interface Artwork {
  _id: string;
  name: string;
  slug: { current: string };
  year: number;
  images: any[];
  categories: string[];
  available?: string;
  visibility?: string;
  importance?: number;
  _createdAt: string;
}

interface CategoryPageProps {
  params: { category: string };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { category } = params;
  const decodedCategory = decodeURIComponent(category);

  // Fetch artworks for this category that are available and public
  const artworks: Artwork[] = await client.fetch(
    `*[
      _type == "artwork" &&
      $category in categories &&
      lower(available) == "yes" &&
      lower(visibility) == "public"
    ][]{
      _id,
      name,
      slug,
      year,
      images,
      categories,
      available,
      visibility,
      importance,
      _createdAt
    }`,
    { category: decodedCategory }
  );

  // Sort: first by defined importance (ascending, 1 is most important), then by createdAt (oldest first)
  const withImportance = artworks.filter(a => typeof a.importance === 'number');
  const withoutImportance = artworks.filter(a => typeof a.importance !== 'number');

  withImportance.sort((a, b) => (a.importance! - b.importance!));
  withoutImportance.sort((a, b) => new Date(a._createdAt).getTime() - new Date(b._createdAt).getTime());

  const sortedArtworks = [...withImportance, ...withoutImportance];

  return (
    <div>
      <h1>Category: {decodedCategory}</h1>

      {sortedArtworks.length === 0 ? (
        <p>No artworks found in this category.</p>
      ) : (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem' }}>
          {sortedArtworks.map((artwork) => {
            // Defensive check for image asset
            const firstImage = Array.isArray(artwork.images) && artwork.images.length > 0 ? artwork.images[0] : null;
            const hasAsset = firstImage && firstImage.asset;

            return (
              <div key={artwork._id} style={{ width: 300 }}>
                <Link href={`/artwork/${artwork.slug.current}`} className="block">
                  {hasAsset ? (
                    <Image
                      src={urlFor(firstImage.asset).width(400).url()}
                      alt={artwork.name}
                      width={400}
                      height={300}
                      style={{ objectFit: 'cover', width: '100%', height: 'auto' }}
                    />
                  ) : (
                    <div style={{
                      width: 400,
                      height: 300,
                      background: '#eee',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#888'
                    }}>
                      No image
                    </div>
                  )}
                  <h2>{artwork.name}</h2>
                  <p>{artwork.year}</p>
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}