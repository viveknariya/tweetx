import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'dateDiff',
  standalone: true,
})
export class DateDiffPipe implements PipeTransform {
  transform(value: Date | string | number): string {
    const currentTime = new Date();
    const targetTime = new Date(value);

    const diffInMs = currentTime.getTime() - targetTime.getTime();

    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    const diffInHours = Math.floor(
      (diffInMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );
    const diffInMinutes = Math.floor(
      (diffInMs % (1000 * 60 * 60)) / (1000 * 60)
    );
    if (diffInDays != 0) {
      return `${diffInDays} days, ${diffInHours} hours, ${diffInMinutes} minutes ago`;
    }
    if (diffInHours != 0) {
      return `${diffInHours} hours, ${diffInMinutes} minutes ago`;
    }
    return `${diffInMinutes} minutes ago`;
  }
}
