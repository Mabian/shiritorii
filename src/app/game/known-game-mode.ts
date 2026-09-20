import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { isGameMode } from './game-mode';

export const knownGameMode: CanActivateFn = (route) =>
  isGameMode(route.paramMap.get('mode') ?? '') || inject(Router).parseUrl('/');
