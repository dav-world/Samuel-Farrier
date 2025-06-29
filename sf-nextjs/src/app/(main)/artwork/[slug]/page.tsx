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

export default function ArtworkDetailPage({ params }) {
  const { slug } = params; // Destructure the slug from params
  
  const [artwork, setArtwork] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchArtwork = async () => {
      if (!slug) return; // Ensure we have the slug before making the request

      console.log('Fetching artwork for slug:', slug);  // Log the slug to ensure it's correct
      try {
        const data = await client.fetch(
          `*[_type == "artwork" && slug.current == $slug][0]{
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
              "slug": slug.current // Fetch related slugs if you link to them
            },
          }`,
          { slug: params.slug }
        );

        console.log('Fetched Artwork Data:', data);  // Log the fetched data for debugging

        if (!data) {
          console.warn('No artwork found with ID:', id);  // Warn if no data is returned
        }

        setArtwork(data);
      } catch (err) {
        console.error("Failed to fetch artwork details:", err);
        setError("Failed to fetch artwork");
      } finally {
        setLoading(false);
      }
    };

    fetchArtwork();  // Call the function when `id` is available
  }, [params.slug]); // Watch for changes in `id`

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;
  if (!artwork) return <div>Artwork not found</div>;

  return <ArtworkDetail artwork={artwork} />;
}
