import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filterByCategory',
  standalone: true
})
export class FilterByCategoryPipe implements PipeTransform {
  transform(items: any[], categoryId: string): any[] {
    if (!items || !categoryId) return items;
    return items.filter(item => item.category === categoryId);
  }
}