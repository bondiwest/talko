export function Container({ className = '', children }) {
  return (
    <div
      className={[
        'mx-auto w-full max-w-[1216px] px-4 sm:px-6 lg:px-8',
        className,
      ].join(' ')}
    >
      {children}
    </div>
  )
}

