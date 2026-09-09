/**
 * @author Darwin Montes
 * @version 1.0.0
 * @created_at 2026-06-30
 * @module Features.Dashboard
 * @resource DashboardStore
 */

import { defineStore } from 'pinia';
import dashboardService from '../services/dashboard.service';

export const useDashboardStore = defineStore('dashboard', {
    state: () => ({
        stats: [],
        metricData: {
            revenue: { mainValue: '$0', mainLabel: '', goal: 0, goalLabel: '', breakdown: [] },
            vehicles: { mainValue: '0', mainLabel: '', goal: 0, goalLabel: '', breakdown: [] },
            fuec: { mainValue: '0', mainLabel: '', goal: 0, goalLabel: '', breakdown: [] },
            profit: { mainValue: '$0', mainLabel: '', goal: 0, goalLabel: '', breakdown: [] },
        },
        recentContracts: [],
        activities: [],
        alerts: [],
        isLoading: false,
    }),

    actions: {
        async fetchDashboardData(days = 30) {
            this.isLoading = true;
            try {
                const [summaryRes, activityRes, alertsRes] = await Promise.all([
                    dashboardService.getSummary(days),
                    dashboardService.getRecentActivity(),
                    dashboardService.getAlerts()
                ]);

                if (summaryRes.data?.success) {
                    this.stats = summaryRes.data.data?.stats ?? [];
                }

                if (activityRes.data?.success) {
                    this.recentContracts = activityRes.data.data?.contracts ?? [];
                    this.activities     = activityRes.data.data?.activities ?? [];
                }

                if (alertsRes.data?.success) {
                    this.alerts = alertsRes.data.data ?? [];
                }
            } catch (error) {
                console.error('Error al cargar datos del dashboard', error);
            } finally {
                this.isLoading = false;
            }
        }
    }
});
