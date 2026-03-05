/**
 * Admin Feature - Public API
 * Barrel export for admin feature
 */

export { useUserSearchQuery, useUserLookupQuery, useDinnerStatsQuery, useUserAttendanceQuery } from './hooks';
export { defaultAdminRepository, type AdminRepository, type UserSearchResult } from './repository';
