export const faqDatabase = [
    {
        keywords: ["raise complaint", "how to raise", "create ticket", "new complaint"],
        response: "To raise a complaint, go to the Student Dashboard and click the 'Raise Complaint' button. Fill in your hostel, room, problem category, severity, and description."
    },
    {
        keywords: ["priority calculated", "how priority", "algorithm"],
        response: "Priority = (0.4 × Severity) + (0.3 × Votes) + (0.2 × Days Pending). Higher scores indicate critical urgency."
    },
    {
        keywords: ["priority levels", "what do priority levels mean"],
        response: "Scores ≥ 8.5 are Critical, ≥ 6.0 are High, ≥ 4.0 are Medium, and below 4.0 are Low priority."
    },
    {
        keywords: ["vote", "how to vote", "upvote", "affecting priority"],
        response: "You can vote for common issues by clicking the thumbs-up button on the complaint card. More votes increase the priority score by 0.3 per vote."
    },
    {
        keywords: ["track", "status", "what do statuses mean"],
        response: "Cards show real-time statuses like 'Pending', 'In Progress', or 'Resolved'. You can track your issue directly from your dashboard."
    },
    {
        keywords: ["assign worker", "how to assign"],
        response: "For Admins: Go to the 'All Tickets' tab, find the ticket, and use the dropdown action menu to assign a specific worker (e.g., Plumber, Electrician)."
    },
    {
        keywords: ["critical mean", "what does critical mean"],
        response: "Critical means the priority score is above 8.5, demanding immediate attention from available workers."
    },
    {
        keywords: ["hi", "hello", "hey", "greetings"],
        response: "Hello! I am your Fix My Hostel Assistant. How can I help you today?"
    },
    {
        keywords: ["how are you", "how are you doing", "how are things"],
        response: "I am functioning at 100% efficiency and ready to help you resolve hostel issues!"
    },
    {
        keywords: ["thank you", "thanks", "appreciate it"],
        response: "You are welcome! Let me know if you need anything else."
    }
];

export function findFixBotResponse(query: string): string {
    const lowercaseQuery = query.toLowerCase();

    // specific strict check for 'hi' to avoid matching 'this' or 'while'
    if (lowercaseQuery === 'hi' || lowercaseQuery === 'hello' || lowercaseQuery === 'hey') {
        return "Hello! I am your Fix My Hostel Assistant. How can I help you today?";
    }

    // specific strict check for 'how are you'
    if (lowercaseQuery === 'how are you' || lowercaseQuery === 'how are you?') {
        return "I am functioning at 100% efficiency and ready to help you resolve hostel issues!";
    }

    for (const faq of faqDatabase) {
        if (faq.keywords.some(keyword => lowercaseQuery.includes(keyword))) {
            return faq.response;
        }
    }

    return "I am still learning! For now, I can help you check complaint status, report emergencies, or provide hostel rules.";
}
