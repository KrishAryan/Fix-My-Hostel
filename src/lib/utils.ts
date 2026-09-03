import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export const getCategoryWeight = (category: string) => {
    switch (category) {
        case "Internet": return 5;
        case "Electrical": case "Security": case "Pest Control": return 4;
        case "Plumbing": case "Cleaning": return 3;
        case "Furniture": return 2;
        default: return 1;
    }
};

export const calculatePriority = (
    severity: number,
    votes: number = 0,
    daysPending: number = 0,
    category: string = "General"
): { score: number; label: string } => {
    const rawScore = (0.4 * severity) + (0.3 * votes) + (0.2 * daysPending);
    const score = Number(rawScore.toFixed(1));

    let label = "Low Priority";
    if (severity >= 9 || score >= 8.0) {
        label = "Critical Priority";
    } else if (severity >= 7 || score >= 6.0) {
        label = "High Priority";
    } else if (severity >= 4 || score >= 3.5) {
        label = "Medium Priority";
    } else {
        label = "Low Priority";
    }

    return { score, label };
};
