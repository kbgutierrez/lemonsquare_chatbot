import {
  Bot,
  Sparkles,
  ShieldCheck,
} from "lucide-react"

import ModalShell from "../components/ModalShell.jsx"

const AboutHelpDeskModal = ({
  onClose,
}) => {

  const features = [
    "AI-powered support assistance",
    "Future live agent integration",
    "Conversation history tracking",
    "Ticket submission support",
  ]

  return (
    <ModalShell
      onClose={onClose}
      title="About Help Desk AI"
      subtitle="AI Support System"
      size="md"
      icon={
        <Bot
          className="
            h-5
            w-5
          "
        />
      }
    >
      <div
        className="
          px-4
          py-4

          sm:px-5
          sm:py-5
        "
      >
        <p
          className="
            text-sm
            leading-relaxed

            text-slate-600
          "
        >
          Help Desk AI is a modern support assistant designed to provide
          instant answers, streamline ticket handling, and improve support
          experiences across your platform.
        </p>

        {/* FEATURES */}
        <div
          className="
            mt-5
            space-y-3
          "
        >
          {features.map((feature) => (
            <div
              key={feature}
              className="
                flex
                items-start
                gap-3

                rounded-2xl

                border
                border-violet-100

                bg-violet-50/60

                p-3
              "
            >
              <div
                className="
                  flex
                  h-9
                  w-9
                  shrink-0
                  items-center
                  justify-center

                  rounded-xl

                  bg-white
                "
              >
                <Sparkles
                  className="
                    h-4
                    w-4

                    text-violet-600
                  "
                />
              </div>

              <p
                className="
                  break-words

                  text-sm
                  font-medium
                  leading-relaxed

                  text-slate-700
                "
              >
                {feature}
              </p>
            </div>
          ))}
        </div>

        {/* FOOTER CARD */}
        <div
          className="
            mt-5

            rounded-3xl

            border
            border-emerald-100

            bg-emerald-50

            p-4
          "
        >
          <div
            className="
              flex
              items-start
              gap-3
            "
          >
            <div
              className="
                flex
                h-10
                w-10
                shrink-0
                items-center
                justify-center

                rounded-2xl

                bg-white
              "
            >
              <ShieldCheck
                className="
                  h-5
                  w-5

                  text-emerald-600
                "
              />
            </div>

            <div
              className="
                min-w-0
              "
            >
              <p
                className="
                  text-sm
                  font-semibold

                  text-slate-900
                "
              >
                Future Ready Architecture
              </p>

              <p
                className="
                  mt-1

                  break-words

                  text-xs
                  leading-relaxed

                  text-slate-500
                "
              >
                Built for future AI integrations, live support systems,
                database connectivity, and scalable SaaS workflows.
              </p>
            </div>
          </div>
        </div>

        {/* ACTIONS */}
        <div
          className="
            mt-6

            flex
            justify-end
          "
        >
          <button
            type="button"
            onClick={onClose}
            className="
              rounded-2xl

              bg-gradient-to-r
              from-violet-600
              to-purple-600

              px-5
              py-2.5

              text-sm
              font-medium

              text-white

              shadow-lg

              transition-all
              duration-200

              hover:scale-[1.02]
            "
          >
            Got it
          </button>
        </div>
      </div>
    </ModalShell>
  )
}

export default AboutHelpDeskModal