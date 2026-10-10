class AnalyticsController {
    constructor(analytecService) {
        this.analytecService = analytecService;
    }

    async getDashboard(req, res) {
        try {
            const report = await this.analytecService.execute(req.query);
            return res.status(200).json(report);
        } catch (error) {
            return res.status(error.statusCode || 500).json({
                error: error.statusCode ? error.message : "No se pudo generar el reporte analítico"
            });
        }
    }
}

module.exports = AnalyticsController;
