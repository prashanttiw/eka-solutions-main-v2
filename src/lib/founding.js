// Founding 25: the offer to EKA's first clients. Update `taken` by hand as places are
// genuinely filled. While it is null the site shows the total only and never invents a
// "places left" count.
export const FOUNDING = {
  total: 25,
  taken: null,
  applyPath: '/contact?founding=1',
};

export const foundingLeft = () =>
  FOUNDING.taken === null ? null : Math.max(FOUNDING.total - FOUNDING.taken, 0);
