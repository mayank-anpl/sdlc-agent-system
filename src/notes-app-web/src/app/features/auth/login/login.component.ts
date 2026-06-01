import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../../../core/auth/auth.service';
import { validateEmail, validatePassword } from '../../../shared/utils/auth-validation';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  email = '';
  password = '';
  loading = false;
  bannerError = '';
  emailError = '';
  passwordError = '';

  submit(): void {
    this.bannerError = '';
    this.emailError = validateEmail(this.email) ?? '';
    this.passwordError = this.password ? '' : 'Password is required.';

    if (this.emailError || this.passwordError) {
      return;
    }

    this.loading = true;
    this.auth.login({ email: this.email.trim(), password: this.password }).subscribe({
      next: () => {
        this.loading = false;
        void this.router.navigate(['/notes']);
      },
      error: (err) => {
        this.loading = false;
        this.bannerError = AuthService.extractErrorMessage(
          err,
          'Something went wrong. Please try again.'
        );
      },
    });
  }
}
