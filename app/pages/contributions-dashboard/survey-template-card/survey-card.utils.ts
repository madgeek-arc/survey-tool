import { Model } from '../../../../catalogue-ui/domain/dynamic-form-model';

export function getStatusBadge(model: Model): 'draft' | 'active' | 'closed' {
  if (!model.locked) return 'draft';
  return model.active ? 'active' : 'closed';
}

export function getDaysLeft(model: Model): number | null {
  const close = model.submissionCloseAt;
  if (!close) return null;
  const diff = new Date(close).getTime() - Date.now();
  return Math.ceil(diff / 86400000);
}

export function getResponsePercent(
  counts: { responded: number; total: number } | null | undefined
): number {
  if (!counts || counts.total === 0) return 0;
  return Math.round((counts.responded / counts.total) * 100);
}
