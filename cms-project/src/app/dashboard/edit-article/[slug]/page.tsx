import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import styles from "./EditArticlePage.module.scss";
import EditArticleForm from "./EditArticleForm";

interface EditArticlePageProps {
    params: Promise<{ slug: string }>;
}

export default async function EditArticlePage({ params }: EditArticlePageProps) {
    const session = await getServerSession(authOptions);
    if (!session) {
        redirect("/login");
    }

    const article = await prisma.article.findUnique({
        where: { slug: (await params).slug },
        include: { categories: true, author: true },
    });

    if (!article) {
        notFound();
    }

    if (article.authorId !== session.user?.id) {
        return (
            <div className={styles.editContainer}>
                <p>Nemáte oprávnění upravit tento článek.</p>
                <Link href="/dashboard/my-articles">
                    <button className={styles.backButton}>Zpět</button>
                </Link>
            </div>
        );
    }

    const allCategories = await prisma.category.findMany();

    return (
        <div className={styles.editContainer}>
            <Link href="/dashboard/my-articles">
                <button className={styles.backButton}>← Zpět</button>
            </Link>
            <h1 className={styles.editTitle}>Upravit článek</h1>
            <EditArticleForm initialArticle={article} allCategories={allCategories} />
        </div>
    );
}