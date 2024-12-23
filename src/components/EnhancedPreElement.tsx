import { createRef, type ComponentChildren } from "preact";
import { signal, computed } from "@preact/signals";

const EnhancedPreElement = ({ children, ...props }: { children: ComponentChildren }) => {
  const snippetRef = createRef<HTMLPreElement>();
  const timeoutRef = createRef<ReturnType<typeof setTimeout>>();

  const hasBeenCopiedRecently = signal(false);

  const buttonText = computed(() => {
    return hasBeenCopiedRecently.value ? "Copied!" : "Copy";
  });

  const copyToClipboard = async () => {
    let snippet = snippetRef.current;
    let snippetText = snippet?.innerText ?? "";
    await navigator.clipboard.writeText(snippetText);

    hasBeenCopiedRecently.value = true;

    timeoutRef.current = setTimeout(() => {
      timeoutRef.current = null;
      hasBeenCopiedRecently.value = false;
    }, 1000);
  };

  return (
    <div className="relative group">
      <pre {...props} ref={snippetRef}>
        {children}
      </pre>
      <button
        className="text-sm text-gray-300 bg-gray-700 rounded absolute top-4 right-4 px-2 invisible group-hover:visible"
        onClick={() => {
          if (timeoutRef.current) {
            return false;
          } else {
            copyToClipboard();
          }
        }}
      >
        {buttonText}
      </button>
    </div>
  );
};

export default EnhancedPreElement;
