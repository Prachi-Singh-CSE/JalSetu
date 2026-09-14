const {
    getAlertData
} = require("../services/alertService");

const getAlerts = async (req, res) => {
    try {
        const { lat, lon } = req.query;

        const data =
            await getAlertData(lat, lon);

        return res.status(200).json({
            success: true,
            data
        });

    } catch (error) {
        console.error(
            "Alert Controller Error:",
            error.message
        );

        return res.status(500).json({
            success: false,
            message: "Unable to fetch alert data"
        });
    }
};

module.exports = {
    getAlerts
};