function PageContainer({ children, className = "" }) {
  return (
    <div className={`mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8 ${className}`}>
      {children}
    </div>
  );
}

export default PageContainer;