import type { CollectionDefinition } from '../lib/types';
import { arraylist } from './arraylist';
import { linkedlist } from './linkedlist';
import { hashmap } from './hashmap';
import { hashset } from './hashset';
import { treemap } from './treemap';

export const collections: CollectionDefinition[] = [
  arraylist,
  linkedlist,
  hashmap,
  treemap,
  hashset,
];