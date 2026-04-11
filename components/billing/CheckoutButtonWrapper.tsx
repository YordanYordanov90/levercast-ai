"use client";

// Note: CheckoutButton is available in Clerk SDK but may require specific version
// For now, we use PricingTable which has built-in checkout flow
// This component is kept as a placeholder for future custom checkout button

interface CheckoutButtonWrapperProps {
  planId: string;
}

export function CheckoutButtonWrapper({ planId }: CheckoutButtonWrapperProps) {
  // PricingTable in the billing page handles the checkout flow
  // This wrapper can be expanded when Clerk exports CheckoutButton
  return null;
}
