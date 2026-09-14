const axios = require("axios");

const DATASET = "noaacwSMAPsssDaily";

const BASE_URL =
    `https://coastwatch.noaa.gov/erddap/griddap/${DATASET}.csv`;

const getSSSData = async (lat, lon) => {
    try {
        const latitude = Number(lat);
        const longitude = Number(lon);

        if (
            !Number.isFinite(latitude) ||
            !Number.isFinite(longitude)
        ) {
            throw new Error("Invalid coordinates");
        }

        /*
         * NOAA SMAP SSS:
         * 0.25° grid
         *
         * Search nearby grid cells because
         * satellite products can contain NaN
         * over individual cells.
         */

        const baseLat =
            Math.round(latitude * 4) / 4;

        const baseLon =
            Math.round(longitude * 4) / 4;

        const offsets = [
            [0, 0],
            [0, 1],
            [0, -1],
            [1, 0],
            [-1, 0],
            [1, 1],
            [1, -1],
            [-1, 1],
            [-1, -1]
        ];

        for (const [latOffset, lonOffset] of offsets) {

            const gridLat =
                baseLat + latOffset * 0.25;

            const gridLon =
                baseLon + lonOffset * 0.25;

            const query =
                `sss[(2026-09-10T12:00:00Z)][(0)][(${gridLat})][(${gridLon})]`;

            const url =
                `${BASE_URL}?${encodeURIComponent(query)}`;

            console.log(
                "🌊 NOAA SSS request:",
                gridLat,
                gridLon
            );

            try {

                const response =
                    await axios.get(url, {
                        timeout: 10000,
                        responseType: "text"
                    });

                const text =
                    response.data;

                const lines =
                    text
                        .trim()
                        .split("\n")
                        .filter(Boolean);

                if (lines.length < 2) {
                    continue;
                }

                const headers =
                    lines[0]
                        .split(",")
                        .map(value => value.trim());

                const values =
                    lines[1]
                        .split(",")
                        .map(value => value.trim());

                const sssIndex =
                    headers.findIndex(
                        header =>
                            header.toLowerCase() === "sss"
                    );

                if (sssIndex === -1) {
                    continue;
                }

                const value =
                    Number(values[sssIndex]);

                /*
                 * Skip NaN / missing satellite cells.
                 */

                if (!Number.isFinite(value)) {
                    console.log(
                        "⚠️ Missing SSS at:",
                        gridLat,
                        gridLon
                    );

                    continue;
                }

                console.log(
                    "✅ Valid SSS found:",
                    value
                );

                return {
                    value:
                        Number(value.toFixed(3)),

                    unit:
                        "PSU",

                    source:
                        "NOAA SMAP",

                    dataStatus:
                        "live",

                    requestedLocation: {
                        latitude,
                        longitude
                    },

                    dataLocation: {
                        latitude: gridLat,
                        longitude: gridLon
                    },

                    retrievedAt:
                        new Date().toISOString()
                };

            } catch (cellError) {

                console.log(
                    "⚠️ SSS cell unavailable:",
                    gridLat,
                    gridLon,
                    cellError.message
                );

                continue;
            }
        }

        /*
         * No valid nearby satellite cell found.
         */

        return {
            value: null,

            unit:
                "PSU",

            source:
                "NOAA SMAP",

            dataStatus:
                "unavailable",

            requestedLocation: {
                latitude,
                longitude
            },

            reason:
                "No valid NOAA SMAP SSS value found in nearby grid cells",

            retrievedAt:
                new Date().toISOString()
        };

    } catch (error) {

        console.error(
            "❌ NOAA SSS Error:",
            error.message
        );

        return {
            value: null,

            unit:
                "PSU",

            source:
                "NOAA SMAP",

            dataStatus:
                "error",

            reason:
                error.message,

            latitude:
                Number(lat),

            longitude:
                Number(lon)
        };
    }
};

module.exports = {
    getSSSData
};