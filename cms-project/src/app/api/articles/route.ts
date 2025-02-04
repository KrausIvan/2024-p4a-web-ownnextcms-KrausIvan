import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import slugify from "slugify";

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: "Unauthorized (not logged in)." }, { status: 401 });
    }

    const jsonData = await req.json();
    const { title, content, categoryIds } = jsonData;

    if (!title || !content) {
        return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    const authorId = session.user?.id;
    if (!authorId) {
        return NextResponse.json({ error: "No authorId in session." }, { status: 400 });
    }

    const slug = slugify(title, { lower: true, strict: true });

    const article = await prisma.article.create({
        data: {
            title,
            content,
            slug,
            authorId,
            categories: {
                connect: categoryIds?.map((id: string) => ({ id })),
            },
        },
    });

    return NextResponse.json(article);
}

export async function GET() {
    const articles = await prisma.article.findMany({
        include: { categories: true, author: true },
    });
    return NextResponse.json(articles);
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json(
            { error: "Unauthorized (not logged in)." },
            { status: 401 }
        );
    }

    const { id } = await params;
    if (!id) {
        return NextResponse.json(
            { error: "Article id is required." },
            { status: 400 }
        );
    }

    const article = await prisma.article.findUnique({
        where: { id },
    });

    if (!article) {
        return NextResponse.json(
            { error: "Article not found." },
            { status: 404 }
        );
    }

    if (article.authorId !== session.user?.id) {
        return NextResponse.json(
            { error: "You are not authorized to delete this article." },
            { status: 403 }
        );
    }

    await prisma.article.delete({
        where: { id },
    });

    return NextResponse.json({ message: "Article deleted successfully." });
}

export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json(
            { error: "Unauthorized (not logged in)." },
            { status: 401 }
        );
    }

    const { id } = await params;
    const formData = await req.formData();
    const title = formData.get("title")?.toString();
    const content = formData.get("content")?.toString();
    const categoryIds = formData.getAll("categoryIds") as string[];

    if (!title || !content) {
        return NextResponse.json(
            { error: "Missing required fields." },
            { status: 400 }
        );
    }

    const article = await prisma.article.findUnique({
        where: { id },
    });

    if (!article) {
        return NextResponse.json(
            { error: "Article not found." },
            { status: 404 }
        );
    }

    if (article.authorId !== session.user?.id) {
        return NextResponse.json(
            { error: "You are not authorized to update this article." },
            { status: 403 }
        );
    }

    const newSlug = slugify(title, { lower: true, strict: true });

    const updatedArticle = await prisma.article.update({
        where: { id },
        data: {
            title,
            content,
            slug: newSlug,
            categories: {
                set: categoryIds.map((catId: string) => ({ id: catId })),
            },
        },
    });

    return NextResponse.json(updatedArticle);
}