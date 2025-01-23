export function setupDNS(): void {
  if (typeof Bun !== 'undefined') {
    Bun.dns?.prefetch('bun.sh')
  }
}
