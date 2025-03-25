import { isValidSlug } from '$lib/utils';

export const match = (param: string) => {
  return isValidSlug(param);
};
