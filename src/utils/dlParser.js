/**
 * AAMVA PDF417 Parser for US/Canada Driver's Licenses
 * Optimized for VinPro Lead Fast-Pass
 */
export const parseDLData = (rawData) => {
  if (!rawData) return null;

  // AAMVA strings usually start with '@' and contain 'ANSI ' or 'DL'
  if (!rawData.includes('ANSI') && !rawData.startsWith('@')) {
    console.warn("Raw data might not be standard AAMVA format, attempting best-effort parse.");
  }

  const data = {};
  
  /**
   * fieldMap maps your app's keys to AAMVA Element Identifiers.
   * DCS: Last Name, DAC: First Name, DAD: Middle Name
   * DBB: DOB, DAG: Street, DAI: City, DAJ: State, DAK: Zip
   */
  const fieldMap = {
    lastName: "DCS",
    firstName: "DAC",
    middleName: "DAD",
    address: "DAG",
    city: "DAI",
    state: "DAJ",
    zip: "DAK",
    dobRaw: "DBB"
  };

  // Split by line breaks. 
  const lines = rawData.split(/[\r\n]+/);

  Object.entries(fieldMap).forEach(([key, code]) => {
    // ✅ FIX: Use startsWith instead of includes to prevent false-positive matches
    const line = lines.find(l => l.trim().startsWith(code));
    
    if (line) {
      // Extract everything exactly after the 3-letter code
      data[key] = line.trim().substring(3).trim();
    } else {
      // ✅ FIX: Fallback for un-split strings (some Android scanners strip newlines)
      const regex = new RegExp(`${code}(.*?)(?=[A-Z]{3}|$)`);
      const match = rawData.match(regex);
      if (match && match[1]) {
         data[key] = match[1].trim();
      }
    }
  });

  // ✅ FIX: Smarter Date of Birth Parsing (Handles both YYYYMMDD and MMDDYYYY)
  if (data.dobRaw && data.dobRaw.length === 8) {
    const firstFour = data.dobRaw.substring(0, 4);
    
    if (firstFour.startsWith('19') || firstFour.startsWith('20')) {
      // Format is YYYYMMDD
      const y = firstFour;
      const m = data.dobRaw.substring(4, 6);
      const d = data.dobRaw.substring(6, 8);
      data.dob = `${m}/${d}/${y}`;
    } else {
      // Format is MMDDYYYY
      const m = data.dobRaw.substring(0, 2);
      const d = data.dobRaw.substring(2, 4);
      const y = data.dobRaw.substring(4, 8);
      data.dob = `${m}/${d}/${y}`;
    }
  }

  // Clean up Zip Codes (strip the +4 extension for cleaner CRM data)
  if (data.zip && data.zip.length > 5) {
    data.zip = data.zip.substring(0, 5);
  }

  // ✅ FIX: Title Case formatter for ALL CAPS AAMVA data
  const toTitleCase = (str) => {
    if (!str) return '';
    return str.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
  };

  data.firstName = toTitleCase(data.firstName);
  data.lastName = toTitleCase(data.lastName);
  data.middleName = toTitleCase(data.middleName);
  data.city = toTitleCase(data.city);
  data.address = toTitleCase(data.address);

  // Combine names for the VinPro UI
  data.fullName = `${data.firstName || ''} ${data.lastName || ''}`.trim();

  return data;
};