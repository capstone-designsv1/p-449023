
import { ChallengeDetails } from "@/context/ChallengeContext";

// Sample data - this would typically come from a database
export const challengeDetails: Record<string, ChallengeDetails> = {
  "uber-1": {
    id: "uber-1",
    title: "Redesign the Ride Ordering Experience",
    company: "Uber",
    description: "Create a simplified ride ordering flow that improves the user experience for first-time users.",
    instructions: [
      "Start by identifying the pain points in the current flow",
      "Sketch the main screens of your new design",
      "Focus on simplifying the process for new users",
      "Consider accessibility in your design"
    ]
  },
  "airbnb-1": {
    id: "airbnb-1",
    title: "Design a New Feature for Hosts",
    company: "Airbnb",
    description: "Design a feature that helps hosts better manage their property bookings and guest communications.",
    instructions: [
      "Research the current host experience",
      "Identify key pain points for hosts",
      "Sketch your solution's main flows",
      "Consider how this integrates with the existing platform"
    ]
  },
  "meta-1": {
    id: "meta-1",
    title: "Improve Group Interaction in VR",
    company: "Meta",
    description: "Conceptualize improvements to how users interact in group settings within a VR environment.",
    instructions: [
      "Define the current limitations of group interactions in VR",
      "Sketch new interaction models",
      "Consider both verbal and non-verbal communication",
      "Think about how to make interactions feel natural"
    ]
  },
  "uber-2": {
    id: "uber-2",
    title: "Design for Accessibility",
    company: "Uber",
    description: "Improve accessibility of the app for users with visual impairments.",
    instructions: [
      "Identify key accessibility issues in the current app",
      "Sketch solutions that address these issues",
      "Consider how your solutions benefit all users",
      "Think about implementation feasibility"
    ]
  },
  "airbnb-2": {
    id: "airbnb-2",
    title: "Streamline the Booking Process",
    company: "Airbnb",
    description: "Simplify the booking flow to reduce drop-offs and increase conversion.",
    instructions: [
      "Map out the current booking flow",
      "Identify steps that cause user drop-off",
      "Sketch a streamlined flow",
      "Consider how to maintain necessary information gathering"
    ]
  },
  "meta-2": {
    id: "meta-2",
    title: "Cross-Platform Design System",
    company: "Meta",
    description: "Design a system that maintains consistent user experience across mobile, desktop, and VR.",
    instructions: [
      "Define the core elements of your design system",
      "Sketch how components adapt across platforms",
      "Consider the unique constraints of each platform",
      "Demonstrate how your system maintains brand consistency"
    ]
  }
};
