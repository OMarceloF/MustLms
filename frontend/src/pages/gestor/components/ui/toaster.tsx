import { useToast } from '../../hooks/use-toast';
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from './toast';

export function Toaster() {
  const { toasts } = useToast();

  return (
    <ToastProvider>
      {toasts.map(({ id, title, description, action, ...props }) => (
        <Toast
          key={id}
          {...props}
          className="bg-white border border-indigo-100 shadow-lg rounded-lg px-4 py-3 ring-1 ring-indigo-200 transition-all duration-300"
        >
          <div className="grid gap-1">
            {title && (
              <ToastTitle className="text-indigo-700 font-semibold text-sm">
                {title}
              </ToastTitle>
            )}
            {description && (
              <ToastDescription className="text-gray-600 text-sm">
                {description}
              </ToastDescription>
            )}
          </div>
          {action}
          <ToastClose className="ml-2 text-gray-400 hover:text-gray-700 transition-colors" />
        </Toast>
      ))}
      <ToastViewport className="fixed bottom-4 right-4 space-y-2 z-50" />
    </ToastProvider>
  );
}
