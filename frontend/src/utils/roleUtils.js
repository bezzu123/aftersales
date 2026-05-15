export const ROLE_LABELS = {
  pc:    "Product Consultant",
  bdc:   "BDC Staff",
  gr:    "GR Staff",
  dsm:   "District Manager",
  admin: "Administrator",
};

export function can(user, ...roles) {
  return user && roles.includes(user.role);
}
