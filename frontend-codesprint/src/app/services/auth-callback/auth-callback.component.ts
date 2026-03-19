import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-auth-callback',
  template: '<div class="loading">Procesando autenticación...</div>',
  styles: [`
    .loading {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      font-size: 1.2rem;
      color: #667eea;
    }
  `]
})
export class AuthCallbackComponent implements OnInit {
  constructor(
    private route: ActivatedRoute,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      const token = params['token'];
      const email = params['email'];

      if (token) {
        this.authService.handleAuthCallback(token);
      } else if (email) {
        // Si el backend devuelve email en lugar de token
        localStorage.setItem('user', email);
        this.router.navigate(['/dashboard']);
      } else {
        this.router.navigate(['/login']);
      }
    });
  }
}
