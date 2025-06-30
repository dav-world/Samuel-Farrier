"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import client from "../lib/sanity";
import { urlFor } from "../lib/sanityImage";

const UNIFORM_WIDTH = 600;

interface ArtworkImageWithArtwork {
  _key: string;
  asset: any;
  alt?: string;
  artworkSlug: string;
  artworkName: string;
  type: "artwork";
  createdAt: string;
  year?: number | string;
  dimensions?: string;
  medium?: string;
  date?: string;
  importance?: number;
}

interface ExhibitionImageWithExhibition {
  _key: string;
  asset: any;
  alt?: string;
  exhibitionSlug: string;
  exhibitionName: string;
  type: "exhibition";
  createdAt: string;
  year?: number | string;
  importance?: number;
}

type ArtworkImage = {
  asset?: { metadata?: { dimensions?: any } };
  [key: string]: any;
};

type ExhibitionImage = {
  asset?: { metadata?: { dimensions?: any } };
  [key: string]: any;
};

function getFixedWidthDimensions(asset: any, fixedWidth: number) {
  const origWidth = asset?.metadata?.dimensions?.width || 800;
  const origHeight = asset?.metadata?.dimensions?.height || 600;
  const aspectRatio = asset?.metadata?.dimensions?.aspectRatio || (origWidth / origHeight);
  const width = fixedWidth;
  const height = Math.round(width / aspectRatio);
  return { width, height };
}

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

async function fetchAllHomescreenImages(): Promise<(ArtworkImageWithArtwork | ExhibitionImageWithExhibition)[]> {
  const [artworks, exhibitions] = await Promise.all([
    client.fetch<any[]>(artworkQuery),
    client.fetch<any[]>(exhibitionQuery),
  ]);

  const artworkImages: ArtworkImageWithArtwork[] = artworks.flatMap(artwork =>
    (artwork.images || [])
      .filter((img: ArtworkImage) => img.asset && img.asset.metadata && img.asset.metadata.dimensions)
      .map((img: ArtworkImage) => ({
        ...img,
        artworkSlug: artwork.slug,
        artworkName: artwork.name,
        type: "artwork" as const,
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
      .filter((img: ExhibitionImage) => img.asset && img.asset.metadata && img.asset.metadata.dimensions)
      .map((img: ExhibitionImage) => ({
        ...img,
        exhibitionSlug: exhibition.slug,
        exhibitionName: exhibition.name,
        type: "exhibition" as const,
        createdAt: exhibition._createdAt,
        year: exhibition.year,
        importance: exhibition.importance,
      }))
  );

  // Sort: first by defined importance (ascending, 1 is most important), then by createdAt (oldest first)
  const withImportance = [...artworkImages, ...exhibitionImages].filter(img => typeof img.importance === "number");
  const withoutImportance = [...artworkImages, ...exhibitionImages].filter(img => typeof img.importance !== "number");

  withImportance.sort((a, b) => (a.importance! - b.importance!));
  withoutImportance.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  return [...withImportance, ...withoutImportance];
}

export default function HomescreenImagesRealtime() {
  const [images, setImages] = useState<(ArtworkImageWithArtwork | ExhibitionImageWithExhibition)[] | null>(null);

  useEffect(() => {
    let isMounted = true;

    // Initial fetch
    fetchAllHomescreenImages().then(data => {
      if (isMounted) setImages(data);
    });

    // Listen for changes to artwork or exhibition documents
    const artSub = client
      .listen(artworkQuery, {}, { includeResult: false })
      .subscribe(() => {
        fetchAllHomescreenImages().then(data => {
          if (isMounted) setImages(data);
        });
      });

    const exhSub = client
      .listen(exhibitionQuery, {}, { includeResult: false })
      .subscribe(() => {
        fetchAllHomescreenImages().then(data => {
          if (isMounted) setImages(data);
        });
      });

    return () => {
      isMounted = false;
      artSub.unsubscribe();
      exhSub.unsubscribe();
    };
  }, []);

  const sanityImageDisplayWidth = UNIFORM_WIDTH;
  const sanityImageMaxWidth = sanityImageDisplayWidth * 2;

  return (
    <div className="centered-outer">
      <div className="centered-content">
        {images === null ? (
          <div style={{ width: "100%", textAlign: "center", color: "#718096" }}>
            <p>Loading...</p>
          </div>
        ) : images.length === 0 ? (
          <div style={{ width: "100%", textAlign: "center", color: "#718096" }}>
            <p>No homescreen images found.</p>
          </div>
        ) : (
          <div style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center", gap: "2.5rem" }}>
            {images.map((img) => {
              const { width: displayWidth, height: displayHeight } = getFixedWidthDimensions(img.asset, sanityImageDisplayWidth);
              const { width: maxWidth, height: maxHeight } = getFixedWidthDimensions(img.asset, sanityImageMaxWidth);

              let href = "";
              if (img.type === "artwork") {
                href = `/artwork/${(img as ArtworkImageWithArtwork).artworkSlug}`;
              } else {
                href = `/exhibition/${(img as ExhibitionImageWithExhibition).exhibitionSlug}`;
              }

              return (
                <div key={img._key} className="centered-image-container">
                  <Link href={href} style={{ display: "block", width: "100%" }}>
                    <Image
                      src={urlFor(img.asset)
                        .width(maxWidth)
                        .auto("format")
                        .quality(80)
                        .url()}
                      alt={img.alt || ""}
                      width={maxWidth}
                      height={maxHeight}
                      className="centered-image"
                      loading="lazy"
                      sizes={`(max-width: ${sanityImageDisplayWidth}px) 100vw, ${sanityImageDisplayWidth}px`}
                    />
                  </Link>
                  {img.type === "artwork" ? (
                    <div style={{
                      textAlign: "center",
                      marginTop: "0.5rem",
                      fontSize: "0.75em",
                      color: "#444",
                      whiteSpace: "pre-line",
                      fontStyle: "italic",
                    }}>
                      {[img.artworkName, img.dimensions, img.medium, img.year]
                        .filter(Boolean)
                        .join(", ")}
                    </div>
                  ) : (
                    <div style={{
                      textAlign: "center",
                      marginTop: "0.5rem",
                      fontSize: "0.75em",
                      color: "#444",
                      whiteSpace: "pre-line",
                      fontStyle: "italic",
                    }}>
                      {[img.exhibitionName, img.year].filter(Boolean).join(", ")}
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