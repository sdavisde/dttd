'use client'

import { Pie, PieChart, Cell, Label } from 'recharts'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import { Badge } from '@/components/ui/badge'
import { ExperienceDistribution } from '@/services/master-roster/types'

type ExperienceDistributionChartProps = {
  distribution: ExperienceDistribution
}

const chartConfig = {
  count: {
    label: 'Members',
  },
  level1: {
    label: 'Level 1',
    color: 'var(--experience-level-1)',
  },
  level2: {
    label: 'Level 2',
    color: 'var(--experience-level-2)',
  },
  level3: {
    label: 'Level 3',
    color: 'var(--experience-level-3)',
  },
} satisfies ChartConfig

export function ExperienceDistributionChart({
  distribution,
}: ExperienceDistributionChartProps) {
  const chartData = [
    {
      level: 'level1',
      label: 'Level 1',
      count: distribution.level1.count,
      percentage: distribution.level1.percentage,
      fill: 'var(--color-level1)',
    },
    {
      level: 'level2',
      label: 'Level 2',
      count: distribution.level2.count,
      percentage: distribution.level2.percentage,
      fill: 'var(--color-level2)',
    },
    {
      level: 'level3',
      label: 'Level 3',
      count: distribution.level3.count,
      percentage: distribution.level3.percentage,
      fill: 'var(--color-level3)',
    },
  ]

  if (distribution.total === 0) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Experience Distribution</CardTitle>
          <CardDescription>No active team members</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <>
      {/* Mobile: Compact badge stats */}
      <div className="md:hidden">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-muted-foreground">Experience:</span>
          {chartData.map((entry, index) => (
            <Badge
              key={entry.level}
              variant="secondary"
              className="font-medium text-xs"
              style={{
                backgroundColor: `var(--experience-level-${index + 1})`,
                color: `var(--experience-level-${index + 1}-fg)`,
              }}
            >
              L{index + 1}: {entry.count} ({entry.percentage}%)
            </Badge>
          ))}
        </div>
      </div>

      {/* Desktop: Full pie chart with legend */}
      <Card className="hidden md:block">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Experience Distribution</CardTitle>
          <CardDescription>
            {distribution.total} active team member
            {distribution.total !== 1 ? 's' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-row items-center gap-4">
            {/* Pie Chart */}
            <ChartContainer config={chartConfig} className="h-[200px] w-[200px]">
              <PieChart>
                <ChartTooltip
                  cursor={false}
                  content={
                    <ChartTooltipContent
                      formatter={(value, name, item) => (
                        <div className="flex items-center justify-between gap-4">
                          <span>
                            {chartConfig[name as keyof typeof chartConfig]
                              ?.label ?? name}
                          </span>
                          <span className="font-mono font-medium">
                            {value} ({item.payload.percentage}%)
                          </span>
                        </div>
                      )}
                    />
                  }
                />
                <Pie
                  data={chartData}
                  dataKey="count"
                  nameKey="level"
                  innerRadius={50}
                  outerRadius={80}
                  strokeWidth={2}
                  stroke="var(--background)"
                >
                  {chartData.map((entry) => (
                    <Cell key={entry.level} fill={entry.fill} />
                  ))}
                  <Label
                    content={({ viewBox }) => {
                      if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                        return (
                          <text
                            x={viewBox.cx}
                            y={viewBox.cy}
                            textAnchor="middle"
                            dominantBaseline="middle"
                          >
                            <tspan
                              x={viewBox.cx}
                              y={viewBox.cy}
                              className="fill-foreground text-2xl font-bold"
                            >
                              {distribution.total}
                            </tspan>
                            <tspan
                              x={viewBox.cx}
                              y={(viewBox.cy ?? 0) + 20}
                              className="fill-muted-foreground text-xs"
                            >
                              members
                            </tspan>
                          </text>
                        )
                      }
                    }}
                  />
                </Pie>
              </PieChart>
            </ChartContainer>

            {/* Legend with counts and percentages */}
            <div className="flex flex-col gap-2">
              {chartData.map((entry) => (
                <div key={entry.level} className="flex items-center gap-3">
                  <div
                    className="h-3 w-3 rounded-sm shrink-0"
                    style={{ backgroundColor: entry.fill }}
                  />
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium w-14">
                      {entry.label}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {entry.count} ({entry.percentage}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  )
}
