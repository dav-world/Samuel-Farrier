import {defineField, defineType} from 'sanity'

export const commercialType = defineType({
  name: 'commercial',
  title: 'Commercial',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      type: 'string',
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'client',
        maxLength: 96,
      },
    }),
    defineField({
      name: 'date',
      title: 'Date',
      type: 'number',
    }),
    defineField({
      name: 'images',
      title: 'Images',
      type: 'array',
      of: [{ type: 'image' }],
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'array',
      of: [{ type: 'block' }],
    }),
    defineField({
      name: 'photographer',
      title: 'Photographer',
      type: 'string',
    }),
    defineField({
      name: 'stylist',
      title: 'Stylist',
      type: 'string',
    }),
    defineField({
      name: 'category',
      title: 'Editorial/Advertising',
      type: 'string',
      options: {
        list: [
          { title: 'Editorial', value: 'editorial' },
          { title: 'Advertising', value: 'advertising' },
        ],
        layout: 'dropdown',
      },
    }),
  ],
})
