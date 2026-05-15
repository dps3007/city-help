function Skeleton({ className = "", count = 1 }) {
  const skeletons = Array.from({ length: count });

  return (
    <>
      {skeletons.map((_, idx) => (
        <div
          key={idx}
          className={`animate-pulse bg-muted rounded-lg ${className}`}
        />
      ))}
    </>
  );
}

export default Skeleton;
