export class ListResponseDto<T> {
  total: number;
  items: T[];

  constructor(items: T[]) {
    this.total = items.length;
    this.items = items;
  }
}
