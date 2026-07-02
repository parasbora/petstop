export const DOG_BREEDS = [
  'Labrador Retriever',
  'Golden Retriever',
  'German Shepherd',
  'Beagle',
  'Poodle',
  'Bulldog',
  'Rottweiler',
  'Dachshund',
  'Shih Tzu',
  'Pug',
  'Doberman',
  'Boxer',
  'Husky',
  'Indian Pariah Dog',
  'Other',
] as const

export const CAT_BREEDS = [
  'Persian',
  'Siamese',
  'Maine Coon',
  'Ragdoll',
  'British Shorthair',
  'Bengal',
  'Sphynx',
  'Indian Domestic Cat',
  'Other',
] as const

export const BREEDS_BY_SPECIES: Record<'dog' | 'cat', readonly string[]> = {
  dog: DOG_BREEDS,
  cat: CAT_BREEDS,
}
