import React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';

interface DialogProps extends React.HTMLAttributes<HTMLDivElement> {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children?: React.ReactNode;
}

export function Dialog({ children, open, onOpenChange }: DialogProps) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
        <DialogPrimitive.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          {children}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

export function DialogContent({ className, ...props }: DialogProps) {
  return (
    <div
      className={`w-[90vw] max-w-md rounded-lg border border-gray-800 bg-gray-900 p-6 shadow-lg ${className}`}
      {...props}
    />
  );
}

export function DialogHeader({ className, ...props }: DialogProps) {
  return <div className={`flex flex-col space-y-1.5 ${className}`} {...props} />;
}

export function DialogTitle({ className, ...props }: DialogProps) {
  return (
    <h3
      className={`text-2xl font-semibold leading-none tracking-tight text-gray-100 ${className}`}
      {...props}
    />
  );
}

export function DialogDescription({ className, ...props }: DialogProps) {
  return <div className={`text-gray-400 ${className}`} {...props} />;
}

export function DialogFooter({ className, ...props }: DialogProps) {
  return (
    <div
      className={`mt-6 flex justify-end space-x-2 ${className}`}
      {...props}
    />
  );
} 