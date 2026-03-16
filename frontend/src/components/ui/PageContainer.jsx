function PageContainer({ children, className = "" }) {
  return (
    <div className={`max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 ${className}`}>
      {children}
    </div>
  );
}

export default PageContainer;