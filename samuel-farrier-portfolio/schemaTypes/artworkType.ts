import {defineField, defineType} from 'sanity'

export const artworkType = defineType({
  name: 'artwork',
  title: 'Artwork',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'name',
        maxLength: 96,
      },
    }),
    defineField({
      name: 'year',
      title: 'Year',
      type: 'number',
    }),
    defineField({
      name: 'date',
      title: 'Date',
      type: 'datetime',
    }),
    defineField({
      name: 'dimensions',
      title: 'Dimensions',
      type: 'string',
    }),
    defineField({
      name: 'medium',
      title: 'Medium',
      type: 'string',
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'array',
      of: [{ type: 'block' }],
    }),
    defineField({
      name: 'images',
      title: 'Images',
      type: 'array',
      of: [{ type: 'image' }],
    }),
    defineField({
      name: 'videos',
      title: 'Videos',
      type: 'array',
      of: [{ type: 'url' }],
    }),
    defineField({
      name: 'press',
      title: 'Press',
      type: 'array',
      of: [
        {
          type: 'block',
          styles: [{ title: 'Normal', value: 'normal' }],
          lists: [{ title: 'Bullet', value: 'bullet' }],
          marks: {
            decorators: [{ title: 'Strong', value: 'strong' }],
            annotations: [
              {
                name: 'link',
                type: 'object',
                title: 'URL',
                fields: [
                  {
                    name: 'href',
                    type: 'url',
                  },
                ],
              },
            ],
          },
        },
        {
          type: 'image',
          options: { hotspot: true },
        },
      ],
    }),
    defineField({
      name: 'visibility',
      title: 'Public/Private',
      type: 'string',
      options: {
        list: [
          { title: 'Public', value: 'public' },
          { title: 'Private', value: 'private' },
        ],
        layout: 'radio',
      },
    }),
    defineField({
      name: 'homescreen',
      title: 'Show on Home Screen',
      type: 'boolean',
    }),
    defineField({
      name: 'exhibited',
      title: 'Exhibited',
      type: 'boolean',
    }),
    defineField({
      name: 'exhibitionLink',
      title: 'Exhibition Link',
      type: 'url',
      hidden: ({ parent }) => !parent?.exhibited,
    }),
    defineField({
      name: 'available',
      title: 'Available',
      type: 'string',
      options: {
        list: [
          { title: 'Yes', value: 'yes' },
          { title: 'No', value: 'no' },
        ],
        layout: 'radio',
      },
    }),
    defineField({
      name: 'buyer',
      title: 'Buyer',
      type: 'string',
      hidden: ({ parent }) => parent?.available !== 'no',
    }),
    defineField({
      name: 'date_purchased',
      title: 'Date',
      type: 'number',
      hidden: ({ parent }) => parent?.available !== 'no',
    }),
    defineField({
      name: 'purchase_price',
      title: 'Price',
      type: 'number',
      hidden: ({ parent }) => parent?.available !== 'no',
    }),
    defineField({
      name: 'price',
      title: 'Price',
      type: 'number',
    }),
    defineField({
      name: 'notes',
      title: 'Notes',
      type: 'array',
      of: [
        {
          type: 'block',
          styles: [{ title: 'Normal', value: 'normal' }],
          lists: [{ title: 'Bullet', value: 'bullet' }],
          marks: {
            decorators: [{ title: 'Strong', value: 'strong' }],
            annotations: [
              {
                name: 'link',
                type: 'object',
                title: 'URL',
                fields: [
                  {
                    name: 'href',
                    type: 'url',
                  },
                ],
              },
            ],
          },
        },
        {
          type: 'image',
          options: { hotspot: true },
        },
      ],
    }),
    {
      name: 'relatedExhibitions',
      title: 'Related Exhibitions',
      type: 'array',
      of: [{ type: 'reference', to: { type: 'exhibition' } }]
    },
    defineField({
      name: 'categories',
      title: 'Categories',
      type: 'array',
      of: [{ type: 'string' }],
      options: {
        layout: 'tags', // Allows you to add multiple options as tags
      },
    }),
  ],
})