"use client";
import { useEffect } from "react";

export default function ClarityScript() {
    useEffect(() => {
        if (typeof window !== "undefined") {
            (function (c: any, l: Document, a: string, r: string, i: string) {
                c[a] =
                    c[a] ||
                    function () {
                        (c[a].q = c[a].q || []).push(arguments);
                    };

                const t: HTMLScriptElement = l.createElement(r) as HTMLScriptElement;
                t.async = true;
                t.src = "https://www.clarity.ms/tag/" + i;

                const y: HTMLScriptElement | null = l.getElementsByTagName(r)[0] as HTMLScriptElement | null;
                if (y?.parentNode) {
                    y.parentNode.insertBefore(t, y);
                }
            })(window, document, "clarity", "script", "q4payypp2z");
        }
    }, []);

    return null;
}