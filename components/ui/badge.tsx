import * as React from "react";
import { cn } from "@/lib/utils";
export function Badge({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) { return <span className={cn("inline-flex items-center rounded-full border border-[#303530] px-2.5 py-1 mono text-[10px]", className)} {...props} />; }
