import React from "react";
import { Toast } from "./Toast";
import { useToastStore } from "@/store/toastStore";

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToastStore();

  return (
    <div className="fixed top-6 left-1/2 z-[9999] flex -translate-x-1/2 flex-col gap-3 w-[min(520px,92vw)]">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          id={toast.id}
          type={toast.type}
          message={toast.message}
          onClose={removeToast}
          duration={toast.duration}
        />
      ))}
    </div>
  );
};
