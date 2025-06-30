"use client";

import { useEffect, useState } from "react";
import client from "../../../lib/sanity";
import { urlFor } from "../../../lib/sanityImage";
import Link from "next/link";
import Image from "next/image";

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

const UNIFORM_WIDTH = 600;

function getFixedWidthDimensions(asset: any, fixedWidth: number) {
  const origWidth = asset?.metadata?.dimensions?.width || 800;
  const origHeight = asset?.metadata?.dimensions?.height || 600;
  const aspectRatio = asset?.metadata?.dimensions?.aspectRatio || (origWidth / origHeight);
  const width = fixedWidth;
  const height = Math.round(width / aspectRatio);
  return { width, height };
}

const artworkCategoryQuery = `
  *[
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
  }
`;

export default function CategoryPage({ params }: CategoryPageProps) {
  const { category } = params;
  const decodedCategory = decodeURIComponent(category);
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchArtworks = async () => {
      setLoading(true);
      const data: Artwork[] = await client.fetch(artworkCategoryQuery, { category: decodedCategory });
      if (isMounted) setArtworks(data);
      setLoading(false);
    };

    fetchArtworks();

    // Listen for real-time updates to artworks in this category
    const subscription = client
      .listen(artworkCategoryQuery, { category: decodedCategory }, { includeResult: false })
      .subscribe(event => {
        if (event.type === "mutation" && isMounted) {
          fetchArtworks();
        }
      });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [decodedCategory]);

  // Sort: first by defined importance (ascending, 1 is most important), then by createdAt (oldest first)
  const withImportance = artworks.filter(a => typeof a.importance === 'number');
  const withoutImportance = artworks.filter(a => typeof a.importance !== 'number');

  withImportance.sort((a, b) => (a.importance! - b.importance!));
  withoutImportance.sort((a, b) => new Date(a._createdAt).getTime() - new Date(b._createdAt).getTime());

  const sortedArtworks = [...withImportance, ...withoutImportance];

  const sanityImageDisplayWidth = UNIFORM_WIDTH;
  const sanityImageMaxWidth = sanityImageDisplayWidth * 2;

  return (
    <div className="centered-outer">
      <div className="centered-content">
        <h1 style={{ textAlign: "center", marginBottom: "2rem" }}>Category: {decodedCategory}</h1>
        {loading ? (
          <div style={{ width: "100%", textAlign: "center", color: "#718096" }}>
            <p>Loading...</p>
          </div>
        ) : sortedArtworks.length === 0 ? (
          <div style={{ width: "100%", textAlign: "center", color: "#718096" }}>
            <p>No artworks found in this category.</p>
          </div>
        ) : (
          <div style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center", gap: "2.5rem" }}>
            {sortedArtworks.map((artwork) => {
              // Defensive check for image asset
              const firstImage = Array.isArray(artwork.images) && artwork.images.length > 0 ? artwork.images[0] : null;
              const hasAsset = firstImage && firstImage.asset;
              let imageNode = null;
              if (hasAsset) {
                const { width: displayWidth, height: displayHeight } = getFixedWidthDimensions(firstImage.asset, sanityImageDisplayWidth);
                const { width: maxWidth, height: maxHeight } = getFixedWidthDimensions(firstImage.asset, sanityImageMaxWidth);
                imageNode = (
                  <Image
                    src={urlFor(firstImage.asset).width(maxWidth).auto("format").quality(80).url()}
                    alt={artwork.name}
                    width={maxWidth}
                    height={maxHeight}
                    className="centered-image"
                    loading="lazy"
                    sizes={`(max-width: ${sanityImageDisplayWidth}px) 100vw, ${sanityImageDisplayWidth}px`}
                  />
                );
              }
              return (
                <div key={artwork._id} className="centered-image-container">
                  <Link href={`/artwork/${artwork.slug.current}`} style={{ display: "block", width: "100%" }}>
                    {imageNode ? imageNode : (
                      <div style={{
                        width: sanityImageDisplayWidth,
                        height: Math.round(sanityImageDisplayWidth * 0.75),
                        background: '#eee',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#888'
                      }}>
                        No image
                      </div>
                    )}
                    <div style={{
                      textAlign: "center",
                      marginTop: "0.5rem",
                      fontSize: "0.85em",
                      color: "#444",
                      whiteSpace: "pre-line",
                      fontStyle: "italic",
                    }}>
                      {artwork.name}{artwork.year ? `, ${artwork.year}` : ""}
                    </div>
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