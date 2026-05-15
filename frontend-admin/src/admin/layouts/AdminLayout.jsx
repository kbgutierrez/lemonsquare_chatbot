const AdminLayout = ({
  children,
}) => {

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
      {/* BACKGROUND */}
      <div
        className="
          pointer-events-none

          absolute
          inset-0

          overflow-hidden
        "
      >
        {/* TOP LIGHT */}
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

        {/* BOTTOM LIGHT */}
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

      {/* CONTENT */}
      <div
        className="
          relative
          z-10

          flex
          h-full
          w-full
        "
      >
        {children}
      </div>
    </section>
  )
}

export default AdminLayout