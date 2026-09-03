# 🏢 Fix My Hostel

> An AI-powered smart hostel complaint management and resolution tracking system built with Next.js, Tailwind CSS, TypeScript, and Google Gemini.

---

## 🌟 Key Features

* **AI-Powered Assistant (FixBot):** Integrated with Google Gemini to guide students on rules, emergency steps, and complaint troubleshooting.
* **Role-Based Authentication:** Dedicated portals for Students and Hostel Administration.
* **Dynamic Priority Formula:** Automatically scores and triages complaints based on severity level, category weight, upvotes, and time elapsed.
* **Real-Time Tracking & Filters:** Track issues from reported, in-progress, to resolved with live filtering by block, category, and status.
* **Community Upvoting:** Allows hostel residents to upvote common issues to highlight critical infrastructure problems.
* **Modern Responsive UI:** Built with Tailwind CSS and Lucide icons for desktop and mobile devices.

---

## 🛠️ Tech Stack

* **Framework:** Next.js (App Router)
* **Language:** TypeScript
* **Styling:** Tailwind CSS
* **Icons:** Lucide React
* **AI Integration:** Google Gemini API (`@google/genai`)
* **Security:** Bcrypt.js for encrypted credential verification
* **Deployment:** Vercel

---

## 🚀 Getting Started

Follow these steps to set up and run the project locally:

### 1. Clone the Repository

Clone the repository and navigate to the project directory.

`git clone https://github.com/KrishAryan/Fix-My-Hostel.git`

`cd Fix-My-Hostel`

### 2. Install Dependencies

Install all the required project dependencies.

`npm install`

### 3. Configure Environment Variables

Create a `.env.local` file in the root directory and add the required environment variables.

`GEMINI_API_KEY=your_gemini_api_key`

> Replace `your_gemini_api_key` with your actual Google Gemini API key.

### 4. Run the Development Server

Start the Next.js development server.

`npm run dev`

The application will be available at **http://localhost:3000**.
