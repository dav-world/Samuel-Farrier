"use client";

import { useEffect, useState } from 'react';
import client from '../../lib/sanity';
import { PortableText } from '@portabletext/react';
import { urlFor } from '../../lib/sanityImage'; // Assuming this is your image helper

const ContactPage = () => {
  const [contact, setContact] = useState<any | null>(null); // Store the contact data
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // State for the Mailchimp form
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchContact = async () => {
      setLoading(true);
      setError(null);
      try {
        const contactData = await client.fetch(
          `*[_type == "contact"][0]{
            title,
            email,
            address,
            about
          }`
        );
        setContact(contactData);
      } catch (err) {
        console.error('Failed to fetch contact information:', err);
        setError('Failed to load contact information.');
      } finally {
        setLoading(false);
      }
    };

    fetchContact();
  }, []);

  // Handle Mailchimp subscription
  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(''); // Clear any previous message

    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.status === 201) {
        setMessage('Success! You are now subscribed.');
        setEmail(''); // Clear email input after successful subscription
      } else {
        setMessage(data.error || 'Something went wrong');
      }
    } catch (error) {
      setMessage('An error occurred. Please try again.');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!contact) return <div>No contact information found.</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">{contact.title}</h1>
      <p className="text-lg">
        Email: <a href={`mailto:${contact.email}`} className="text-blue-600 underline">{contact.email}</a>
      </p>
      <p className="text-lg">Address: {contact.address}</p>

      <div className="mt-6">
        <h2 className="text-xl font-bold">About</h2>
        <PortableText
          value={contact.about}
          components={{
            types: {
              image: ({ value }) => (
                <img src={urlFor(value).url()} alt="About image" className="my-4 max-w-full h-auto" />
              ),
            },
          }}
        />
      </div>

      {/* Mailchimp Subscription Form */}
      <div className="mt-8">
        <h2 className="text-xl font-bold">Subscribe</h2>
        <form onSubmit={handleSubscribe} className="mt-4">
          <label htmlFor="email" className="block text-lg font-medium">
            Email Address
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="p-2 border rounded mt-1 w-full"
            required
          />
          <button type="submit" className="mt-4 p-2 bg-blue-500 text-white rounded">
            Subscribe
          </button>
        </form>
        {message && <p className="mt-4">{message}</p>}
      </div>
    </div>
  );
};

export default ContactPage;
