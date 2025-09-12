// src/components/molecules/modal.tsx
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/atoms/dialog";
import { Button } from "@/components/atoms/button";
import { ScrollArea } from "@/components/atoms/scroll-area";
import { cn } from "@/lib/utils";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  onConfirm?: () => void;
  confirmText?: string;
  cancelText?: string;
  className?: string;
  confirmVariant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  maxHeight?: string;
  scrollable?: boolean;
}

const sizeClasses = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
};

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = "md",
  onConfirm,
  confirmText = null,
  cancelText = null,
  className = "",
  confirmVariant = "default",
  maxHeight = "80vh",
  scrollable = true,
}) => {
  const handleConfirm = () => {
    onConfirm?.();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className={cn(
          sizeClasses[size],
          "grid grid-rows-[auto_1fr_auto] p-0",
          className,
        )}
        onPointerDownOutside={onClose}
        onEscapeKeyDown={onClose}
        style={{
          maxHeight: scrollable ? maxHeight : undefined,
          height: scrollable ? maxHeight : "auto",
        }}
      >
        <DialogHeader className="flex-shrink-0 px-6 pt-6 pb-4">
          <DialogTitle className="flex items-center justify-between">
            {title}
          </DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        {scrollable ? (
          <ScrollArea className="px-6">
            <div className="space-y-4 pb-4">{children}</div>
          </ScrollArea>
        ) : (
          <div className="px-6 py-2">{children}</div>
        )}

        {(cancelText || confirmText) && (
          <DialogFooter className="flex-shrink-0 gap-2 px-6 pb-4">
            <Button variant="outline" onClick={onClose}>
              {cancelText}
            </Button>
            {onConfirm && (
              <Button variant={confirmVariant} onClick={handleConfirm}>
                {confirmText}
              </Button>
            )}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default Modal;
