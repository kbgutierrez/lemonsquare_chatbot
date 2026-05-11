/**
 * HeaderCard Component
 * Single compact header for admin dashboard
 * Lavender enterprise theme
 */

const HeaderCard = () => {
  return (
    <header className="w-full bg-gradient-to-r from-purple-600 to-purple-500 px-4 sm:px-6 lg:px-8 py-3 sm:py-4 border-b-2 border-purple-400">
      <div className="mx-auto max-w-full">
        <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
          LemonSquare Admin Dashboard
        </h1>
        <p className="text-sm text-purple-100 font-medium mt-0.5">
          Knowledge Management System
        </p>
      </div>
    </header>
  )
}

export default HeaderCard
