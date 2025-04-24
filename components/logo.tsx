export function Logo() {
  return (
    <div className="flex flex-col items-center">
      <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="40"
          height="40"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-primary"
        >
          <path d="M16 22a2 2 0 0 1-2-2" />
          <path d="M10 22a2 2 0 0 1-2-2" />
          <path d="M12 9V2l-3.5 2L12 2l3.5 2z" />
          <path d="M8 10a5 5 0 0 0 8 0" />
          <path d="M18 9.5a4 4 0 0 0-4.7-3.9" />
          <path d="M6 9.5a4 4 0 0 1 4.7-3.9" />
          <path d="M14 22l1-10" />
          <path d="M10 22l-1-10" />
        </svg>
      </div>
      <h1 className="text-3xl font-bold text-primary mt-2">Kanah</h1>
    </div>
  )
}
