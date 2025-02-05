const ProgressBar = (props: { completed: number }) => {
  const { completed } = props;
  const normalizedCompleted = completed > 100 ? 100 : completed;

  return (
    <div className="relative h-10 w-[320px] rounded-[50px] my-[50px] mx-auto border-2 border-[var(--secondary)]">
      <div 
        className="h-full rounded-[inherit] bg-[var(--secondary)] text-center"
        style={{ width: `${normalizedCompleted}%` }}
      >
        <span className="p-[5px] text-white font-bold" />
        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 font-bold text-sm">
          {`${normalizedCompleted}%`}
        </span>
      </div>
    </div>
  );
};

export default ProgressBar;
