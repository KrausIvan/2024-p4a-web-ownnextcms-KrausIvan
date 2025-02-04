"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./DeleteArticleButton.module.scss";

interface DeleteArticleButtonProps {
    slug: string;
}

export default function DeleteArticleButton({ slug }: DeleteArticleButtonProps) {
    const router = useRouter();
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        if (!confirm("Opravdu chcete smazat tento článek?")) return;
        setIsDeleting(true);
        const res = await fetch(`/api/articles/${slug}`, { method: "DELETE" });
        if (res.ok) {
            router.refresh();
        } else {
            alert("Chyba při mazání článku.");
        }
        setIsDeleting(false);
    };

    return (
        <button onClick={handleDelete} disabled={isDeleting} className={styles.deleteButton}>
            {isDeleting ? "Maže se..." : "Smazat"}
        </button>
    );
}