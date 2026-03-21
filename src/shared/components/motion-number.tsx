import LibMotionNumber from 'motion-number';

export function MotionNumber(props: any) {
  const Comp = LibMotionNumber as any;
  return (
    <Comp
        transition={{
          layout: { type: 'spring', duration: 1, stiffness: 150, damping: 20 },
          y: {
            type: 'spring',
            duration: 1,
            stiffness: 120,
            damping: 20,
            bounce: 0.15,
          },
        }}
        {...props}
      />
  );
}
