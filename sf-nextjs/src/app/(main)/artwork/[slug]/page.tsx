/* eslint-disable */
// @ts-nocheck

"use client";

import { useEffect, useState } from 'react';
import client from '../../../lib/sanity';
import ArtworkDetail from '../components/ArtworkDetail';

interface ArtworkDetailPageProps {
  params: {
    slug: string;
  };
}

const artworkQuery = `
  *[_type == "artwork" && slug.current == $slug][0]{
    _id,
    name,
    year,
    date,
    dimensions,
    medium,
    description,
    images,
    videos,
    press,
    visibility,
    exhibited,
    exhibitionLink,
    available,
    buyer,
    date_purchased,
    purchase_price,
    price,
    notes,
    categories,
    relatedExhibitions[]-> {
      _id,
      name,
      "slug": slug.current
    },
  }
`;

export default function ArtworkDetailPage({ params }) {
  const { slug } = params;
  const [artwork, setArtwork] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    // Initial fetch
    const fetchArtwork = async () => {
      if (!slug) return;
      setLoading(true);
      setError(null);

      try {
        const data = await client.fetch(artworkQuery, { slug });
        if (isMounted) setArtwork(data);
      } catch (err) {
        if (isMounted) setError("Failed to fetch artwork");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchArtwork();

    // Listen for real-time updates
    const subscription = client
      .listen(artworkQuery, { slug }, { includeResult: true })
      .subscribe(update => {
        if (update.result && isMounted) {
          setArtwork(update.result);
        }
      });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [slug]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;
  if (!artwork) return <div>Artwork not found</div>;

  return <ArtworkDetail artwork={artwork} />;
}