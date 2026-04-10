import { CommonModule } from '@angular/common';
import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { NavbarComponent } from '../../components/navbar/navbar';
import { SupportProductService } from '../../services/support-product/support-product';
import { SupportProductPostResponse } from '../../interfaces/support-product/support-product-response.interface';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { heroTag, heroCheckCircle, heroXCircle } from '@ng-icons/heroicons/outline';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ConfirmDialogComponent } from '../../components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-my-products',
  standalone: true,
  imports: [CommonModule, RouterModule, NavbarComponent, NgIconComponent],
  viewProviders: [
    provideIcons({
      heroTag,
      heroCheckCircle,
      heroXCircle
    })
  ],
  templateUrl: './my-products.html'
})
export class MyProductsComponent implements OnInit {

  myProducts: SupportProductPostResponse[] = [];
  loading = true;

  userId: number = 0;

  constructor(
    private supportProductService: SupportProductService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.userId = Number(localStorage.getItem('user_id'));
    this.loadMyProducts();
  }

  loadMyProducts(): void {
    this.loading = true;

    this.supportProductService.getAllPosts().subscribe({
      next: (data) => {
        this.ngZone.run(() => {
          this.myProducts = (data ?? []).filter(p => p.userId === this.userId);
          this.loading = false;
          this.cdr.detectChanges();
        });
      },
      error: (err) => {
        console.error('Error cargando mis productos', err);
        this.myProducts = [];
        this.loading = false;
      }
    });
  }

  goToDetail(product: SupportProductPostResponse) {
    this.router.navigate(['/support-products', product.id]);
  }

markAsSold(product: SupportProductPostResponse): void {
  const dialogRef = this.dialog.open(ConfirmDialogComponent, {
    width: '500px',
    maxWidth: '95vw',
    data: {
      title: 'Confirmar acción',
      message: `¿Estás seguro que querés marcar "${product.title}" como vendido?`
    }
  });

  dialogRef.afterClosed().subscribe((confirmed: boolean) => {
    if (!confirmed) return;

    this.supportProductService.updatePost(product.id, {
      publicationState: 'SOLD',
      acceptsOffers: false
    }).subscribe({
      next: (updatedProduct) => {
        product.publicationState = updatedProduct.publicationState;
        product.acceptsOffers = updatedProduct.acceptsOffers;
        this.myProducts = [...this.myProducts];

        this.snackBar.open('Producto marcado como vendido correctamente', 'Cerrar', {
          duration: 3000,
          horizontalPosition: 'end',
          verticalPosition: 'top'
        });
      },
      error: (error) => {
        console.error('Error al marcar como vendido:', error);

        this.snackBar.open('No se pudo marcar como vendido', 'Cerrar', {
          duration: 3000,
          horizontalPosition: 'end',
          verticalPosition: 'top'
        });
      }
    });
  });
}

  getImageUrl(product: SupportProductPostResponse): string | null {
    if (product.imageUrl) return product.imageUrl;

    if (product.imagePath) {
      if (product.imagePath.startsWith('http')) return product.imagePath;
      return `http://127.0.0.1:8081/${product.imagePath}`;
    }

    return null;
  }
}