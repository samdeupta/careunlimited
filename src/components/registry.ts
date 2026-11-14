import { text, list } from './text';
import { cards } from './cards';
import { accordion } from './accordion';
import { gallery } from './gallery';
import { videos } from './videos';
import { testimonials } from './testimonials';
import { index } from './page-index';
import { form } from './form';
import type { ComponentRegistry } from '../types';

export const COMPONENTS: ComponentRegistry = {
  text,
  list,
  cards,
  accordion,
  gallery,
  videos,
  testimonials,
  index,
  form,
};
