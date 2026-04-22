import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

/**
 * Guard de autenticación.
 * Verifica que exista un token en localStorage (key: 'auth_token')
 * que es la misma key que usa tu AuthService.saveSession().
 */
export const telemedAuthGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);

  const token = localStorage.getItem('auth_token');
  if (!token) {
    router.navigate(['/login'], {
      queryParams: { returnUrl: state.url },
    });
    return false;
  }

  const sessionId = route.paramMap.get('sessionId');
  if (!sessionId || sessionId.trim() === '') {
    router.navigate(['/']);
    return false;
  }

  return true;
};

/**
 * Guard para la vista del doctor.
 * Verifica que user_role sea 'PROVIDER' (que es lo que tu login guarda).
 *
 * Tu LoginComponent hace:
 *   localStorage.setItem('user_role', response.role);
 *
 * Y tu redirectByRole usa 'PROVIDER' para doctores.
 */
export const doctorRoleGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);

  const token = localStorage.getItem('auth_token');
  if (!token) {
    router.navigate(['/login']);
    return false;
  }

  const role = localStorage.getItem('user_role');

  if (role === 'PROVIDER' || role === 'ADMIN') {
    return true;
  }

  router.navigate(['/']);
  return false;
};

/**
 * Guard para la vista del paciente.
 * Verifica que user_role sea 'CLIENT' o 'SENIOR'.
 *
 * Tu redirectByRole usa:
 *   'CLIENT'  → family-profile
 *   'SENIOR'  → profile
 */
export const patientRoleGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);

  const token = localStorage.getItem('auth_token');
  if (!token) {
    router.navigate(['/login']);
    return false;
  }

  const role = localStorage.getItem('user_role');

  if (role === 'CLIENT' || role === 'SENIOR') {
    return true;
  }

  router.navigate(['/']);
  return false;
};