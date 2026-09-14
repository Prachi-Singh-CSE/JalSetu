const { getIMDAlerts } = require("./imdAlertService");
const { getINCOISAlerts } = require("./incoisAlertService");

const getAlertData = async (lat, lon) => {
    try {
        const latitude = Number(lat);
        const longitude = Number(lon);

        const [imdData, incoisData] = await Promise.all([
            getIMDAlerts(latitude, longitude),
            getINCOISAlerts(latitude, longitude)
        ]);

        const allAlerts = [
            ...(imdData.alerts || []),
            ...(incoisData.alerts || [])
        ];

        // Remove expired alerts
        const now = Date.now();

        const activeAlerts = allAlerts.filter((alert) => {
            if (!alert.expiresAt) {
                return true;
            }

            return new Date(alert.expiresAt).getTime() > now;
        });

        // Highest severity
        const severityRank = {
            NONE: 0,
            LOW: 1,
            MODERATE: 2,
            HIGH: 3,
            EXTREME: 4
        };

        let highestSeverity = "NONE";

        activeAlerts.forEach((alert) => {
            const severity = alert.severity || "LOW";

            if (
                severityRank[severity] >
                severityRank[highestSeverity]
            ) {
                highestSeverity = severity;
            }
        });

        // Safety status
        let safetyStatus = "SAFE";

        if (highestSeverity === "MODERATE") {
            safetyStatus = "CAUTION";
        }

        if (highestSeverity === "HIGH") {
            safetyStatus = "DANGER";
        }

        if (highestSeverity === "EXTREME") {
            safetyStatus = "EMERGENCY";
        }

        const sourceStatuses = [
            imdData.dataStatus,
            incoisData.dataStatus
        ];

        let dataStatus = "live";

        if (
            sourceStatuses.includes("error") &&
            sourceStatuses.every(
                (status) => status === "error"
            )
        ) {
            dataStatus = "error";
        } else if (
            sourceStatuses.includes("unavailable")
        ) {
            dataStatus = "partial";
        }

        return {
            location: {
                latitude,
                longitude
            },

            alerts: activeAlerts,

            alertCount: activeAlerts.length,

            highestSeverity,

            safety: {
                status: safetyStatus,
                message:
                    safetyStatus === "SAFE"
                        ? "No active marine alerts detected"
                        : safetyStatus === "CAUTION"
                        ? "Moderate marine conditions detected"
                        : safetyStatus === "DANGER"
                        ? "Dangerous marine conditions detected"
                        : "Emergency marine alert detected"
            },

            sources: [
                imdData,
                incoisData
            ],

            dataStatus,

            generatedAt: new Date().toISOString()
        };

    } catch (error) {
        console.error(
            "❌ Alert Service Error:",
            error.message
        );

        return {
            location: {
                latitude: Number(lat),
                longitude: Number(lon)
            },

            alerts: [],

            alertCount: 0,

            highestSeverity: "NONE",

            safety: {
                status: "UNKNOWN",
                message: "Alert data temporarily unavailable"
            },

            sources: [],

            dataStatus: "error",

            generatedAt: new Date().toISOString()
        };
    }
};

module.exports = {
    getAlertData
};