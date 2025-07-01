import { createClient } from '@sanity/client';

// Debugging: Log environment variables
console.log("Sanity Project ID:", process.env.NEXT_PUBLIC_SANITY_PROJECT_ID);
console.log("Sanity Dataset:", process.env.NEXT_PUBLIC_SANITY_DATASET);
console.log("Sanity API Version:", process.env.NEXT_PUBLIC_SANITY_API_VERSION);

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,  // Your Sanity project ID
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,      // Your Sanity dataset (e.g., 'production')
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2023-07-24', // Use the API version from your .env file or a default value
  useCdn: false,  // Set to true for faster response times (good for public data)
});

export default client;