import { RoleOption } from '../interfaces/auth/role-option.interface';

export const ROLE_OPTIONS: RoleOption[] = [
  {
    id: 1,
    key: 'CLIENT',
    title: 'Cliente / Familiar',
    description: 'Busco servicios de cuidado para mí o un familiar'
  },
  {
    id: 2,
    key: 'PROVIDER',
    title: 'Proveedor',
    description: 'Ofrezco servicios profesionales de cuidado'
  },
  {
    id: 3,
    key: 'SENIOR',
    title: 'Adulto Mayor',
    description: 'Quiero gestionar mis propios servicios de cuidado'
  }
];