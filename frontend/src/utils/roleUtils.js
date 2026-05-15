export const ROLE_LABELS = {
  store_staff: "Store Staff",
  dsm: "DSM / Manager",
  vendor: "Vendor",
  admin: "Admin",
};

export function can(user, ...roles) {
  return user && roles.includes(user.role);
}
