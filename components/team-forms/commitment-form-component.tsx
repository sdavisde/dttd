'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
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

// Placeholder commitments - these will likely need to be updated with real content
// Update commitments based on user provided content
const COMMITMENTS = [
    'I recognize that the rectors and head chas are responsible for all aspects of the weekend under the direction of the Tres Dias Secretariat and will submit to their authority.',
    'I will be faithful to my responsibilities and work with the others on the team with a spirit of cooperation, unity, and love.',
    'I will commit to attend a minimum of 3 of the 4 team meetings.',
    'I understand the “weekend” is from send-off until the last verse of “Amazing Grace” at closing and I will commit to attend the complete weekend.',
    'I will endeavor to listen and love, helping breakdown the walls that stand between Christ and the candidates.',
    'I will pray for the team and candidates and endeavor to serve them as Christ would.',
    'I am leading a life of piety, study and action.',
    'I am regularly attending and serving in my local church.',
    'My household is in order and will not be harmed by my attendance of team meetings and participation on the weekend.',
    'I agree that I am responsible for paying my team fee of $185 prior to the weekend.'
]

// Create a schema where all commitments must be true and signature is required
const commitmentSchema = z.object({
    commitments: z.array(z.boolean()).refine((val) => val.every((v) => v === true), {
        message: 'You must agree to all commitments to proceed.',
    }),
    signature: z.string().min(2, 'Signature is required'),
})

type CommitmentFormValues = z.infer<typeof commitmentSchema>

interface CommitmentFormProps {
    userName: string
    weekendTitle: string
    userRole: string
}

export function CommitmentFormComponent({ userName, weekendTitle, userRole }: CommitmentFormProps) {
    const router = useRouter()
    const [isSubmitting, setIsSubmitting] = useState(false)

    const form = useForm<CommitmentFormValues>({
        resolver: zodResolver(commitmentSchema),
        defaultValues: {
            commitments: COMMITMENTS.map(() => false),
            signature: '',
        },
    })

    const onSubmit = async (data: CommitmentFormValues) => {
        setIsSubmitting(true)
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 500))

        // In a real implementation we would save to database here
        console.log('Commitments agreed:', data)

        // Navigation to next step
        router.push('/team-forms/release-of-claim')
        setIsSubmitting(false)
    }

    const currentDate = new Date().toLocaleDateString()

    return (
        <div className="container max-w-3xl mx-auto py-8 px-4">
            <Card>
                <CardHeader>
                    <CardTitle>
                        <Typography variant="h2">Team Commitment Form</Typography>
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="bg-muted/30 p-6 rounded-lg border space-y-4">
                        <Typography variant="p">
                            I, <strong>{userName}</strong>, affirm that I am a Lay / Clergy person who is consistent in my walk with Christ, faithful in my local church, supportive of my pastor and an active participant, endeavoring to be an Authentic Christian Leader in my personal Piety, Study and Action and will strive to present the highest moral standard before the team and candidates; have attended a Tres Dias or other approved similar weekend; have been selected by the rector and approved by the Tres Dias Secretariat, agree to serve as <strong>{userRole}</strong> on <strong>{weekendTitle}</strong>.
                        </Typography>
                        <Typography variant="p" className="font-medium italic">
                            Please read and check each blank affirming that you are in compliance.
                        </Typography>
                    </div>

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <div className="space-y-4">
                                {COMMITMENTS.map((commitment, index) => (
                                    <FormField
                                        key={index}
                                        control={form.control}
                                        name={`commitments.${index}`}
                                        render={({ field }) => (
                                            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                                <FormControl>
                                                    <Checkbox
                                                        checked={field.value}
                                                        onCheckedChange={field.onChange}
                                                    />
                                                </FormControl>
                                                <div className="space-y-1 leading-none pt-1">
                                                    <FormLabel className="text-sm font-normal cursor-pointer">
                                                        {commitment}
                                                    </FormLabel>
                                                </div>
                                            </FormItem>
                                        )}
                                    />
                                ))}
                            </div>

                            {form.formState.errors.commitments && (
                                <p className="text-sm font-medium text-destructive">
                                    {form.formState.errors.commitments.message || "You must agree to all commitments."}
                                </p>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-secondary/10 rounded-md items-end">
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
                                <div className="mb-2">
                                    <Typography variant="small" className="text-muted-foreground block mb-1">Date</Typography>
                                    <div className="h-10 flex items-center px-3 border rounded-md bg-muted text-muted-foreground">
                                        {currentDate}
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end gap-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => router.push('/team-forms/statement-of-belief')}
                                >
                                    Back
                                </Button>
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
