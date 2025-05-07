
"use client";

import { useEffect, useState, ReactNode } from "react";
import Link from 'next/link';
import client from "../lib/sanity";

interface SanityItem {
  _id: string;
  name: string;
  slug: string;
}
interface Artwork extends SanityItem {}
interface Exhibition extends SanityItem {}
interface Commercial extends SanityItem {}

export default function MainAppLayout({ children }: { children: ReactNode }) {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [exhibitions, setExhibitions] = useState<Exhibition[]>([]);
  const [commercials, setCommercials] = useState<Commercial[]>([]);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  // Fetch data on mount
  useEffect(() => {
    fetchArtworks();
    fetchExhibitions();
    fetchCommercials();
  }, []);

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

  // Accordion click handler
  const handleSectionClick = (section: string) => {
    if (expandedSection === section) {
      setExpandedSection(null);
    } else {
      setExpandedSection(section);
      if (section === "artwork" && artworks.length === 0) fetchArtworks();
      if (section === "exhibition" && exhibitions.length === 0) fetchExhibitions();
      if (section === "commercial" && commercials.length === 0) fetchCommercials();
    }
  };

  // Close mobile nav on route change (optional, for better UX)
  useEffect(() => {
    const handleRouteChange = () => setMobileNavOpen(false);
    window.addEventListener('hashchange', handleRouteChange);
    window.addEventListener('popstate', handleRouteChange);
    return () => {
      window.removeEventListener('hashchange', handleRouteChange);
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, []);

  // Helper: close nav on link click (mobile only)
  const closeMobileNav = () => setMobileNavOpen(false);

  // Height of the mobile header (should match the header's height in px)
  const mobileHeaderHeight = 56;

  // Padding for links and headers (matches px-4 py-3 from header)
  const linkPaddingClasses = "px-4 py-3";

  return (
    <>
      {/* Mobile Header Bar */}
      <header
        className="md:hidden fixed top-0 left-0 right-0 z-40 bg-white border-b border-gray-200 flex items-center h-14 px-4"
        style={{ height: `${mobileHeaderHeight}px` }}
      >
        <button
          aria-label="Open navigation menu"
          onClick={() => setMobileNavOpen(true)}
          type="button"
          className="bg-white rounded p-2 shadow border"
        >
          <span className="sr-only">Open navigation menu</span>
          {/* Hamburger Icon */}
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
            strokeLinecap="round" strokeLinejoin="round" className="feather feather-menu">
            <line x1="3" y1="12" x2="21" y2="12"/>
            <line x1="3" y1="6" x2="21" y2="6"/>
            <line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
        </button>
        {/* Removed the word "Menu" */}
      </header>

      {/* Overlay for mobile nav */}
      {mobileNavOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 z-30 md:hidden"
          onClick={closeMobileNav}
          aria-label="Close navigation overlay"
        />
      )}

      {/* Main Layout */}
      <div
        className="container mx-auto flex flex-col md:flex-row p-4 min-h-screen relative"
        style={{
          // Add top padding on mobile to prevent content being covered by header
          paddingTop: `calc(${mobileHeaderHeight}px + 1rem)`,
        }}
      >
        {/* Sidebar Navigation */}
        <nav
          className={`
            left-column
            fixed top-0 left-0 h-full z-40
            bg-white md:bg-transparent
            shadow-lg md:shadow-none
            border-r border-gray-200 md:border-none
            w-4/5 max-w-xs
            transform transition-transform duration-300 ease-in-out
            ${mobileNavOpen ? 'translate-x-0' : '-translate-x-full'}
            md:static md:translate-x-0 md:w-1/3 lg:w-1/4 xl:w-1/5 md:h-screen md:overflow-y-auto md:block
          `}
          style={{
            minWidth: '220px',
            // On mobile, start below the header
            top: mobileHeaderHeight,
            height: `calc(100% - ${mobileHeaderHeight}px)`,
          }}
          aria-label="Sidebar navigation"
        >
          {/* Close button (mobile only) */}
          <div className="flex items-center justify-between md:hidden px-4 py-3 border-b border-gray-200">
            {/* Removed the word "Menu" */}
            <span className="sr-only">Navigation</span>
            <button
              className="text-gray-700 hover:text-black"
              aria-label="Close navigation menu"
              onClick={closeMobileNav}
              type="button"
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                strokeLinecap="round" strokeLinejoin="round" className="feather feather-x">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>

          {/* Navigation List */}
          <ul className="nav-list pt-0 md:pt-0">
            {/* Home Link */}
            <li className="nav-item">
              <Link
                href="/"
                className={`text-lg font-bold hover:underline block ${linkPaddingClasses}`}
                onClick={closeMobileNav}
              >
                Home
              </Link>
            </li>
            {/* Artworks Section */}
            <li className="nav-item">
              <p
                onClick={() => handleSectionClick("artwork")}
                className={`text-lg font-bold cursor-pointer hover:underline block ${linkPaddingClasses}`}
              >
                Works
              </p>
              {expandedSection === "artwork" && (
                <ul className="mt-2 nav-sublist pl-4">
                  {artworks.length > 0 ? (
                    artworks.map((artwork) => (
                      <li key={artwork._id} className="nav-subitem text-left">
                        <Link
                          href={`/artwork/${artwork.slug}`}
                          className={`block py-2 hover:text-blue-600 transition-colors duration-150 ${linkPaddingClasses}`}
                          onClick={closeMobileNav}
                        >
                          {artwork.name}
                        </Link>
                      </li>
                    ))
                  ) : (
                    <li className={`text-gray-500 italic ${linkPaddingClasses}`}>Loading...</li>
                  )}
                </ul>
              )}
            </li>
            {/* Exhibitions Section */}
            <li className="nav-item">
              <p
                onClick={() => handleSectionClick("exhibition")}
                className={`text-lg font-bold cursor-pointer hover:underline block ${linkPaddingClasses}`}
              >
                Exhibitions
              </p>
              {expandedSection === "exhibition" && (
                <ul className="mt-2 nav-sublist pl-4">
                  {exhibitions.length > 0 ? (
                    exhibitions.map((exhibition) => (
                      <li key={exhibition._id} className="nav-subitem text-left">
                        <Link
                          href={`/exhibition/${exhibition.slug}`}
                          className={`block py-2 hover:text-blue-600 transition-colors duration-150 ${linkPaddingClasses}`}
                          onClick={closeMobileNav}
                        >
                          {exhibition.name}
                        </Link>
                      </li>
                    ))
                  ) : (
                    <li className={`text-gray-500 italic ${linkPaddingClasses}`}>Loading...</li>
                  )}
                </ul>
              )}
            </li>
            {/* Commercials Section */}
            <li className="nav-item">
              <p
                onClick={() => handleSectionClick("commercial")}
                className={`text-lg font-bold cursor-pointer hover:underline block ${linkPaddingClasses}`}
              >
                Commercial
              </p>
              {expandedSection === "commercial" && (
                <ul className="mt-2 nav-sublist pl-4">
                  {commercials.length > 0 ? (
                    commercials.map((commercial) => (
                      <li key={commercial._id} className="nav-subitem text-left">
                        <Link
                          href={`/commercial/${commercial.slug}`}
                          className={`block py-2 hover:text-blue-600 transition-colors duration-150 ${linkPaddingClasses}`}
                          onClick={closeMobileNav}
                        >
                          {commercial.name}
                        </Link>
                      </li>
                    ))
                  ) : (
                    <li className={`text-gray-500 italic ${linkPaddingClasses}`}>Loading...</li>
                  )}
                </ul>
              )}
            </li>
            {/* Contact Section */}
            <li className="nav-item">
              <Link
                href="/contact"
                className={`text-lg font-bold hover:underline block ${linkPaddingClasses}`}
                onClick={closeMobileNav}
              >
                About
              </Link>
            </li>
          </ul>
        </nav>

        {/* Right Content Column */}
        <main className="right-column w-full md:w-2/3 lg:w-3/4 xl:w-4/5 pl-0 md:pl-6">
          {children}
        </main>
      </div>
    </>
  );
}
