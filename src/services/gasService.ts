import { ElectorRecord, OperationResponse } from "../types";

/**
 * Replace this URL with your deployed Google Apps Script Web App URL.
 * To deploy: In GAS Editor -> Deploy -> New Deployment -> Web App
 * Set "Execute as" to "Me" and "Who has access" to "Anyone"
 */
const GAS_DEPLOY_URL = "https://script.google.com/macros/s/AKfycbwFxtMAHIYFD7YknXSJRWQx7YcCzLB3MCFpNlYsKMBLOXi9tWwLMeUg3Q0fpLE3LGff/exec";

export const gasService = {
  async fetchRecord(epicNumber: string): Promise<OperationResponse> {
    if (GAS_DEPLOY_URL.includes("YOUR_GOOGLE_APPS_SCRIPT_URL_HERE")) {
      return { success: false, message: "Please configure the Google Apps Script URL in gasService.ts" };
    }

    try {
      const response = await fetch(`${GAS_DEPLOY_URL}?epicNumber=${encodeURIComponent(epicNumber)}`);
      if (!response.ok) throw new Error("Network response was not ok");
      return await response.json();
    } catch (error) {
      console.error("Fetch record error:", error);
      return { success: false, message: "Failed to fetch record. Check CORS or URL." };
    }
  },

  async updateMobileNumber(epicNumber: string, mobileNumber: string): Promise<OperationResponse> {
    if (GAS_DEPLOY_URL.includes("YOUR_GOOGLE_APPS_SCRIPT_URL_HERE")) {
      return { success: false, message: "Please configure the Google Apps Script URL in gasService.ts" };
    }

    try {
      // GAS doPost usually requires text/plain and a redirect follow if using fetch
      // But standard GAS web apps are easier to interact with via a POST if they don't have CORS issues.
      // Note: GAS web apps often redirect. Fetch handles redirects by default.
      const response = await fetch(GAS_DEPLOY_URL, {
        method: "POST",
        mode: "no-cors", // Note: no-cors means we can't read the response body. 
        // For GAS, often we use JSONP or a simple POST without expecting a read back if CORS isn't set up.
        // However, many modern GAS setups work with simple POST if the browser allows.
        body: JSON.stringify({ epicNumber, mobileNumber }),
        headers: {
          "Content-Type": "text/plain", // Crucial for GAS doPost
        },
      });

      // Since we use no-cors to avoid preflight issues with GAS, we can't easily read JSON result.
      // If the user wants a real result, they might need a proxy or the app script needs specific headers.
      // For now, we'll assume success if no error thrown, but we'll try standard CORS first.
      
      const corsResponse = await fetch(GAS_DEPLOY_URL, {
        method: "POST",
        body: JSON.stringify({ epicNumber, mobileNumber }),
        headers: {
          "Content-Type": "text/plain",
        },
      });
      
      if (!corsResponse.ok) throw new Error("Update failed");
      return await corsResponse.json();
    } catch (error) {
      console.error("Update mobile error:", error);
      return { success: false, message: "Update might have failed or CORS issue. Check Google Sheet." };
    }
  }
};
