import { Share } from '@capacitor/share';
import { Clipboard } from '@capacitor/clipboard'; // Recommended addition

/**
 * Formats and shares a professional digital brochure with the customer.
 */
export const shareEBrochure = async (customer, vehicle, deal) => {
  // Ensure we are pulling from the correct model structure
  const payment = deal.structure?.monthlyPayment || deal.monthlyPayment || 0;
  const down = deal.structure?.downPayment || deal.downPayment || 0;
  const term = deal.structure?.termMonths || deal.termMonths || 60;
  
  // Dynamic URL construction
  const brochureUrl = `https://vinpro-app.com/inventory/${vehicle.vin || vehicle._id}`;

  const shareText = `
🚗 *VinPro Digital Quote* 🚗

Hey ${customer.firstName || 'there'}, it was great working with you! 

I've put together the deal structure for the *${vehicle.year} ${vehicle.make} ${vehicle.model}*:

✅ *The Numbers:*
• Monthly: $${Math.round(payment)}
• Down Payment: $${down.toLocaleString()}
• Term: ${term} Months

🔗 *View Specs & Carfax:*
${brochureUrl}

Reply to this message if you have any questions!
— ${customer.assignedTo?.name || 'Your Sales Team'} at VinPro
  `.trim();

  try {
    const canShare = await Share.canShare();
    
    if (canShare.value) {
      // Native Mobile Share (iOS/Android)
      await Share.share({
        title: `Quote: ${vehicle.make} ${vehicle.model}`,
        text: shareText,
        url: brochureUrl,
        dialogTitle: 'Send Digital Brochure',
      });
    } else {
      // Desktop Fallback: Copy to Clipboard so they can paste it into an email/CRM
      await Clipboard.write({ string: shareText });
      alert("Brochure copied to clipboard! You can now paste it into your message.");
    }
  } catch (err) {
    console.error('Sharing failed:', err);
  }
};