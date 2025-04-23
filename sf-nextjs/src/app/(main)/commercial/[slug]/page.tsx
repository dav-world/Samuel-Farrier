/* eslint-disable */
// @ts-nocheck

"use client";

import { useEffect, useState } from 'react';
import client from '../../../lib/sanity';
import CommercialDetail from '../components/CommercialDetail';

interface CommercialDetailPageProps {
  params: {
    slug: string;
  };
}
export default function CommercialDetailPage({ params }) {
  const { slug } = params;

  const [commercial, setCommercial] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCommercial = async () => {
      if (!slug) return;

      console.log('Fetching commercial for slug:', slug);
      try {
        const data = await client.fetch(
          `*[_type == "commercial" && slug.current == $slug][0]{
            _id,
            name,
            "slug": slug.current,
            date,
            images[]{
              asset->{
                _id,
                url
              },
              alt,
              caption
            },
            description,
            photographer,
            stylist,
            category
          }`,
          { slug: params.slug }
        );

        console.log('Fetched Commercial Data:', data);
        if (!data) {
          console.warn('No commercial found with slug:', slug);
        }

        setCommercial(data);
      } catch (err) {
        console.error("Failed to fetch commercial details:", err);
        setError("Failed to fetch commercial");
      } finally {
        setLoading(false);
      }
    };

    fetchCommercial();
  }, [slug]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;
  if (!commercial) return <div>Commercial not found</div>;

  return <CommercialDetail commercial={commercial} />;
}
