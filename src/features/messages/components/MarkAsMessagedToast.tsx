import toast from "react-hot-toast";

interface ShowMarkedToastOptions {
  contactNames: string[];
  onUndo: () => void;
}

export function showMarkedToast({
  contactNames,
  onUndo,
}: ShowMarkedToastOptions) {
  const message =
    contactNames.length === 1
      ? `Marked ${contactNames[0]} as messaged`
      : `Marked ${contactNames.length} contacts as messaged`;

  toast.custom(
    (t) => (
      <div
        className={`${
          t.visible ? "animate-enter" : "animate-leave"
        } max-w-sm w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
      >
        <div className="flex-1 w-0 p-4">
          <div className="flex items-start">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">{message}</p>
            </div>
          </div>
        </div>
        <div className="flex border-l border-gray-200">
          <button
            onClick={() => {
              onUndo();
              toast.dismiss(t.id);
            }}
            className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-blue-600 hover:text-blue-500 focus:outline-none"
          >
            Undo
          </button>
        </div>
      </div>
    ),
    { duration: 5000 },
  );
}
