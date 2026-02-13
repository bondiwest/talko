export function Container({ className = '', children }) {
  return (
    <div
      className={[
        // Content width: 1280px on desktop; fluid with paddings on tablet/mobile.
        'mx-auto w-full max-w-[1280px] px-4 sm:px-6 lg:px-8',
        className,
      ].join(' ')}
    >
      {children}
    </div>
  )
}
