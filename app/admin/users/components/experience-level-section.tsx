
import { cn } from '@/lib/utils'
import { Check, X } from 'lucide-react'

type ExperienceLevelSectionProps = {
    level: number
    totalWeekends: number
}

export function ExperienceLevelSection({
    level,
    totalWeekends,
}: ExperienceLevelSectionProps) {
    return (
        <div className="space-y-4">
            <h3 className="text-lg font-medium">Experience Level</h3>

            <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary border border-primary/20">
                    <span className="text-2xl font-bold">{level}</span>
                </div>

                <div className="space-y-1">
                    <p className="font-medium">
                        Level {level} Member
                    </p>
                    <p className="text-sm text-muted-foreground">
                        Has served on {totalWeekends} {totalWeekends === 1 ? 'weekend' : 'weekends'}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-xs text-muted-foreground mt-4">
                <div className={cn("p-2 rounded border", level === 1 ? "bg-primary/5 border-primary/30 text-primary font-medium" : "bg-muted/30 border-transparent")}>
                    Level 1
                    <div className="text-[10px] opacity-70">0-1 Weekends</div>
                </div>
                <div className={cn("p-2 rounded border", level === 2 ? "bg-primary/5 border-primary/30 text-primary font-medium" : "bg-muted/30 border-transparent")}>
                    Level 2
                    <div className="text-[10px] opacity-70">2-3 Weekends</div>
                </div>
                <div className={cn("p-2 rounded border", level === 3 ? "bg-primary/5 border-primary/30 text-primary font-medium" : "bg-muted/30 border-transparent")}>
                    Level 3
                    <div className="text-[10px] opacity-70">4+ Weekends</div>
                </div>
            </div>
        </div>
    )
}
