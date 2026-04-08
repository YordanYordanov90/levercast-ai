# System Design
- Web application for busy entrepreneurs to capture, format, and publish content ideas.
- Supports raw text input and image uploads.
- Uses LLM-powered templates to generate platform-specific content (initially for LinkedIn and Twitter).
- Provides styled previews mimicking final social media appearance.
- Includes a dashboard for creating, editing, and managing content.
- Enables one-click publishing via OAuth integrations.

# Architecture pattern
Frontend: Single Page Application (SPA) using React and Next.js.

Backend: Serverless architecture hosted on Vercel, strictly utilizing standard Next.js API Route Handlers (REST-style).

LLM integration as a dedicated service utilizing the Vercel AI SDK for robust streaming.

Clear separation between client (UI) and server (API) layers.

# State management
Form State: Complex form inputs and client-side validation managed via React Hook Form.

Local UI State: Managed entirely through native React hooks (useState) to adhere to the KISS principle. No global state managers (Zustand, Redux, or Context API) are required.

Server Synchronization: UI refreshes and server data synchronization are handled natively via Next.js router.refresh() following successful API mutations.

Data Fetching: Handled via native fetch() wrapped in a custom utility for standardized error handling (no Axios, no TanStack Query).

# Data flow
Input: User submits raw text and optional image.

Validation: Inputs are strictly validated against a Zod schema on the client-side before submission.

Processing: Data is sent to the standard API endpoint, validated again with Zod, and sent to the LLM service via Vercel AI SDK.

Output: Formatted content is streamed/displayed in styled previews.

Editing: Users can make inline edits before finalizing.

Publishing: Final content is sent to the backend, stored in Neon Postgres, and pushed to social media via OAuth.

Review: Content and status (draft, pending, published) are accessible from a dashboard.

# Technical Stack
Frontend: React, Next.js, Tailwind CSS, Shadcn UI, Lucide Icons, Sonner Toast, React Hook Form, Zod.

Backend: Drizzle, Neon Postgres, Vercel, Upstash Redis (for rate limiting).

Authentication & Payment: Clerk Auth, Stripe.

Integrations: OAuth for social media (LinkedIn, Twitter), Vercel AI SDK (for LLM streams)

# Authentication Process
- User registration and login managed via Clerk Auth.
- Social media account integration via OAuth (initially LinkedIn and Twitter).
- Secure session management with token storage.
- Role-based access control for content creation and management.

# Route Design
- **/dashboard:** Central hub for accessing all features.
- **/edit-post:** Content creation interface for entering text and uploading images.
- **/posts:** List/grid view for recent posts with status indicators.
- **/settings:** User and app configuration options.
- **/templates:** Display of available LLM-powered content templates.
- Additional routes for OAuth callback and authentication flows.

# API Design
Architecture Strategy: Standard Next.js Route Handlers (app/api/...) to serve both the web frontend and future mobile applications.

Security & Validation: Every endpoint must parse and validate the incoming req.json() against a strict Zod schema before executing backend logic.

Rate Limiting: Critical endpoints, especially the Formatting Endpoint, must be protected by rate-limiting middleware (e.g., Upstash Redis) to prevent LLM credit drain and abuse.

Content Endpoints: CRUD operations for posts (create, read, update, delete).

Formatting Endpoint: Endpoint to process content using LLM-powered templates via Vercel AI SDK.

Authentication Endpoints: Manage user sessions and OAuth integrations (verifying Clerk tokens in headers).

Publishing Endpoint: Trigger one-click publish to connected social platforms.

JSON-based request/response structure with standardized HTTP error codes (e.g., 400 Bad Request for Zod failures).

# Database Design ERD
- **Users Table:**  
  - User ID, name, email, authentication tokens.
- **Posts Table:**  
  - Post ID, user ID (foreign key), raw content, formatted content, image URL, status (draft, pending, published), timestamps.
- **Templates Table:**  
  - Template ID, name, prompt details, associated metadata.
- **Social Integrations Table:**  
  - Integration ID, user ID (foreign key), platform (LinkedIn, Twitter), OAuth tokens, integration status.
- **Audit Logs Table (Optional):**  
  - Log ID, user ID, action type, timestamp, description.