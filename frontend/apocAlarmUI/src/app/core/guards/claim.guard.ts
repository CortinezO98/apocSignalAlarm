import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { ClaimStore } from '../state/claim.store';

export const canEnterDocs: CanActivateFn = () => {
  const router = inject(Router);
  const store = inject(ClaimStore);
  const id = store.claimId(); // signal o getter
  if (!id) { router.navigate(['/']); return false; }
  return true;
};