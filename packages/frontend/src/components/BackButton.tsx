import type { ComponentProps } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { ArrowLeft } from './icons';
import { Button } from './ui/button';
import { cn } from '../lib/utils';

interface BackButtonProps extends ComponentProps<typeof Button> {
  to?: string;
  label?: string;
}

export function BackButton({ to = '/', label, className, ...buttonProps }: BackButtonProps) {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <Button
      variant="ghost"
      size="sm"
      className={cn('mb-4', className)}
      {...buttonProps}
      onClick={() => navigate(to)}
    >
      <ArrowLeft className="mr-2 h-4 w-4" />
      {label || t('back')}
    </Button>
  );
}
