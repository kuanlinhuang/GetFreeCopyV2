interface LoadingOverlayProps {
  isVisible: boolean;
}

export function LoadingOverlay({ isVisible }: LoadingOverlayProps) {
  if (!isVisible) return null;

  return (
    <div 
      className="fixed top-4 right-4 bg-white rounded-lg shadow-lg p-4 z-50 border"
      data-testid="loading-overlay"
    >
      <div className="flex items-center space-x-3">
        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-500"></div>
        <span className="text-sm text-gray-700">Searching...</span>
      </div>
    </div>
  );
}
