/**
 * AAMVA PDF417 Parser for US/Canada Driver's Licenses
 * Optimized for VinPro Lead Fast-Pass
 */
export const parseDLData = (rawData) => {
  if (!rawData || !rawData.startsWith('@')) {
    console.error("Invalid AAMVA Data Format");
    return null;
  }

  const data = {};
  
  /**
   * AAMVA Standard Element Identifiers
   * DCS: Last Name, DAC: First Name, DAD: Middle Name
   * DBB: DOB (YYYYMMDD), DAG: Address, DAI: City, DAJ: State, DAK: Zip
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

  Object.entries(fieldMap).forEach(([key, code]) => {
    // Regex looks for the 3-letter code and captures everything until the next line break
    // Some scanners use \r, others \n, or both.
    const regex = new RegExp(`${code}([^\\r\\n]*)`);
    const match = rawData.match(regex);
    
    if (match && match[1]) {
      data[key] = match[1].trim();
    }
  });

  // ✅ Fix: Format DOB from YYYYMMDD to MM/DD/YYYY for your Lead Form
  if (data.dobRaw && data.dobRaw.length === 8) {
    const y = data.dobRaw.substring(0, 4);
    const m = data.dobRaw.substring(4, 6);
    const d = data.dobRaw.substring(6, 8);
    data.dob = `${m}/${d}/${y}`;
  }

  // Combine names for a "Full Name" display if needed
  data.fullName = `${data.firstName || ''} ${data.lastName || ''}`.trim();

  return data;
};