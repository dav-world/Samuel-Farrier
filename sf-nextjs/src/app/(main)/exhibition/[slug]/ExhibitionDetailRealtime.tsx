"use client";

import { useEffect, useState } from "react";
import client from "../../../lib/sanity";
import Image from "next/image";
import { urlFor } from "../../../lib/sanityImage";

const UNIFORM_WIDTH = 600;

interface ExhibitionImageBlock {
  _type: "image";
  asset: any;
  alt?: string;
  caption?: string;
  _key?: string;
}

interface Exhibition {
  _id: string;
  name: string;
  slug: { current: string };
  year?: number | string;
  images: ExhibitionImageBlock[];
  description?: any;
  // Add other fields as needed
}

interface ExhibitionDetailRealtimeProps {
  slug: string;
}

function getFixedWidthDimensions(asset: any, fixedWidth: number) {
  const origWidth = asset?.metadata?.dimensions?.width || 800;
  const origHeight = asset?.metadata?.dimensions?.height || 600;
  const width = fixedWidth;
  const height = Math.round(origHeight * (width / origWidth));
  return { width, height };
}

function isSanityImageBlock(block: any): block is ExhibitionImageBlock {
  return block && block._type === "image" && !!block.asset;
}

const exhibitionQuery = `
  *[_type == "exhibition" && slug.current == $slug][0]{
    _id,
    name,
    slug,
    year,
    images[]{
      _key,
      _type,
      alt,
      caption,
      asset->{
        _id,
        _type,
        url,
        metadata
      }
    },
    description
  }
`;

const ExhibitionDetailRealtime: React.FC<ExhibitionDetailRealtimeProps> = ({ slug }) => {
  const [exhibition, setExhibition] = useState<Exhibition | null>(null);

  useEffect(() => {
    let isMounted = true;

    // Initial fetch
    client.fetch<Exhibition>(exhibitionQuery, { slug }).then(data => {
      if (isMounted) setExhibition(data);
    });

    // Listen for changes
    const subscription = client
      .listen(exhibitionQuery, { slug }, { includeResult: true })
      .subscribe(update => {
        if (update.type === "mutation" && update.result && isMounted) {
            setExhibition(update.result as unknown as Exhibition);
        }
      });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [slug]);

  if (!exhibition) {
    return (
      <div className="centered-outer">
        <div className="centered-content">Exhibition not found</div>
      </div>
    );
  }

  return (
    <div className="centered-outer">
      <div className="centered-content">
        <h1>{exhibition.name}</h1>
        {exhibition.year && <p>{exhibition.year}</p>}

        {/* Images */}
        {exhibition.images && exhibition.images.length > 0 && (
          <div>
            {exhibition.images.map(image => {
              if (isSanityImageBlock(image)) {
                const { width, height } = getFixedWidthDimensions(image.asset, UNIFORM_WIDTH);
                return (
                  <div key={image._key} className="centered-image-container">
                    <Image
                      src={urlFor(image.asset).width(UNIFORM_WIDTH * 2).auto("format").quality(80).url()}
                      alt={image.alt || "Exhibition image"}
                      width={width * 2}
                      height={height * 2}
                      className="centered-image"
                      sizes={`(max-width: ${UNIFORM_WIDTH}px) 100vw, ${UNIFORM_WIDTH}px`}
                    />
                    {image.caption && (
                      <p style={{ textAlign: "center", marginTop: "0.5rem" }}>{image.caption}</p>
                    )}
                  </div>
                );
              }
              return null;
            })}
          </div>
        )}

        {/* Description */}
        {exhibition.description && (
          <div style={{ marginTop: "1rem" }}>
            {/* Render description as needed */}
          </div>
        )}
      </div>
    </div>
  );
};

export default ExhibitionDetailRealtime;