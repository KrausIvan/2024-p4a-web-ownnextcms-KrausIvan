import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

import LogoutButton from "../components/LogoutButton";
import styles from "./Dashboard.module.scss";

export default async function Dashboard() {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect("/login");
    }

    return (
        <div className={styles.dashboardContainer}>
            <div className={styles.dashboardHeader}>
                <h1>Vítejte, {session.user?.name || "Uživatel"}!</h1>
                <h2>Správa obsahu</h2>
            </div>

            <div className={styles.dashboardCard}>
                <ul className={styles.navList}>
                    <li>
                        <Link href="/articles">📄 Všechny články</Link>
                    </li>
                    <li>
                        <Link href="/dashboard/my-articles">📄 Moje články</Link>
                    </li>
                    <li>
                        <Link href="/dashboard/create-article">✏️ Vytvořit nový článek</Link>
                    </li>
                    <li>
                        <Link href="/dashboard/categories">🗂️ Správa kategorií</Link>
                    </li>
                </ul>
            </div>

            <div className={styles.logoutWrapper}>
                <LogoutButton />
            </div>
        </div>
    );
}