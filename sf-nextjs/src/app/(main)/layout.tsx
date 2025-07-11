"use client";

import { useEffect, useState, ReactNode } from "react";
import Link from 'next/link';
import client from "../lib/sanity";

interface SanityItem {
  _id: string;
  name: string;
  slug: string;
  importance?: number;
  _createdAt: string;
}
interface Artwork extends SanityItem {
  available?: string;
  visibility?: string;
}
interface Exhibition extends SanityItem {}

// Move GROQ queries outside the component to avoid dependency warning
const artworkQuery = `
  *[
    _type == "artwork" &&
    lower(available) == "yes" &&
    lower(visibility) == "public"
  ] {
    _id, name, "slug": slug.current, available, visibility, importance, _createdAt
  }
`;
const exhibitionQuery = `
  *[_type == "exhibition"] {
    _id, name, "slug": slug.current, importance, _createdAt
  }
`;

function TwoLineHamburgerXIcon({ open }: { open: boolean }) {
  // Uses two lines that animate into an X
  return (
    <span className="relative w-8 h-8 flex items-center justify-center">
      <span
        className={`
          absolute left-1 right-1 h-0.5 bg-black transition-all duration-300
          ${open
            ? 'top-1/2 rotate-45'
            : 'top-[10px] rotate-0'
          }
        `}
        style={{ transitionProperty: 'top, transform, background' }}
      />
      <span
        className={`
          absolute left-1 right-1 h-0.5 bg-black transition-all duration-300
          ${open
            ? 'top-1/2 -rotate-45'
            : 'top-[22px] rotate-0'
          }
        `}
        style={{ transitionProperty: 'top, transform, background' }}
      />
    </span>
  );
}

export default function MainAppLayout({ children }: { children: ReactNode }) {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [exhibitions, setExhibitions] = useState<Exhibition[]>([]);
  const [commercials, setCommercials] = useState<SanityItem[]>([]);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  // Fetch data on mount and set up real-time listeners
  useEffect(() => {
    let isMounted = true;

    const fetchArtworks = async () => {
      try {
        const artworkResponse = await client.fetch<Artwork[]>(artworkQuery);
        if (!isMounted) return;
        const withImportance = artworkResponse.filter(a => typeof a.importance === 'number');
        const withoutImportance = artworkResponse.filter(a => typeof a.importance !== 'number');
        withImportance.sort((a, b) => (a.importance! - b.importance!));
        withoutImportance.sort((a, b) => new Date(a._createdAt).getTime() - new Date(b._createdAt).getTime());
        setArtworks([...withImportance, ...withoutImportance]);
      } catch (error) {
        console.error("Failed to fetch artworks:", error);
      }
    };

    const fetchExhibitions = async () => {
      try {
        const exhibitionResponse = await client.fetch<Exhibition[]>(exhibitionQuery);
        if (!isMounted) return;
        const withImportance = exhibitionResponse.filter(e => typeof e.importance === 'number');
        const withoutImportance = exhibitionResponse.filter(e => typeof e.importance !== 'number');
        withImportance.sort((a, b) => (a.importance! - b.importance!));
        withoutImportance.sort((a, b) => new Date(a._createdAt).getTime() - new Date(b._createdAt).getTime());
        setExhibitions([...withImportance, ...withoutImportance]);
      } catch (error) {
        console.error("Failed to fetch exhibitions:", error);
      }
    };

    const fetchCommercials = async () => {
      try {
        const commercialResponse = await client.fetch<SanityItem[]>(`
          *[_type == "commercial"] | order(date desc, name asc) { _id, name, "slug": slug.current }
        `);
        if (!isMounted) return;
        setCommercials(commercialResponse);
      } catch (error) {
        console.error("Failed to fetch commercials:", error);
      }
    };

    fetchArtworks();
    fetchExhibitions();
    fetchCommercials();

    // Listen for real-time updates to artworks and exhibitions
    // Add a runtime check for client.listen to avoid runtime errors
    let artworkSubscription: { unsubscribe: () => void } | null = null;
    let exhibitionSubscription: { unsubscribe: () => void } | null = null;

    if (typeof client.listen === "function") {
      artworkSubscription = client
        .listen(artworkQuery, {}, { includeResult: true })
        .subscribe(event => {
          if (event.type === "mutation" && isMounted) {
            fetchArtworks();
          }
        });

      exhibitionSubscription = client
        .listen(exhibitionQuery, {}, { includeResult: true })
        .subscribe(event => {
          if (event.type === "mutation" && isMounted) {
            fetchExhibitions();
          }
        });
    } else {
      console.warn("Sanity client.listen is not available. Real-time updates are disabled.");
    }

    return () => {
      isMounted = false;
      artworkSubscription?.unsubscribe();
      exhibitionSubscription?.unsubscribe();
    };
  }, []); // No missing dependencies, queries are stable

  // Accordion click handler
  const handleSectionClick = (section: string) => {
    if (expandedSection === section) {
      setExpandedSection(null);
    } else {
      setExpandedSection(section);
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
        className="md:hidden fixed top-0 left-0 right-0 z-40 bg-white flex items-center h-14 px-4"
        style={{ height: `${mobileHeaderHeight}px` }}
      >
        <button
          aria-label={mobileNavOpen ? "Close navigation menu" : "Open navigation menu"}
          onClick={() => setMobileNavOpen((open) => !open)}
          type="button"
          className="flex items-center justify-center"
        >
          <span className="sr-only">
            {mobileNavOpen ? "Close navigation menu" : "Open navigation menu"}
          </span>
          <TwoLineHamburgerXIcon open={mobileNavOpen} />
        </button>
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
            overflow-y-auto md:overflow-y-auto
            ${mobileNavOpen ? 'translate-x-0' : '-translate-x-full'}
            md:static md:translate-x-0 md:w-1/3 lg:w-1/4 xl:w-1/5 md:h-screen md:overflow-y-auto md:block
          `}
          style={{
            minWidth: '220px',
            top: mobileHeaderHeight,
            height: `calc(100% - ${mobileHeaderHeight}px)`,
          }}
          aria-label="Sidebar navigation"
        >
          {/* Navigation List */}
          <ul className="nav-list pt-0 md:pt-0">
            {/* Home Link */}
            <li className="nav-item">
              <Link
                href="/"
                className={`text-lg font-bold hover:underline block ${linkPaddingClasses}`}
                onClick={closeMobileNav}
              >
                Samuel Farrier
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
            {/* <li className="nav-item">
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
            </li> */}
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