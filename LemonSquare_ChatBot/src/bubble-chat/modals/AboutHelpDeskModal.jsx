const AboutHelpDeskModal = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">About Help Desk AI</h3>
          <button type="button" onClick={onClose} className="text-slate-500 hover:text-slate-900">Close</button>
        </div>
        <div className="mt-4 space-y-3 text-sm text-slate-600">
          <p>This modal describes the help desk AI experience and how it supports your team.</p>
          <p>It is a placeholder for the future chatbot information page.</p>
        </div>
      </div>
    </div>
  )
}

export default AboutHelpDeskModal
