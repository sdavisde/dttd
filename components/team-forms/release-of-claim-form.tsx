'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
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

const releaseOfClaimSchema = z.object({
    has_special_needs: z.enum(['yes', 'no'], {
        required_error: 'Please select yes or no.',
    }),
    special_needs_description: z.string().optional(),
    signature: z.string().min(2, 'Signature is required'),
}).refine((data) => {
    if (data.has_special_needs === 'yes' && !data.special_needs_description) {
        return false
    }
    return true
}, {
    message: 'Please describe your special needs.',
    path: ['special_needs_description'],
})

type ReleaseOfClaimFormValues = z.infer<typeof releaseOfClaimSchema>

export function ReleaseOfClaimForm() {
    const router = useRouter()
    const [isSubmitting, setIsSubmitting] = useState(false)

    const form = useForm<ReleaseOfClaimFormValues>({
        resolver: zodResolver(releaseOfClaimSchema),
        defaultValues: {
            signature: '',
            special_needs_description: '',
        },
    })

    const hasSpecialNeeds = form.watch('has_special_needs')
    const currentDate = new Date().toLocaleDateString()

    const onSubmit = async (data: ReleaseOfClaimFormValues) => {
        setIsSubmitting(true)
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 500))

        // In a real implementation we would save to database here
        console.log('Release of claim agreed:', data)

        // Navigation to final step (this route will 404 for now as expected)
        router.push('/team-info/info-sheet')
        setIsSubmitting(false)
    }

    return (
        <div className="container max-w-3xl mx-auto py-8 px-4">
            <Card>
                <CardHeader>
                    <CardTitle>
                        <Typography variant="h2">Release of Claim</Typography>
                    </CardTitle>
                    <CardDescription>
                        <Typography variant="muted">
                            Please read carefully and complete the release of claim.
                        </Typography>
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="bg-muted/30 p-6 rounded-lg border space-y-4 text-sm">
                        <Typography variant="p">
                            I understand that Dusty Trails Tres Dias (DTTD) does not own Tanglewood Christian Camp where my Tres Dias Weekend will take place, and has limited control over the facility.
                        </Typography>
                        <Typography variant="p">
                            I therefore agree to <strong>RELEASE AND INDEMNIFY DTTD</strong> to the same extent that I <strong>RELEASE AND INDEMNIFY Tanglewood Christian Camp</strong> for any and all injuries which I may receive while participating in the Weekend.
                        </Typography>
                        <Typography variant="p">
                            I further and expressly <strong>RELEASE, INDEMNIFY AND HOLD HARMLESS DTTD</strong>, its officers and directors, and any volunteers participating in/on the weekend from any and all claims for personal injury, death, or loss or destruction of property.
                        </Typography>
                        <Typography variant="p">
                            I further represent and warrant that I have disclosed in writing to DTTD, on this form, each and every medical condition or issue I am aware of having which does or could require medications, special diets, sleeping accommodations, restrooms or other special considerations or facilities.
                        </Typography>
                        <Typography variant="p">
                            I am not aware of any physical, mental, or emotional limitations I have which would make it difficult for me to participate in normal day-to-day activities.
                        </Typography>
                    </div>

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                            <div className="space-y-4 p-4 border rounded-md">
                                <FormField
                                    control={form.control}
                                    name="has_special_needs"
                                    render={({ field }) => (
                                        <FormItem className="space-y-3">
                                            <FormLabel>Do you have any special needs (bottom bunk, mobility issues, special diet or medications)?</FormLabel>
                                            <FormControl>
                                                <RadioGroup
                                                    onValueChange={field.onChange}
                                                    defaultValue={field.value}
                                                    className="flex flex-col space-y-1"
                                                >
                                                    <FormItem className="flex items-center space-x-3 space-y-0">
                                                        <FormControl>
                                                            <RadioGroupItem value="yes" />
                                                        </FormControl>
                                                        <FormLabel className="font-normal">Yes</FormLabel>
                                                    </FormItem>
                                                    <FormItem className="flex items-center space-x-3 space-y-0">
                                                        <FormControl>
                                                            <RadioGroupItem value="no" />
                                                        </FormControl>
                                                        <FormLabel className="font-normal">No</FormLabel>
                                                    </FormItem>
                                                </RadioGroup>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {hasSpecialNeeds === 'yes' && (
                                    <FormField
                                        control={form.control}
                                        name="special_needs_description"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>If yes please describe:</FormLabel>
                                                <FormControl>
                                                    <Textarea
                                                        placeholder="Please describe your special needs..."
                                                        className="resize-none"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                )}
                            </div>

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
                                    onClick={() => router.push('/team-forms/commitment-form')}
                                >
                                    Back
                                </Button>
                                <Button type="submit" disabled={isSubmitting}>
                                    {isSubmitting ? 'Processing...' : 'Agree and Submit'}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    )
}
