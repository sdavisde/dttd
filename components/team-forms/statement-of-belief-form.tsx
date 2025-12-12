'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import { Typography } from '@/components/ui/typography'
import { Separator } from '@/components/ui/separator'

const statementOfBeliefSchema = z.object({
    signature: z.string().min(2, 'Signature must be at least 2 characters'),
})

type StatementOfBeliefFormValues = z.infer<typeof statementOfBeliefSchema>

interface StatementOfBeliefFormProps {
    userName: string
    weekendTitle: string
}

export function StatementOfBeliefForm({ userName, weekendTitle }: StatementOfBeliefFormProps) {
    const router = useRouter()
    const [isSubmitting, setIsSubmitting] = useState(false)

    const form = useForm<StatementOfBeliefFormValues>({
        resolver: zodResolver(statementOfBeliefSchema),
        defaultValues: {
            signature: '',
        },
    })

    const onSubmit = async (data: StatementOfBeliefFormValues) => {
        setIsSubmitting(true)
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 500))

        // In a real implementation we would save to database here
        console.log('Statement of Belief signed:', data)

        // Navigation to next step
        router.push('/team-forms/commitment-form')
        setIsSubmitting(false)
    }

    return (
        <div className="container max-w-3xl mx-auto py-8 px-4">
            <Card>
                <CardHeader>
                    <CardTitle>
                        <Typography variant="h2">Statement of Belief</Typography>
                    </CardTitle>
                    <CardDescription>
                        <Typography variant="muted">
                            Please read and sign the Statement of Belief below.
                        </Typography>
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="bg-muted/30 p-6 rounded-lg border">
                        <Typography variant="p" className="mb-4">
                            <strong>We believe and profess</strong> our faith in one Triune God – The Father, The Son and The Holy Spirit (Matthew 28:19)
                        </Typography>
                        <Typography variant="p" className="mb-4">
                            <strong>We believe and profess</strong> that Jesus Christ is the only Savior and is God in the flesh (John 1:1, 1:14, 3:36, 14: and Hebrew 2:17)
                        </Typography>
                        <Typography variant="p" className="mb-4">
                            <strong>We believe and profess</strong> that The Holy Spirit is God and is The Lord and Giver of life, who continues to work in believers today to sanctify, edify and empower the whole Christian church on earth - - - for His purpose (Job 33:4, Acts 1:8, John 14:26 and Romans 8:11)
                        </Typography>
                        <Typography variant="p" className="mb-4">
                            <strong>We believe and profess</strong> that the Holy Scriptures are the inspired and completely true Word of God (2 Timothy 3:16-17)
                        </Typography>
                        <Typography variant="p" className="mb-4">
                            <strong>We believe and profess</strong> that all have sinned and fallen short of the glory of God; that forgiveness of sins is received through confession and repentance - - and that our sins are washed away through the blood of Jesus Christ (Acts 2:38, 1 John 1:9 and Romans 3:23)
                        </Typography>
                        <Typography variant="p" className="mb-4">
                            <strong>We believe and profess</strong> that salvation is a gift of God’s grace received through personal faith in Jesus Christ (Ephesians 2:8)
                        </Typography>
                        <Typography variant="p" className="mb-4">
                            <strong>We believe and profess</strong> that the Body of Christ is to make every effort to keep the unity of the Spirit through the bond of peace until we all reach unity in the faith and in the knowledge of The Son of God (Ephesians 4:3, 13)
                        </Typography>
                        <Typography variant="p" className="mb-4">
                            <strong>We believe and profess</strong> that God’s unconditional love, as made manifest to us through Jesus Christ, is the primary witness by which people are renewed, edified and changed (1 Corinthians 1:8)
                        </Typography>
                        <Typography variant="p" className="mb-4">
                            <strong>We believe and profess</strong> that God has called us to live holy lives that will bring glory to His name (Colossians 3:1-25)
                        </Typography>
                    </div>

                    <div className="p-4 border rounded-md bg-secondary/10">
                        <Typography variant="p" className="italic">
                            I, <strong>{userName}</strong>, affirm that I have read the Tres Dias Statement of Belief and understand that these beliefs are the basis of what will be presented on <strong>{weekendTitle}</strong>.
                        </Typography>
                    </div>

                    <Separator />

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <FormField
                                control={form.control}
                                name="signature"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Signature (Type your full name)</FormLabel>
                                        <FormControl>
                                            <Input placeholder="John Doe" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="flex justify-end">
                                <Button type="submit" disabled={isSubmitting}>
                                    {isSubmitting ? 'Processing...' : 'Agree and Continue'}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    )
}
