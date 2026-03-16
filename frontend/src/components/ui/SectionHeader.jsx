function SectionHeader({ title, subtitle, action }) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">{title}</h1>
        {subtitle && <p className="mt-2 text-sm text-gray-600 sm:text-base">{subtitle}</p>}
      </div>

      {action && <div>{action}</div>}
    </div>
  );
}

export default SectionHeader;