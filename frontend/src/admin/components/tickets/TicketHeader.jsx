const TicketHeader = ({
  count,
}) => {

  return (
    <div>
      <p
        className="
          text-xs
          font-semibold
          uppercase
          tracking-[0.2em]
          text-violet-500
        "
      >
        AI Tickets
      </p>

      <h2
        className="
          mt-1
          text-2xl
          font-bold
          text-violet-900
        "
      >
        Knowledge Tickets
      </h2>

      <p
        className="
          mt-1
          text-sm
          text-violet-500
        "
      >
        {count} tickets loaded
      </p>
    </div>
  )
}

export default TicketHeader