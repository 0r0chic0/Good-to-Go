"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormMessage,
} from "@/components/ui/form"

const loginSchema = z.object({
    email: z.string().email("Enter a valid email"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().optional(), // only for register
}).refine(
    (data) => !data.confirmPassword || data.password === data.confirmPassword,
    {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    }
)

export function LoginForm() {
    const [isRegistering, setIsRegistering] = useState(false)
    const router = useRouter()

    const form = useForm<z.infer<typeof loginSchema>>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: "",
            password: "",
            confirmPassword: "",
        },
    })

    async function onSubmit(data: z.infer<typeof loginSchema>) {
        const endpoint = isRegistering
            ? "http://localhost:5001/api/signup"
            : "http://localhost:5001/api/login"

        const payload = {
            email: data.email,
            password: data.password,
        }

        try {
            const response = await fetch(endpoint, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            })

            const result = await response.json()

            if (!response.ok || result.success === false) {
                alert(result.message || "Something went wrong")
                return
            }

            if (isRegistering) {
                alert("Registration successful! Please log in.")
                setIsRegistering(false)
            } else {
                alert("Login successful!")
                router.push("/home")
            }
        } catch (err) {
            console.error("Error:", err)
            alert("Network error. Try again later.")
        }
    }

    return (
        <div className="w-full max-w-md space-y-6">
            <h2 className="text-2xl font-semibold text-center">
                {isRegistering ? "Create an Account" : "Login to your Account"}
            </h2>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormControl>
                                    <Input type="email" placeholder="Email" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                            <FormItem>
                                <FormControl>
                                    <Input type="password" placeholder="Password" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {isRegistering && (
                        <FormField
                            control={form.control}
                            name="confirmPassword"
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <Input
                                            type="password"
                                            placeholder="Confirm Password"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    )}

                    <Button type="submit" className="w-full">
                        {isRegistering ? "Register" : "Login"}
                    </Button>
                </form>
            </Form>

            <div className="text-center text-sm text-muted-foreground">
                {isRegistering ? "Already have an account?" : "Don’t have an account?"}{" "}
                <button
                    onClick={() => setIsRegistering(!isRegistering)}
                    className="text-blue-600 hover:underline ml-1"
                >
                    {isRegistering ? "Login" : "Register"}
                </button>
            </div>
        </div>
    )
}
