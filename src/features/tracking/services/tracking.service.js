import apiClient from '@/services/api/client';

export default {
    // Conductor
    sendLocation(data) {
        return apiClient.post('/tracking/location', data);
    },
    startSession(data) {
        return apiClient.post('/tracking/session/start', data);
    },
    stopSession(sessionUuid) {
        return apiClient.post('/tracking/session/stop', { session_uuid: sessionUuid });
    },

    // Admin
    getActiveDrivers() {
        return apiClient.get('/tracking/active-drivers');
    },
    getLastLocation(uuid) {
        return apiClient.get(`/tracking/last-location/${uuid}`);
    },
    getDriverHistory(uuid, params) {
        return apiClient.get(`/tracking/driver/${uuid}/history`, { params });
    },
    getDriverStats(uuid) {
        return apiClient.get(`/tracking/driver/${uuid}/stats`);
    },

    // Geocercas
    getGeofences(params) {
        return apiClient.get('/tracking/geofences', { params });
    },
    getGeofence(uuid) {
        return apiClient.get(`/tracking/geofences/${uuid}`);
    },
    createGeofence(data) {
        return apiClient.post('/tracking/geofences', data);
    },
    updateGeofence(uuid, data) {
        return apiClient.put(`/tracking/geofences/${uuid}`, data);
    },
    deleteGeofence(uuid) {
        return apiClient.delete(`/tracking/geofences/${uuid}`);
    },

    // Alertas
    getAlerts(params) {
        return apiClient.get('/tracking/alerts', { params });
    },
    markAlertRead(uuid) {
        return apiClient.patch(`/tracking/alerts/${uuid}/read`);
    },
};
