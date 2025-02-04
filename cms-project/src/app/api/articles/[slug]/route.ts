import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ slug: string }> }
) {
    const { slug } = await params;
    if (!slug) {
        return NextResponse.json({ error: "Slug is required." }, { status: 400 });
    }

    const article = await prisma.article.findUnique({
        where: { slug },
        include: { categories: true, author: true },
    });

    if (!article) {
        return NextResponse.json({ error: "Article not found." }, { status: 404 });
    }
    return NextResponse.json(article);
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    console.log("🔹 Awaiting params...");
    const { slug } = await params;

    console.log("🔹 DELETE request received for slug:", slug);

    const session = await getServerSession(authOptions);
    if (!session) {
        console.log("❌ Unauthorized (not logged in)");
        return NextResponse.json({ error: "Unauthorized (not logged in)." }, { status: 401 });
    }

    if (!slug) {
        console.log("❌ Missing slug in request");
        return NextResponse.json({ error: "Slug is required." }, { status: 400 });
    }

    console.log("🔹 Checking if article exists in DB...");
    const article = await prisma.article.findUnique({
        where: { slug },
        include: { categories: true },
    });

    if (!article) {
        console.log("❌ Article not found in DB");
        return NextResponse.json({ error: "Article not found." }, { status: 404 });
    }

    if (article.authorId !== session.user?.id) {
        console.log("❌ User is not authorized to delete this article");
        return NextResponse.json(
            { error: "You are not authorized to delete this article." },
            { status: 403 }
        );
    }

    console.log("🔹 Removing category references before deletion...");
    await prisma.article.update({
        where: { slug },
        data: { categories: { set: [] } },
    });

    console.log("🔹 Deleting article from DB...");
    await prisma.article.delete({ where: { slug } });

    console.log("✅ Article deleted successfully!");
    return NextResponse.json({ message: "Article deleted successfully." });
}

export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ slug?: string }> }
) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: "Unauthorized (not logged in)." }, { status: 401 });
    }

    const contentType = req.headers.get("content-type") || "";
    if (
        !contentType.includes("multipart/form-data") &&
        !contentType.includes("application/x-www-form-urlencoded")
    ) {
        return NextResponse.json({ error: "Unsupported content type." }, { status: 415 });
    }

    const formData = await req.formData();

    const title = formData.get("title")?.toString();
    const content = formData.get("content")?.toString();
    const categoryIds = formData.getAll("categoryIds") as string[];

    if (!title || !content) {
        return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    const { slug } = await params;
    if (!slug) {
        return NextResponse.json({ error: "Slug is required." }, { status: 400 });
    }

    const article = await prisma.article.findUnique({ where: { slug } });
    if (!article) {
        return NextResponse.json({ error: "Article not found." }, { status: 404 });
    }
    if (article.authorId !== session.user?.id) {
        return NextResponse.json(
            { error: "You are not authorized to update this article." },
            { status: 403 }
        );
    }

    await prisma.article.update({
        where: { slug },
        data: {
            title,
            content,
            categories: {
                set: categoryIds.map((catId) => ({ id: catId })),
            },
        },
    });

    return NextResponse.json({ message: "Article updated successfully." });
}