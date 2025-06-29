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
}

interface CategoryPageProps {
  params: { category: string };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { category } = params;

  // Fetch artworks for this category
  const artworks: Artwork[] = await client.fetch(
    `*[_type == "artwork" && $category in categories][]{
      _id,
      name,
      slug,
      year,
      images,
      categories
    }`,
    { category }
  );

  return (
    <div>
      <h1>Category: {category}</h1>
      {artworks.length === 0 ? (
        <p>No artworks found in this category.</p>
      ) : (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem' }}>
          {artworks.map((artwork) => (
            <div key={artwork._id} style={{ width: 300 }}>
              <Link href={`/artwork/${artwork.slug.current}`}>
                <a>
                  {artwork.images && artwork.images[0] && (
                    <Image
                      src={urlFor(artwork.images[0].asset).width(400).url()}
                      alt={artwork.name}
                      width={400}
                      height={300}
                      style={{ objectFit: 'cover', width: '100%', height: 'auto' }}
                    />
                  )}
                  <h2>{artwork.name}</h2>
                  <p>{artwork.year}</p>
                </a>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}