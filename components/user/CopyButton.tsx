"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";

export default function CopyButton({ text }: { text: string }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <button
            onClick={handleCopy}
            className="text-gray-400 hover:text-indigo-600 p-2 rounded-md hover:bg-gray-100 transition-colors"
            title="Copy Code"
        >
            {copied ? <Check size={18} className="text-green-600" /> : <Copy size={18} />}
        </button>
    );
}
