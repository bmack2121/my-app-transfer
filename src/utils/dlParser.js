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

  // Split by line breaks to handle different scanner behaviors (\r, \n, or both)
  const lines = rawData.split(/[\r\n]+/);

  Object.entries(fieldMap).forEach(([key, code]) => {
    // Find the line that starts with the 3-character identifier
    const line = lines.find(l => l.includes(code));
    
    if (line) {
      // Extract everything after the 3-letter code
      const value = line.substring(line.indexOf(code) + 3).trim();
      data[key] = value;
    }
  });

  // ✅ MM/DD/YYYY Formatting with Validation
  if (data.dobRaw && data.dobRaw.length === 8) {
    const y = data.dobRaw.substring(0, 4);
    const m = data.dobRaw.substring(4, 6);
    const d = data.dobRaw.substring(6, 8);
    
    // Ensure the year starts with 19 or 20 to avoid junk data
    if (y.startsWith('19') || y.startsWith('20')) {
      data.dob = `${m}/${d}/${y}`;
    }
  }

  // Clean up Zip Codes (some states append 4-digit extensions)
  if (data.zip && data.zip.length > 5) {
    data.zip = data.zip.substring(0, 5);
  }

  // Combine names for the VinPro UI
  data.fullName = `${data.firstName || ''} ${data.lastName || ''}`.trim();

  return data;
};