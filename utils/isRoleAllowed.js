// utils/isRoleAllowed.js
function isRoleAllowed(vote, roleId) {
  const aud = vote?.allowed_roles;
  if (!aud || (Array.isArray(aud) && aud.length === 0)) return true; // ouvert
  return Array.isArray(aud) ? aud.includes(roleId) : false;
}
module.exports = { isRoleAllowed };
