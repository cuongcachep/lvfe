export default function dinhDangSo(x?: number): string {
  if (x === undefined || Number.isNaN(x)) {
    return '0';
  }
  return x.toLocaleString('en-US'); 
}