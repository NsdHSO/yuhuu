import type { ProfileResponse, UserResponse } from '@/features/profile/api';
import type { MyRole } from '@/features/roles/meRoles';

export type BootstrapResponse = {
    user: UserResponse;
    profile: ProfileResponse | null;
    roles?: MyRole[];
    created?: { linked: boolean; profile: boolean };
};
