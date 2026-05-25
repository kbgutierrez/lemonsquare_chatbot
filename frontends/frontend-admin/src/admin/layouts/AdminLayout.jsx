const AdminLayout = ({ children }) => {
  return (
    <section
      className="
        relative
        flex
        h-[100dvh]
        min-h-[100dvh]
        w-full
        overflow-hidden
      "
      style={{
        background: "var(--background)",
      }}
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
            blur-3xl
          "
          style={{
            background: "var(--bg-glow-primary)",
          }}
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
            blur-3xl
          "
          style={{
            background: "var(--bg-glow-secondary)",
          }}
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
          min-w-0
        "
      >
        {children}
      </main>
    </section>
  )
}

export default AdminLayout