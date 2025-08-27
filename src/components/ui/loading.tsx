export const Loading = ({ text }: { text: string }) => {
  const loadingContainer = `absolute top-1/2 left-1/2 -translate-1/2 flex flex-col w-full h-screen flex-1 items-center justify-center text-muted-foreground`;
  const loadingSpinner = `animate-spin rounded-full h-10 w-10 border-b-2 border-primary`;
  const loadingText = `font-bold font-lg mt-4`;

  return (
    <div className={loadingContainer}>
      <div className={loadingSpinner}></div>
      <span className={loadingText}>{text}</span>
    </div>
  );
};
