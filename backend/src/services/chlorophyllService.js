const DATASET = "noaacwNPPN20VIIRSDINEOFDaily";

const NOAA_URL =
    `https://coastwatch.noaa.gov/erddap/griddap/${DATASET}.csv`;

const getChlorophyllData = async (lat, lon) => {
    const latitude = Number(lat);
    const longitude = Number(lon);

    try {
        // NOAA endpoint
        // NOTE: NOAA may be unavailable from local network.
        // We keep a fallback so PFZ does not break.

        const controller = new AbortController();

        const timeout = setTimeout(() => {
            controller.abort();
        }, 8000);

        /*
         * We currently use a known recent date.
         * Once NOAA connectivity is available,
         * we will make this dynamically discover the latest date.
         */
        const date = "2026-08-21T12:00:00Z";

        const query =
            `chlor_a[(${date})][(${latitude})][(${longitude})]`;

        const url =
            `${NOAA_URL}?${encodeURIComponent(query)}`;

        const response = await fetch(url, {
            signal: controller.signal
        });

        clearTimeout(timeout);

        if (!response.ok) {
            throw new Error(
                `NOAA HTTP ${response.status}`
            );
        }

        const text = await response.text();

        const lines = text
            .trim()
            .split("\n")
            .filter(Boolean);

        if (lines.length < 3) {
            throw new Error("No NOAA chlorophyll data");
        }

        const headers = lines[0].split(",");
        const values = lines[2].split(",");

        const chlorophyllIndex =
            headers.findIndex(
                h => h.trim() === "chlor_a"
            );

        if (chlorophyllIndex === -1) {
            throw new Error("chlor_a not found");
        }

        const value =
            Number(values[chlorophyllIndex]);

        if (!Number.isFinite(value)) {
            throw new Error("NOAA returned NaN");
        }

        return {
            value: Number(value.toFixed(3)),
            unit: "mg/m³",
            source: "NOAA CoastWatch VIIRS NRT DINEOF",
            dataStatus: "live",
            date,
            retrievedAt: new Date().toISOString()
        };

    } catch (error) {

        console.log(
            "⚠️ NOAA Chlorophyll unavailable:",
            error.message
        );

        // Safe fallback for development/demo
        return {
            value: 0.8,
            unit: "mg/m³",
            source: "Demo Fallback",
            dataStatus: "fallback",
            reason: "NOAA chlorophyll service unavailable",
            retrievedAt: new Date().toISOString()
        };
    }
};

module.exports = {
    getChlorophyllData
};