"use client"

import React from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

const About: React.FC = () => {
    return (
        <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold">ERP 2.0</CardTitle>
                    <CardDescription>A timetable planning app for students for new academic semester.</CardDescription>
                </CardHeader>
                <CardContent>
                    <h2 className="text-xl font-semibold">Members:</h2>
                    <ul className="list-disc pl-5">
                        <li>Sudhanshu Kulkarni (2023A7PS0414G)</li>
                        <li>Nilesh Bhatia (2023A7PS0418G)</li>
                        <li>Neel Naik (2023A7PS0429G)</li>
                        <li>Priyanshu Singawat (2023A7PS0417G)</li>
                        <li>Vimarsh Shah (2022B5A71060G)</li>
                    </ul>
                    <div className="mt-4">
                        <Link href="/" className="text-primary underline-offset-4 hover:underline">
                            Back to Home
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

export default About
