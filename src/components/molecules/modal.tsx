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
import { cn } from "@/libs/shadcn-utils";

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
  maxHeight?: React.CSSProperties['maxHeight'];
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
  maxHeight = "70vh",
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
          "flex flex-col justify-between py-5 px-2",
          className,
        )}
        onPointerDownOutside={onClose}
        onEscapeKeyDown={onClose}
      >
        <div
          className="flex flex-col gap-5"
        >
          <DialogHeader className="px-3">
            <DialogTitle>{title}</DialogTitle>
            {description && (
              <DialogDescription>{description}</DialogDescription>
            )}
          </DialogHeader>
          <ScrollArea>
            <div style={{ maxHeight }}>
              {children}
            </div>
          </ScrollArea>
        </div>
        {(cancelText || confirmText) && (
          <DialogFooter className="flex gap-2 px-3">
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
