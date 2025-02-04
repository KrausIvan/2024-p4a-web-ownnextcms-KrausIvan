"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";

import "bootstrap/dist/css/bootstrap.min.css";
import { Container, Row, Col, Card, Form, Button, Alert } from "react-bootstrap";

export default function RegisterPage() {
    const [error, setError] = useState<string | null>(null);

    const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const username = formData.get("username") as string;
        const email = formData.get("email") as string;
        const password = formData.get("password") as string;

        const response = await fetch("/api/register", {
            method: "POST",
            body: JSON.stringify({ name: username, email, password }),
            headers: { "Content-Type": "application/json" },
        });

        if (!response.ok) {
            setError("Registration failed");
        } else {
            setError(null);
            window.location.href = "/login";
        }
    };

    return (
        <Container style={{ maxWidth: "400px", marginTop: "50px" }}>
            <Row>
                <Col>
                    <h1 className="text-center mb-4">Register</h1>

                    {error && (
                        <Alert variant="danger" className="text-center">
                            {error}
                        </Alert>
                    )}

                    <Card className="shadow-sm">
                        <Card.Body>
                            <Form onSubmit={handleRegister}>
                                <Form.Group controlId="username" className="mb-3">
                                    <Form.Label>Username</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="username"
                                        placeholder="Username"
                                        required
                                    />
                                </Form.Group>
                                <Form.Group controlId="email" className="mb-3">
                                    <Form.Label>Email</Form.Label>
                                    <Form.Control
                                        type="email"
                                        name="email"
                                        placeholder="Email"
                                        required
                                    />
                                </Form.Group>
                                <Form.Group controlId="password" className="mb-3">
                                    <Form.Label>Password</Form.Label>
                                    <Form.Control
                                        type="password"
                                        name="password"
                                        placeholder="Password"
                                        required
                                    />
                                </Form.Group>
                                <Button type="submit" variant="primary" className="w-100">
                                    Register
                                </Button>
                            </Form>
                        </Card.Body>
                    </Card>

                    <div className="mt-3 text-center">
                        <hr />
                        <Button
                            variant="dark"
                            className="w-100"
                            onClick={() =>
                                signIn("github", { callbackUrl: "/login?isNewUser=true" })
                            }
                        >
                            Register with GitHub
                        </Button>
                    </div>
                </Col>
            </Row>
        </Container>
    );
}