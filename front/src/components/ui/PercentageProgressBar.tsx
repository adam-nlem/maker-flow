import { getWidthClassFromPercentage } from "~/helpers/percentageHelper";

interface PercentageProgressBarProps {
  name: string;
  percentage: number;
}

export function PercentageProgressBar({ name, percentage }: PercentageProgressBarProps) {
  return (
    <div className="flex flex-col w-full">
      <h1 className="text-body-sm">{name}</h1>
      <h2 className="text-heading-md">{percentage}%</h2>
      <div className="w-full h-2 bg-zinc-200 rounded-full mb-3" >
        <div className={`${getWidthClassFromPercentage(percentage)} h-full bg-primary rounded-full`}></div>
      </div>
    </div>


  )
}
