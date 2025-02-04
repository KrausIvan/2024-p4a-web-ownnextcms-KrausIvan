import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import styles from "./ArticleDetail.module.scss";
import { Metadata } from "next";

interface ArticleDetailProps {
    params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ArticleDetailProps): Promise<Metadata> {
    const article = await prisma.article.findUnique({
        where: { slug: (await params).slug },
        include: {
            categories: true,
            author: true,
        },
    });

    if (!article) {
        return {
            title: "Článek nenalezen | Moje Publikační Platforma",
            description: "Bohužel tento článek neexistuje.",
        };
    }

    return {
        title: `${article.title} | Moje Publikační Platforma`,
        description: article.content.slice(0, 150),
        openGraph: {
            title: article.title,
            description: article.content.slice(0, 150),
            type: "article",
            url: `/articles/${article.slug}`,
        },
    };
}

export default async function ArticleDetail({ params }: ArticleDetailProps) {
    const article = await prisma.article.findUnique({
        where: { slug: (await params).slug },
        include: {
            categories: true,
            author: true,
        },
    });

    if (!article) {
        notFound();
    }

    return (
        <div className={styles.detailContainer}>
            <Link href="/articles">
                <button className={styles.backButton}>Zpět</button>
            </Link>
            <h1 className={styles.detailTitle}>{article.title}</h1>
            <div className={styles.metaInfo}>
                <span className={styles.author}>Autor: {article.author.name}</span>
                <span className={styles.date}>
                    Datum: {new Date(article.createdAt).toLocaleDateString("cs-CZ")}
                </span>
            </div>
            <div className={styles.detailContent}>{article.content}</div>
            <div className={styles.categoriesSection}>
                <h3>Kategorie:</h3>
                <ul>
                    {article.categories.map((category) => (
                        <li key={category.id} className={styles.categoryItem}>
                            {category.name}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}