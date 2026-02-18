import React, { useState } from "react";
import axiosClient from "../api/axiosClient";

const CarfaxLookupPage = () => {
  const [vin, setVin] = useState("");
  const [result, setResult] = useState(null);

  const lookup = async () => {
    const res = await axiosClient.post("/carfax/lookup", { vin });
    setResult(res.data);
  };

  return (
    <div className="p-8">
      <h1 className="font-heading text-3xl text-midnight mb-6">
        Carfax VIN Lookup
      </h1>

      <div className="bg-white p-6 rounded-card shadow-card mb-6">
        <input
          className="border p-3 rounded-md w-full mb-4"
          placeholder="Enter VIN..."
          value={vin}
          onChange={(e) => setVin(e.target.value)}
        />

        <button
          onClick={lookup}
          className="bg-electric text-white px-6 py-2 rounded-md font-heading"
        >
          Lookup VIN
        </button>
      </div>

      {result && (
        <div className="bg-white p-6 rounded-card shadow-card">
          <h2 className="font-heading text-xl mb-4">Carfax Result</h2>

          {result.manual ? (
            <div>
              <p className="mb-4">
                Carfax API is not configured. Use the link below:
              </p>
              <a
                href="https://www.carfaxonline.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-electric underline"
              >
                Open Carfax Online
              </a>
            </div>
          ) : (
            <pre className="bg-softgray p-4 rounded-md">
              {JSON.stringify(result, null, 2)}
            </pre>
          )}
        </div>
      )}
    </div>
  );
};

export default CarfaxLookupPage;