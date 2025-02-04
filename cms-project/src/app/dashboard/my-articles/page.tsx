import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import styles from "./MyArticlesPage.module.scss";
import DeleteArticleButton from "@/app/components/DeleteArticleButton";

export default async function MyArticlesPage() {
    const session = await getServerSession(authOptions);
    if (!session) {
        redirect("/login");
    }

    const articles = await prisma.article.findMany({
        where: { authorId: session.user?.id },
        include: { categories: true },
    });

    return (
        <div className={styles.myArticlesContainer}>
            <div className={styles.topBar}>
                <Link href="/dashboard" className={styles.backButton}>
                    ← Zpět na Dashboard
                </Link>
            </div>

            <h1 className={styles.pageTitle}>Moje články</h1>

            <ul className={styles.articlesList}>
                {articles.map((article) => (
                    <li key={article.slug} className={styles.articleCard}>
                        <h2 className={styles.articleTitle}>{article.title}</h2>
                        <p className={styles.articleExcerpt}>
                            {article.content.length > 100
                                ? article.content.slice(0, 100) + "..."
                                : article.content}
                        </p>
                        <p className={styles.articleCategories}>
                            Kategorie:{" "}
                            {article.categories.map((cat) => cat.name).join(", ") || "Žádné"}
                        </p>
                        <div className={styles.buttonGroup}>
                            <Link
                                href={`/dashboard/edit-article/${article.slug}`}
                                className={styles.editButton}
                            >
                                Upravit
                            </Link>
                            <DeleteArticleButton slug={article.slug}/>
                        </div>
                    </li>
                ))}
            </ul>

        </div>
    );
}