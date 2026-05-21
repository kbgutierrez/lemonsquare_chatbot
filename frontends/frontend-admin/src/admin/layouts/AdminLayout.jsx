const AdminLayout = ({ children }) => {
  return (
    <section
      className="
        relative
        flex
        h-[100dvh]
        min-h-[100dvh]
        overflow-hidden
        bg-[#0b1311]
      "
    >
      {/* BACKGROUND EFFECTS */}
      <div
        className="
          pointer-events-none
          absolute
          inset-0
          overflow-hidden
        "
      >
        {/* TOP LIGHT GLOW */}
        <div
          className="
            absolute
            left-[-120px]
            top-[-120px]
            h-[420px]
            w-[420px]
            rounded-full
            bg-[#f5d547]/[0.04]
            blur-3xl
          "
        />

        {/* BOTTOM LIGHT GLOW */}
        <div
          className="
            absolute
            bottom-[-180px]
            right-[-140px]
            h-[420px]
            w-[420px]
            rounded-full
            bg-[#95c11f]/[0.05]
            blur-3xl
          "
        />
      </div>

      {/* MAIN CONTENT WRAPPER */}
      <main
        className="
          relative
          z-10
          flex
          h-full
          w-full
        "
      >
        {children}
      </main>
    </section>
  )
}

export default AdminLayout