// --- REVISED: app/(main)/layout.tsx ---
// Added a "Home" link to the navigation list.

"use client"; // Required for hooks like useState and useEffect

import { useEffect, useState, ReactNode } from "react";
import Link from 'next/link';
// Ensure these paths are correct relative to app/(main)/layout.tsx
import client from "../lib/sanity";
import { urlFor } from "../lib/sanityImage"; // Keep if needed elsewhere, not used in this version directly

// --- Interfaces (Good Practice) ---
interface SanityItem {
  _id: string;
  name: string;
  slug: string;
}
interface Artwork extends SanityItem {}
interface Exhibition extends SanityItem {}
interface Commercial extends SanityItem {}
// --- End Interfaces ---

export default function MainAppLayout({ children }: { children: ReactNode }) {
  // --- State for Navigation Accordion ---
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [exhibitions, setExhibitions] = useState<Exhibition[]>([]);
  const [commercials, setCommercials] = useState<Commercial[]>([]);

  // --- Data Fetching Functions ---
  const fetchArtworks = async () => {
    try {
      const artworkResponse = await client.fetch<Artwork[]>(`
        *[_type == "artwork"] | order(year desc, name asc) { _id, name, "slug": slug.current }
      `);
      setArtworks(artworkResponse);
    } catch (error) { console.error("Failed to fetch artworks:", error); }
  };

  const fetchExhibitions = async () => {
     try {
      const exhibitionResponse = await client.fetch<Exhibition[]>(`
        *[_type == "exhibition"] | order(year desc, name asc) { _id, name, "slug": slug.current }
      `);
      setExhibitions(exhibitionResponse);
    } catch (error) { console.error("Failed to fetch exhibitions:", error); }
  };

  const fetchCommercials = async () => {
    try {
      const commercialResponse = await client.fetch<Commercial[]>(`
        *[_type == "commercial"] | order(date desc, name asc) { _id, name, "slug": slug.current }
      `);
      setCommercials(commercialResponse);
    } catch (error) { console.error("Failed to fetch commercials:", error); }
  };
  // --- End Data Fetching Functions ---

  // --- Accordion Click Handler ---
  const handleSectionClick = (section: string) => {
    // Toggle behavior: If clicking the same section, collapse it. Otherwise, expand the new one.
    if (expandedSection === section) {
      setExpandedSection(null);
    } else {
      setExpandedSection(section);
      // Fetch data only if the section is being opened and data hasn't been loaded yet
      if (section === "artwork" && artworks.length === 0) fetchArtworks();
      if (section === "exhibition" && exhibitions.length === 0) fetchExhibitions();
      if (section === "commercial" && commercials.length === 0) fetchCommercials();
    }
  };
  // --- End Accordion Click Handler ---

  // --- Initial Data Fetching on Layout Mount ---
  // Fetches the lists when the layout first loads.
  // Alternatively, remove this useEffect to only fetch when a section is expanded.
  useEffect(() => {
      fetchArtworks();
      fetchExhibitions();
      fetchCommercials();
  }, []);
  // --- End Initial Data Fetching ---

  // --- JSX Layout Structure ---
  return (
    // Main container using Flexbox for side-by-side columns on medium+ screens
    <div className="container mx-auto flex flex-col md:flex-row p-4 min-h-screen">

      {/* Left Navigation Column */}
      <nav className="left-column w-full md:w-1/3 lg:w-1/4 xl:w-1/5 pr-0 md:pr-6 mb-4 md:mb-0 md:sticky md:top-0 md:h-screen md:overflow-y-auto border-r border-gray-200">
         {/* Removed the site title */}

         {/* Navigation List */}
         <ul className="space-y-4 nav-list pt-4 md:pt-0"> {/* Added top padding for spacing */}

            {/* --- ADDED HOME LINK --- */}
            <li className="nav-item">
                <Link href="/" className="text-lg font-bold hover:underline block py-1">
                  Home
                </Link>
            </li>
            {/* --- END HOME LINK --- */}

            {/* Artworks Section */}
            <li className="nav-item">
              {/* Using <p> tag for header, matching previous style */}
              <p
                  onClick={() => handleSectionClick("artwork")}
                  className="text-lg font-bold cursor-pointer hover:underline" // Style from page.tsx nav
              >
                  Works
              </p>
              {/* Conditional rendering of the sub-list */}
              {expandedSection === "artwork" && (
                  <ul className="mt-2 space-y-1 nav-sublist pl-4"> {/* Sub-list styling */}
                  {artworks.length > 0 ? ( // Check if artworks are loaded
                      artworks.map((artwork) => ( // Map through artworks
                      <li key={artwork._id} className="nav-subitem text-left">
                          {/* Link to the individual artwork page */}
                          <Link href={`/artwork/${artwork.slug}`} className="block py-1 hover:text-blue-600 transition-colors duration-150">
                            {artwork.name} {/* Display artwork name */}
                          </Link>
                      </li>
                      ))
                  ) : ( // Display loading indicator if artworks are not yet loaded
                      <li className="text-gray-500 italic px-1 py-1">Loading...</li>
                  )}
                  </ul>
              )}
            </li>

            {/* Exhibitions Section (Similar structure as Artworks) */}
            <li className="nav-item">
             <p
                  onClick={() => handleSectionClick("exhibition")}
                  className="text-lg font-bold cursor-pointer hover:underline"
              >
                  Exhibitions
              </p>
              {expandedSection === "exhibition" && (
                  <ul className="mt-2 space-y-1 nav-sublist pl-4">
                  {exhibitions.length > 0 ? (
                      exhibitions.map((exhibition) => (
                      <li key={exhibition._id} className="nav-subitem text-left">
                          <Link href={`/exhibition/${exhibition.slug}`} className="block py-1 hover:text-blue-600 transition-colors duration-150">
                            {exhibition.name}
                          </Link>
                      </li>
                      ))
                  ) : (
                      <li className="text-gray-500 italic px-1 py-1">Loading...</li>
                  )}
                  </ul>
              )}
            </li>

            {/* Commercials Section (Similar structure as Artworks) */}
            <li className="nav-item">
              <p
                  onClick={() => handleSectionClick("commercial")}
                  className="text-lg font-bold cursor-pointer hover:underline"
              >
                  Commercial
              </p>
              {expandedSection === "commercial" && (
                  <ul className="mt-2 space-y-1 nav-sublist pl-4">
                  {commercials.length > 0 ? (
                      commercials.map((commercial) => (
                      <li key={commercial._id} className="nav-subitem text-left">
                          <Link href={`/commercial/${commercial.slug}`} className="block py-1 hover:text-blue-600 transition-colors duration-150">
                            {commercial.name}
                          </Link>
                      </li>
                      ))
                  ) : (
                      <li className="text-gray-500 italic px-1 py-1">Loading...</li>
                  )}
                  </ul>
              )}
            </li>

            {/* Contact Section - Direct link to the contact page */}
            <li className="nav-item">
                <Link href="/contact" className="text-lg font-bold hover:underline block py-1">
                  About
                </Link>
            </li>

         </ul>
      </nav>

      {/* Right Content Column - Renders the actual page content */}
      <main className="right-column w-full md:w-2/3 lg:w-3/4 xl:w-4/5 pl-0 md:pl-6">
        {/* The `children` prop represents the content of the specific page being rendered */}
        {children}
      </main>

    </div>
  );
}
// --- END OF FILE: app/(main)/layout.tsx ---