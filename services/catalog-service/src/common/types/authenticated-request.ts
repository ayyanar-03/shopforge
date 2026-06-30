import { Role } from '../../auth/roles.enum';

export interface AuthenticatedRequest {
  user: {
    id: number;
    email: string;
    role: Role;
  };
}
